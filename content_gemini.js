// gemini.google.com で動作するコンテンツスクリプト（isolated world）
// chrome.runtime 通信・DOM操作を担当
// テキスト挿入は content_gemini_main.js (MAIN world) に postMessage で委譲

let isProcessing = false;

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
function getSendButton() {
  return (
    document.querySelector('button[aria-label="プロンプトを送信"]') ||
    document.querySelector('button[aria-label="Send message"]') ||
    document.querySelector('button.send') ||
    [...(document.querySelector('rich-textarea')?.querySelectorAll('button') ?? [])].at(-1) ||
    null
  );
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

// ── レスポンス待機（Chrome実機検証済みセレクタ）──────────
function waitForResponse() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error('タイムアウト: Geminiの応答が120秒以内に完了しませんでした')),
      120_000
    );

    let lastText = '';
    let stableCount = 0;

    const interval = setInterval(() => {
      const el = [...document.querySelectorAll('message-content')].at(-1);
      const currentText = (el?.innerText ?? '').trim();

      if (currentText && currentText === lastText) {
        stableCount++;
        if (stableCount >= 5) {
          clearInterval(interval);
          clearTimeout(timer);
          resolve(currentText);
        }
      } else {
        stableCount = 0;
        lastText = currentText;
      }
    }, 400);
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
  if (isProcessing) return;
  isProcessing = true;

  const progress = text => safeSendMessage({ action: 'geminiProgress', text });

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

    await insertPrompt(promptText);
    await new Promise(r => setTimeout(r, 400));

    const sendBtn = getSendButton();
    if (!sendBtn) throw new Error('送信ボタンが見つかりません。');
    sendBtn.click();

    progress('✍️ Geminiが回答を生成中...');

    const responseText = await waitForResponse();
    const { subject, body } = parseScoutMessage(responseText);
    safeSendMessage({ action: 'geminiResponse', subject, body, rawText: responseText });

  } catch (error) {
    safeSendMessage({ action: 'geminiError', error: error.message });
  } finally {
    isProcessing = false;
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
