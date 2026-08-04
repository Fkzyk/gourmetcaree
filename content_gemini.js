// gemini.google.com で動作するコンテンツスクリプト（isolated world）
// chrome.runtime 通信・DOM操作を担当
// テキスト挿入は content_gemini_main.js (MAIN world) に postMessage で委譲

let isProcessing = false;
let runToken = 0; // 依頼ごとの通し番号(古い処理を打ち切るために使う)

// ── テキスト挿入（MAIN world 経由）────────────────────────
function insertPrompt(text) {
  return new Promise((resolve) => {
    const handler = (e) => {
      if (e.source !== window || e.data?.type !== 'scout_text_inserted') return;
      window.removeEventListener('message', handler);
      resolve(e.data.success);
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: 'scout_insert_text', text }, '*');
    // 3秒で強制続行（タイムアウト）
    setTimeout(() => { window.removeEventListener('message', handler); resolve(false); }, 3000);
  });
}

// ── 送信ボタン取得（Chrome実機検証済み）──────────────────
// 表記ゆれ(「プロンプトを送信」「送信」「Send message」)に対応しつつ、
// マイク・停止・その他のボタンを誤って押さないよう除外する
const SEND_LABEL_RE = /送信|send/i;
const NOT_SEND_LABEL_RE = /停止|中止|stop|マイク|音声|voice|mic|アップロード|upload|添付|attach|画像|image|canvas|deep\s*research|フィードバック|feedback|共有|share|報告|report/i;

function isSendCandidate(btn) {
  const label = btn.getAttribute('aria-label') || btn.getAttribute('mattooltip') ||
                btn.getAttribute('title') || btn.getAttribute('data-test-id') || '';
  if (!label) return false;
  if (NOT_SEND_LABEL_RE.test(label)) return false;
  return SEND_LABEL_RE.test(label) || /send-button/i.test(label);
}

function getSendButton() {
  const exact =
    document.querySelector('button[aria-label="プロンプトを送信"]') ||
    document.querySelector('button[aria-label="Send message"]') ||
    document.querySelector('button[aria-label="送信"]');
  if (exact) return exact;

  // まず入力欄まわりだけを探す(フィードバック送信などの別ボタンを押さないため)
  const editor = getInputArea();
  const composer = editor
    ? editor.closest('form, input-container, [class*="input-area"], [class*="composer"], [class*="input-container"]')
    : null;
  if (composer) {
    const near = [...composer.querySelectorAll('button')].filter(isSendCandidate);
    if (near.length) return near.find(b => !isSendDisabled(b)) || near[0];
  }

  const byLabel = [...document.querySelectorAll('button')].filter(isSendCandidate);
  // 押せる状態のものを優先する
  return byLabel.find(b => !isSendDisabled(b)) || byLabel[0] ||
         document.querySelector('button.send-button, button.send') || null;
}

function isSendDisabled(btn) {
  if (!btn) return true;
  return !!(btn.disabled || btn.getAttribute('aria-disabled') === 'true' ||
            btn.classList.contains('disabled'));
}

// 押せる状態の送信ボタンが現れるまで待つ
// (文字を入れた直後は無効のままのことがあり、すぐ押しても何も起きない)
async function waitForSendButton(timeoutMs) {
  const until = Date.now() + (timeoutMs || 8000);
  let last = null;
  while (Date.now() < until) {
    const btn = getSendButton();
    if (btn) {
      last = btn;
      if (!isSendDisabled(btn)) return btn;
    }
    await new Promise(r => setTimeout(r, 250));
  }
  return last;
}

// 入力欄にまだ本文が残っているか(送信されると空になる)
function inputHasText() {
  const el = getInputArea();
  return !!(el && (el.innerText || '').trim().length > 5);
}

// 送信済みの回答ブロック数(増えたら送信された合図)
function answerCount() {
  return document.querySelectorAll('message-content').length;
}

// Enterキーで送信する(ボタンが押せないときの代替手段)
function pressEnterToSend() {
  const el = getInputArea();
  if (!el) return false;
  el.focus();
  const init = {
    key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
    bubbles: true, cancelable: true, composed: true
  };
  el.dispatchEvent(new KeyboardEvent('keydown', init));
  el.dispatchEvent(new KeyboardEvent('keypress', init));
  el.dispatchEvent(new KeyboardEvent('keyup', init));
  return true;
}

// 送信されたかを確かめる(生成が始まった / 入力欄が空になった / 回答が増えた)
async function waitForSubmitted(baseAnswers, timeoutMs) {
  const until = Date.now() + (timeoutMs || 6000);
  while (Date.now() < until) {
    if (isGenerating()) return true;
    if (answerCount() > baseAnswers) return true;
    if (!inputHasText()) return true;
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

// 送信を確実に行う。押しただけで終わらせず、送信されたことを確認する
// (押せない状態でクリックしても何も起きず、プロンプトが入力欄に残ったまま
//  応答待ちで固まる不具合があったため)
async function submitPrompt(progress) {
  const baseAnswers = answerCount();
  for (let attempt = 1; attempt <= 3; attempt++) {
    const btn = await waitForSendButton(attempt === 1 ? 8000 : 3000);
    if (btn && !isSendDisabled(btn)) {
      btn.click();
    } else {
      pressEnterToSend();
    }
    if (await waitForSubmitted(baseAnswers, 6000)) return true;

    // 押せたはずなのに始まらない場合はEnterでも試す
    pressEnterToSend();
    if (await waitForSubmitted(baseAnswers, 4000)) return true;

    if (progress) progress(`⌨️ 送信を再試行しています... (${attempt}/3)`);
    await new Promise(r => setTimeout(r, 1200));
  }
  return false;
}

// ── 入力エリア取得 ─────────────────────────────────────────
function getInputArea() {
  return (
    document.querySelector('rich-textarea .ql-editor') ||
    document.querySelector('.ql-editor') ||
    document.querySelector('[contenteditable="true"][role="textbox"]') ||
    null
  );
}

// ── 生成中かどうかの判定（停止ボタンの有無）──────────────
// Gemini は生成中、送信ボタンが「回答を停止」ボタンに変わる
function isGenerating() {
  return !!(
    document.querySelector('button[aria-label*="停止"]') ||
    document.querySelector('button[aria-label*="Stop"]') ||
    document.querySelector('button.stop')
  );
}

// ── レスポンス待機 ─────────────────────────────────────────
// 完了条件: テキストが3秒間変化しない かつ 生成中インジケータが消えている
// (旧実装は2秒静止で完了扱いにしていたため、生成途中の一時停止で
//  途中までの文章を取り込む事故があった)
function waitForResponse(token) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('タイムアウト: Geminiの応答が180秒以内に完了しませんでした')),
      180_000
    );

    let lastText = '';
    let stableCount = 0;

    const interval = setInterval(() => {
      // 新しい依頼が来ていたら、この待機は用済みなので抜ける
      if (token !== undefined && token !== runToken) {
        clearInterval(interval);
        clearTimeout(timer);
        reject(new Error('__superseded__'));
        return;
      }
      const el = [...document.querySelectorAll('message-content')].at(-1);
      const currentText = (el?.innerText ?? '').trim();

      // 生成中インジケータが出ている間は完了と判定しない
      if (isGenerating()) {
        stableCount = 0;
        lastText = currentText;
        return;
      }

      if (currentText && currentText === lastText) {
        stableCount++;
        if (stableCount >= 6) {
          clearInterval(interval);
          clearTimeout(timer);
          resolve(currentText);
        }
      } else {
        stableCount = 0;
        lastText = currentText;
      }
    }, 500);
  });
}

// ── Geminiの提案・コメント・補足を除去する ───────────────────
function removeGeminiSuggestions(text) {
  // セクションラベル行を除去（「ラベル:」「ラベル：」だけの行を丸ごと削除）
  const sectionLabels = [
    '冒頭', '古川の視点', '候補者評価', '職務とキャリアパス',
    '入社後の実績', '転職メッセージ', '面接招待', '行動喚起',
    'すかいらーくグループ言及', '募集条件', '署名',
    '件名', '本文', '見出し', 'タイトル', 'Subject', 'Body',
    'メール本文'
  ];
  const labelPattern = new RegExp(
    `^\\s*(?:${sectionLabels.join('|')})\\s*[:：]\\s*$`, 'gm'
  );
  let cleaned = text.replace(labelPattern, '');

  const patterns = [
    // 「---」「***」「===」以降の補足ブロック
    /\n[-─━=*]{3,}[\s\S]*$/,
    // 「ポイント」「注意」「補足」「提案」「アドバイス」等のブロック
    /\n(?:【|■|●|▼|▶|★|☆|※)?\s*(?:ポイント|注意点|補足|提案|アドバイス|改善点|tips|TIPS|Tips|ヒント|メモ|備考|解説|説明|コメント|フィードバック|修正案|別案|代替案|参考|カスタマイズ|調整|変更点|以下|上記).*[\s\S]*$/i,
    // 「いかがでしょうか」「ご確認ください」等のGeminiコメント
    /\n.*(?:いかがでしょうか|ご確認ください|ご参考|お役に立て|何かあれば|修正が必要|変更が必要|調整してください|ご質問|お気軽に|以上です|ご検討).*$/i,
    // 「この文章は」「このメールは」等のメタコメント
    /\n.*(?:この文章|このメール|このスカウト|上記の|以上の).*(?:です|ました|ます|ません)[\s。]*$/i,
  ];
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  // 連続する空行を1つにまとめる
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// ── 件名・本文パース（ラベル文字・Gemini提案を除去して返す）───
function parseScoutMessage(text) {
  // Markdownの装飾・コードブロック記号を除去
  let normalized = text
    .replace(/^\s*`{3,}.*$/gm, '')
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/gm, '');

  // Geminiの提案・補足を除去
  normalized = removeGeminiSuggestions(normalized);

  // パターン1: 「件名:」「本文:」ラベル付き出力
  const subjectMatch = normalized.match(/(?:件名|見出し|タイトル|Subject)\s*[:：]\s*(.+?)(?:\n|$)/i);
  const bodyMatch = normalized.match(/(?:本文|メール本文|Body)\s*[:：]\s*([\s\S]+?)$/i);

  if (subjectMatch || bodyMatch) {
    let subject = subjectMatch?.[1]?.trim() ?? '';
    let body = bodyMatch?.[1]?.trim() ?? '';
    // 本文からラベル行を除去
    body = body.replace(/^(?:件名|見出し|タイトル|Subject)\s*[:：].*\n?/i, '').trim();
    // 本文末尾のGemini提案を再度除去
    body = removeGeminiSuggestions(body);
    if (subject || body) return { subject, body };
  }

  // パターン2: ラベルなし（1行目=見出し、空行、3行目以降=本文）
  const lines = normalized.trim().split('\n');
  const subject = lines[0]?.replace(/^(?:件名|見出し|タイトル|Subject)\s*[:：]\s*/i, '').trim() ?? '';
  // 2行目が空行なら3行目以降、そうでなければ2行目以降を本文
  const bodyStart = (lines[1]?.trim() === '') ? 2 : 1;
  let body = lines.slice(bodyStart).join('\n')
    .replace(/^(?:本文|メール本文|Body)\s*[:：]\s*/i, '')
    .trim();
  body = removeGeminiSuggestions(body);

  return { subject, body };
}

// ── chrome.runtime が有効か確認 ───────────────────────────
function isExtensionValid() {
  try {
    return !!chrome.runtime?.id;
  } catch (e) {
    return false;
  }
}

// ── 安全にメッセージ送信（Extension context invalidated 対策）──
function safeSendMessage(message) {
  try {
    if (!isExtensionValid()) return;
    chrome.runtime.sendMessage(message, () => {
      if (chrome.runtime.lastError) { /* 無視 */ }
    });
  } catch (e) {
    console.warn('メッセージ送信スキップ（拡張機能コンテキスト無効）');
  }
}

// ── メイン処理 ────────────────────────────────────────────
async function processPrompt(promptText) {
  // 新しい依頼が来たら、前の依頼の待機は打ち切って新しい方を処理する。
  // (前の待機が残っていると、次の依頼が丸ごと無視されて何も起きなくなる)
  const myToken = ++runToken;
  isProcessing = true;

  const progress = text => { if (myToken === runToken) safeSendMessage({ action: 'geminiProgress', text }); };

  try {
    progress('⏳ Geminiの入力エリアを探しています...');

    let inputArea = null;
    for (let i = 0; i < 20; i++) {
      inputArea = getInputArea();
      if (inputArea) break;
      await new Promise(r => setTimeout(r, 500));
    }
    if (!inputArea) throw new Error('入力エリアが見つかりません。Geminiにログインしているか確認してください。');

    progress('⌨️ プロンプトを入力しています...');

    const inserted = await insertPrompt(promptText);
    if (!inserted) {
      // 入力欄に文字が入っていれば続行する(合図が届かなかっただけの場合がある)
      await new Promise(r => setTimeout(r, 800));
      if (!inputHasText()) throw new Error('プロンプトを入力できませんでした。');
    }
    await new Promise(r => setTimeout(r, 600));

    progress('📨 Geminiへ送信しています...');
    const sent = await submitPrompt(progress);
    if (!sent) {
      throw new Error('送信できませんでした（送信ボタンが反応しません）。Geminiの画面を確認してください。');
    }

    progress('✍️ Geminiが回答を生成中...');

    const responseText = await waitForResponse(myToken);
    if (myToken !== runToken) return; // 新しい依頼に置き換わった
    const { subject, body } = parseScoutMessage(responseText);
    safeSendMessage({ action: 'geminiResponse', subject, body, rawText: responseText });

  } catch (error) {
    // 新しい依頼に置き換わった場合は、古い方のエラーを送らない
    if (error.message === '__superseded__' || myToken !== runToken) return;
    safeSendMessage({ action: 'geminiError', error: error.message });
  } finally {
    if (myToken === runToken) isProcessing = false;
  }
}

// ── メッセージ受信 ────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'fillPrompt') processPrompt(message.prompt);
});

// ── ページ読み込み完了通知 ────────────────────────────────
function notifyReady() {
  let attempts = 0;
  const tryNotify = () => {
    if (!isExtensionValid()) return;
    safeSendMessage({ action: 'geminiReady' });
    // リトライ（geminiReadyが届かなかった場合のフォールバック）
    if (attempts++ < 5) setTimeout(tryNotify, 800);
  };
  tryNotify();
}

if (document.readyState === 'complete') {
  setTimeout(notifyReady, 2000);
} else {
  window.addEventListener('load', () => setTimeout(notifyReady, 2000));
}
