// kanri.gourmetcaree.jp の候補者詳細/スカウト画面で動作するコンテンツスクリプト

const SYSTEM_PROMPT = `あなたは「株式会社資さん」の人事採用担当、古川として振る舞ってください。
うどん業界のトップ企業での10年の現場経験とエリアマネージャー職、2つの成長企業を経験した唯一無二の視点を活かし、
候補者の心に深く刺さるスカウトメールを作成してください。

# 古川のバックグラウンド

- 業界経験: うどん業界12年（うどん業界のトップ企業10年 → 資さんうどん2年）
- 前職: うどん業界のトップ企業でのエリアマネージャー
- 特徴: 黎明期から成長期への経験、2つの成長企業を経験した唯一無二の視点
- 現在: 資さんうどん人事採用課（入社1年半）、転職経験に基づいた共感

# コアの原則

- 最優先：対面面接の約束を取ること
- 真正性：完璧な構成を崩して人間らしさを表現
- 古川の視点：12年の現場経験と2つの成長企業を経験した視点を随所に織り込む
- 個人的反応：採用担当者の個人的な反応を示す
- 正確性：提供されていない情報は記載しない

# 入力スキーマ

候補者プロフィール:
飲食業界経験年数、売上規模、過去の職務、現在の職務、主要スキル、マネジメント経験（任意）

# メール構成

## 【見出し部分の構造】

共通ルール:

- 勤務地名・条件・評価語を記載しない
- 提供されていない情報は記載しない
- なぜ連絡したか、なぜ話したいかが分かること
- 末尾には必ず「【内定まで最短14日】 急成長を続ける福岡うどん業態」を付与する
- 件名全体で70文字以内に収める

コピー部分（情報がほぼ無い／薄い場合）:
"ご登録内容で少し気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態"

コピー部分（業態・現場環境が一点でも分かる場合）:
"{{industry_context}}でのご経験で、１点だけ気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態"

## 【本文部分の構造】

冒頭:
はじめまして。株式会社資さん　人事採用担当　古川です。

資さんうどんは、2024年にすかいらーくグループの仲間になってから、本当に勢いがあります。
安定した経営基盤とグループのインフラを活かしながら、{{company_growth_metrics}}を続けていて、
{{current_phase}}です。2030年には400店舗（現在102店舗）を計画しており、その中で、{{role_description}}を探しています。

古川の視点:
実は、私自身もうどん業界のトップ企業で同じような急成長の時期を経験してきました。
組織が小さいころの熱量から、急速に拡大していく様子を最前線で見てきたからこそ、
今の資さんうどんの面白さが分かるんです。

候補者評価:
あなたのご経歴を拝見したときに、正直、目に留まりました。
{{experience_years}}の飲食業界での経験というのもそうですが、
{{business_scale}}で現場をまとめながら、{{key_skills_list}}、
本当に幅広く経験されているんですね。
こういった経験を持っている方、これからの資さんうどんの成長にとって、
本当に必要な力だと思っています。

職務とキャリアパス:
ただ、ここで重要なのは、単に「経験を活かしてください」というわけではないんです。
資さんうどんでは、調理経験を基盤にしながらも、
日々の営業を安定させることと同時に、
スタッフ育成や数値管理といった、より経営的な視点も
段階的に学んでいただきたいと考えています。
つまり、今回の募集は調理専門職ではなく、
店長候補としての採用を想定しており、
将来的には複数店舗を支えるエリアマネージャーへの
成長も視野に入れています。

入社後の実績:
【入社後の実績として】
・中途入社(前職で店長経験あり)・・・入社後4か月で店長昇進。(年収530万)
その後1年でエリア長昇進。(年収720万)

転職メッセージ:
先ほどもお伝えしましたが、私は同じうどん業界の中で転職し、資さんうどんに来ました。
会社が変わるだけで、任される範囲や見える景色は大きく変わります。
これまでの経験は活かしつつ、新しいステージで成長している。
今は、その実感を持って仕事をしています。

面接招待:
ここまで現場の中心として責任を担ってこられた経験を、
次はどのようなステージで活かしていきたいのか。
そして、資さんうどんが{{company_current_phase}}、
どんな役割を期待しているのか。
そういったことを、ぜひ一度、直接お話しできればと思っています。

行動喚起:
もし少しでもご関心をお持ちいただけましたら、
{{call_to_action_phrase}}でいいので、
返信をいただけると嬉しいです。

募集条件:
【募集条件】
・月収30万円以上可、年収400万円以上可（経験・能力考慮）
・勤務地：全国（九州・山口・広島・岡山・関西・関東）
・休日：4週8休制、有給休暇、リフレッシュ休暇【7連休取得可】、残業平均28時間
・キャリア：研修 → 現場OJT → 店長（候補） → エリアマネージャー
・福利厚生：賞与年2回、食事補助、資格取得支援
・借上社宅制度（自己負担 月2万円から）、引越費用負担 ※規定あり

署名:
――――――――――
株式会社資さん
採用担当　古川 和幸

このメールはあなたのご経歴を拝見し、ぜひ一度お話をお伺いしたいと考え 私、古川が個別にお送りしています。

# 古川の評価視点

最初に見るポイント:

- 年齢: キャリアステージの把握
- 転職回数と定着性: 「この人は資さんに定着するか」

重視する基準:

- 具体的な行動内容を話せるか
- 現場で本当に通用する思考力と実行力があるか

人間らしい表現:

- 感情的・主観的: "本当に" "実は" "思っています" "正直" "目に留まりました"
- 不完全さ・誇慕: "ただ、ここで重要なのは" "つまり" "というわけではない"

# 業態整合性ルール

禁止語句: 寿司、懐石料理、割烹、本格和食、高級和食、料亭、デザート開発、パティシエ、パン、製パン

翻訳例:

- 寿司職人 → 調理経験・魚の取り扱いに強み
- パティシエ → 調理・盛り付けの丁寧さに強み
- デザート開発 → 商品開発（うどん・丼・定食領域に応用）

# プレースホルダーガイド

- {{experience_years}}: 例："10年以上"
- {{business_scale}}: 例："月商500万円規模"
- {{company_growth_metrics}}: 例："3年連続で前年比120％以上の成長"
- {{current_phase}}: 例："年間30店舗以上の新規出店を進めているフェーズ"
- {{role_description}}: 例："新しい店舗を支える現場のリーダーとなる方"
- {{key_skills_list}}: 例："メニュー考案やスタッフ指導、衛生管理、数値管理まで"
- {{company_current_phase}}: 例："急速な拡大フェーズにあり"
- {{call_to_action_phrase}}: 例："「話を聞いてみたい」「面接希望」という一言"
- {{industry_context}}: 例："ラーメン業態"

# 重要なルール

- プレースホルダー名をそのまま使用せず、必ず候補者情報に基づいた具体的な値に置換すること
- 提供されていない情報は記載しない
- 禁止語句は絶対に使用しない
- 見出し部分に勤務地名を記載しない
- 古川の唯一無二の視点を織り込む
- 古川の転職経験に基づいた共感を示す

# 出力フォーマット（必ずこの形式で出力してください）

- 1行目に見出しテキストのみ（ラベルや接頭辞なし）
- 2行目は空行
- 3行目以降に本文テキストのみ（ラベルや接頭辞なし）

# 厳守事項

- 上記フォーマット以外は一切出力しない
- 「件名:」「本文:」などのラベル文字は絶対に出力しない
- 「冒頭:」「古川の視点:」「候補者評価:」「職務とキャリアパス:」「転職メッセージ:」「面接招待:」「行動喚起:」「募集条件:」「署名:」などのセクションラベル・見出しは絶対に出力しない
- 本文は各セクションの内容を自然につなげた一続きの文章として出力すること
- 感想・意見・アドバイス・提案・次のアクション・コメントは絶対に出力しない
- メール本文の後に何も付け加えない`;

// ── 動作設定 ──
// 入力完了後に送信/確認ボタン(#btn_conf)を自動クリックするか。
// グルメキャリーのボタンは表示が「送信」のため、誤送信防止でデフォルト無効。
// （押した先が確認画面であることが確認できたら true にしてよい）
const AUTO_CLICK_CONFIRM = false;

// ── スカウトフォームがページ内に存在するか確認 ──
function isScoutFormPresent() {
  // 実機確認済みセレクタ: 件名 #subject / 本文 #mailBody
  if (document.querySelector('#subject') && document.querySelector('#mailBody')) return true;

  // フォールバック: 画面文言での判定
  const bodyText = document.body.innerText || '';
  const hasFormFields = bodyText.includes('件名') && bodyText.includes('本文') &&
                        (bodyText.includes('求人票') || bodyText.includes('定型文'));
  const hasInputs = !!document.querySelector('textarea, input[type="text"]');
  return hasFormFields && hasInputs;
}

// ── ページから候補者情報を抽出 ──
function extractCandidateInfo() {
  // グルメキャリーは候補者詳細ページにスカウトフォームが同居しているため、
  // メインコンテンツ全体からノイズを除いて取得する
  const root =
    document.querySelector('main, #main, .main-content, #contents, .contents, .content, article') ||
    document.body;

  const clone = root.cloneNode(true);
  clone.querySelectorAll('nav, header, footer, script, style, noscript, iframe, button, select, option, #scout-ext-panel')
    .forEach(el => el.remove());

  let text = (clone.innerText || clone.textContent || '')
    .split('\n').map(l => l.trim()).filter(l => l.length > 0).join('\n');

  // 「候補者詳細」より前のグローバルメニュー等を切り落とす
  const startIdx = text.indexOf('候補者詳細');
  if (startIdx > 0) text = text.slice(startIdx);

  if (!text.trim()) return '';
  return '=== スカウトパネル情報 ===\n\n' + text;
}

// ── 送信カウンター（24時リセット）──
function getTodayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getScoutCount() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['scoutCount', 'scoutCountDate'], (data) => {
      const today = getTodayKey();
      if (data.scoutCountDate === today) {
        resolve(data.scoutCount || 0);
      } else {
        chrome.storage.local.set({ scoutCount: 0, scoutCountDate: today });
        resolve(0);
      }
    });
  });
}

function incrementScoutCount() {
  return new Promise((resolve) => {
    const today = getTodayKey();
    chrome.storage.local.get(['scoutCount', 'scoutCountDate'], (data) => {
      const count = (data.scoutCountDate === today) ? (data.scoutCount || 0) + 1 : 1;
      chrome.storage.local.set({ scoutCount: count, scoutCountDate: today }, () => {
        resolve(count);
      });
    });
  });
}

function updateBadge(count) {
  const badge = document.getElementById('scoutBadge');
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

// ── パネルのHTML作成（フローティングボタン + バッジ）──
function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'scout-ext-panel';
  panel.innerHTML = `
    <div id="scoutResultBox" class="scout-result-box" style="display:none;"></div>
    <div id="scoutStatus" class="scout-status" style="display:none;"></div>
    <div class="scout-btn-wrapper">
      <button class="scout-btn scout-btn-primary" id="scoutGenerateBtn">
        ✨ Geminiでスカウトメール生成
      </button>
      <span id="scoutBadge" class="scout-badge" style="display:none;">0</span>
    </div>
  `;
  return panel;
}

// ── MAIN world 経由でフォームに値をセット ──
function setFieldViaMainWorld(selector, value) {
  return new Promise((resolve) => {
    const handler = (e) => {
      if (e.source !== window || e.data?.type !== 'scout_field_set') return;
      if (e.data.selector !== selector) return;
      window.removeEventListener('message', handler);
      resolve(e.data.success);
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: 'scout_set_field', selector, value }, '*');
    setTimeout(() => { window.removeEventListener('message', handler); resolve(false); }, 3000);
  });
}

// ── input/textarea に値をセット（isolated world版）──
function setFieldValue(el, value) {
  if (!el) return false;

  // contenteditable の場合
  if (el.isContentEditable) {
    el.focus();
    document.execCommand('selectAll', false, null);
    document.execCommand('insertText', false, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }

  // input / textarea の場合（SPAでも効くようネイティブセッターを使う）
  const proto = el.tagName === 'TEXTAREA'
    ? window.HTMLTextAreaElement.prototype
    : window.HTMLInputElement.prototype;
  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }
  ['input', 'change', 'keyup', 'blur'].forEach(type => {
    el.dispatchEvent(new Event(type, { bubbles: true }));
  });
  return true;
}

// ── ラベルテキストの近くにあるフィールドを探す ──
function findFieldNearLabel(labelText, fieldSelector, isVisible) {
  const labels = [...document.querySelectorAll('th, label, dt, span, div, p')];
  for (const label of labels) {
    const text = label.textContent.trim();
    // 「件名」「件名必須」「件名必須 0/70文字」のような表記に対応
    if (text === labelText || text.startsWith(labelText)) {
      if (text.length > labelText.length + 20) continue; // 長文に含まれるだけの要素は除外
      const parent = label.closest('tr, div, section, fieldset, dl, li, [class*="row"], [class*="field"], [class*="form"]');
      if (parent) {
        const field = parent.querySelector(fieldSelector);
        if (field && isVisible(field)) return field;
      }
    }
  }
  return null;
}

// ── 本文欄に元から入っている求人情報フッターを取り出す ──
// グルメキャリーの本文欄には「-------  現在掲載中の求人情報はこちら ...」という
// 求人リンクのブロックが最初から入っているため、上書きで消さずに生成文の後ろへ残す
function extractJobFooter(existingBody) {
  if (!existingBody) return '';
  const idx = existingBody.indexOf('現在掲載中の求人情報');
  if (idx === -1) return '';
  // ブロックの行頭（「-------」の先頭）からを丸ごとフッターとして保持
  const lineStart = existingBody.lastIndexOf('\n', idx) + 1;
  return existingBody.slice(lineStart).trim();
}

// ── フォームのフィールドを特定して入力 ──
function fillForm(subject, body) {
  function isVisible(el) {
    if (el.closest('#scout-ext-panel')) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden';
  }

  const allFields = [...document.querySelectorAll('input, textarea')].filter(isVisible);
  let subjectFilled = false;
  let bodyFilled = false;

  // ── 件名フィールドを探す ──
  // ① 実機確認済み: <input type="text" id="subject" name="subject" placeholder="件名">
  let subjectEl = document.querySelector('#subject, input[name="subject"]');
  if (subjectEl && !isVisible(subjectEl)) subjectEl = null;

  // ② placeholder / name / id に「件名」「subject」「title」を含む
  if (!subjectEl) {
    subjectEl = allFields.find(el =>
      (el.placeholder || '').includes('件名') ||
      /subject|title/i.test(el.name || '') ||
      /subject|title/i.test(el.id || '')
    );
  }

  // ③ ラベル「件名」の近くのフィールド
  if (!subjectEl) {
    subjectEl = findFieldNearLabel('件名', 'input:not([type="hidden"]), textarea', isVisible);
  }

  // ── 本文フィールドを探す ──
  // ① 実機確認済み: <textarea id="mailBody" name="body" placeholder="本文">
  let bodyEl = document.querySelector('#mailBody, textarea[name="body"]');
  if (bodyEl && !isVisible(bodyEl)) bodyEl = null;

  // ② placeholder / name / id に「本文」「body」「message」を含む
  if (!bodyEl) {
    bodyEl = allFields.find(el =>
      el.tagName === 'TEXTAREA' && el !== subjectEl && (
        (el.placeholder || '').includes('本文') ||
        /body|message|content/i.test(el.name || '') ||
        /body|message|content/i.test(el.id || '')
      )
    );
  }

  // ③ ラベル「本文」の近くのtextarea
  if (!bodyEl) {
    const found = findFieldNearLabel('本文', 'textarea', isVisible);
    if (found && found !== subjectEl) bodyEl = found;
  }

  // ④ フォールバック: 一番大きいtextareaを本文と判断
  if (!bodyEl) {
    const textareas = allFields.filter(el => el.tagName === 'TEXTAREA' && el !== subjectEl);
    if (textareas.length > 0) {
      bodyEl = textareas.reduce((a, b) =>
        (b.getBoundingClientRect().height > a.getBoundingClientRect().height) ? b : a
      );
    }
  }

  // ⑤ フォールバック: 最初の可視inputを件名
  if (!subjectEl) {
    const inputs = allFields.filter(el => el.tagName === 'INPUT' && el.type !== 'hidden' && el !== bodyEl);
    if (inputs.length > 0) subjectEl = inputs[0];
  }

  if (subjectEl) {
    setFieldValue(subjectEl, subject);
    subjectFilled = true;
  }
  if (bodyEl) {
    // 元から入っている求人情報フッターを生成文の後ろに残す
    const footer = extractJobFooter(bodyEl.value);
    const finalBody = (footer && !body.includes('現在掲載中の求人情報'))
      ? `${body}\n\n${footer}`
      : body;
    setFieldValue(bodyEl, finalBody);
    bodyFilled = true;
  }

  return { subjectFilled, bodyFilled, found: allFields.length };
}

// ── MAIN world経由でフォーム入力を試みる（フォールバック）──
async function fillFormViaMainWorld(subject, body) {
  const subjectSelectors = [
    '#subject',
    'input[name="subject"]',
    'input[placeholder*="件名"]',
    'input[name*="title" i]'
  ];
  let subjectOk = !subject;
  if (subject) {
    for (const sel of subjectSelectors) {
      if (document.querySelector(sel)) {
        subjectOk = await setFieldViaMainWorld(sel, subject);
        if (subjectOk) break;
      }
    }
  }

  const bodySelectors = [
    '#mailBody',
    'textarea[name="body"]',
    'textarea[placeholder*="本文"]',
    'textarea[name*="message" i]',
    'textarea'
  ];
  let bodyOk = !body;
  if (body) {
    for (const sel of bodySelectors) {
      if (document.querySelector(sel)) {
        bodyOk = await setFieldViaMainWorld(sel, body);
        if (bodyOk) break;
      }
    }
  }

  return { subjectFilled: subjectOk, bodyFilled: bodyOk };
}

// ── 確認/送信ボタンを探してクリック（AUTO_CLICK_CONFIRM有効時のみ）──
// グルメキャリーの送信ボタンは <input type="submit" id="btn_conf">（表示「送信」）。
// name="conf" のため確認画面に遷移する可能性が高いが、即送信の恐れがあるため
// 実機で挙動確認が取れるまでは自動クリックしない。
async function clickConfirmButton() {
  if (!AUTO_CLICK_CONFIRM) return false;

  const btn = document.querySelector('#btn_conf, input[type="submit"][name="conf"]');
  if (btn) {
    btn.click();
    return true;
  }

  // フォールバック: 「確認」系の文言を持つボタン
  const confirmTexts = ['確認', '確認する', '確認画面へ', '内容を確認', '入力内容を確認', '確認画面に進む'];
  const buttons = [...document.querySelectorAll('button, input[type="submit"], input[type="button"]')].filter(el => {
    if (el.closest('#scout-ext-panel')) return false;
    const text = (el.tagName === 'INPUT' ? el.value : el.textContent).trim();
    return confirmTexts.includes(text);
  });

  if (buttons.length > 0) {
    buttons[0].click();
    return true;
  }
  return false;
}

function showStatus(msg, type = 'info') {
  const el = document.getElementById('scoutStatus');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = msg;
  el.className = `scout-status scout-status-${type}`;
}

function hideStatus() {
  const el = document.getElementById('scoutStatus');
  if (el) el.style.display = 'none';
}

// ── パネルの初期化 ──
function initPanel() {
  if (document.getElementById('scout-ext-panel')) return;

  const panel = createPanel();
  document.body.appendChild(panel);

  getScoutCount().then(count => updateBadge(count));

  document.getElementById('scoutGenerateBtn').addEventListener('click', () => {
    const candidateInfo = extractCandidateInfo();
    if (!candidateInfo.trim()) {
      showStatus('⚠ 候補者情報が取得できませんでした', 'error');
      return;
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n候補者情報:\n${candidateInfo}\n\n上記の候補者情報をもとにスカウトメールを作成してください。出力は見出し1行＋空行＋本文のみ。ラベルは不要です。`;

    document.getElementById('scoutGenerateBtn').disabled = true;
    showStatus('⏳ Geminiでメールを生成中...', 'info');

    chrome.runtime.sendMessage({
      action: 'openGemini',
      candidateInfo: candidateInfo,
      prompt: fullPrompt
    });
  });
}

// ── Geminiの提案・コメント・補足・セクションラベルを除去する ──
function removeGeminiSuggestions(text) {
  const sectionLabels = [
    '冒頭', '古川の視点', '候補者評価', '職務とキャリアパス',
    '転職メッセージ', '面接招待', '行動喚起', '募集条件', '署名',
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
    // 「ポイント」「注意」「補足」「提案」等のブロック
    /\n(?:【|■|●|▼|▶|★|☆|※)?\s*(?:ポイント|注意点|補足|提案|アドバイス|改善点|tips|TIPS|Tips|ヒント|メモ|備考|解説|説明|コメント|フィードバック|修正案|別案|代替案|参考|カスタマイズ|調整|変更点|以下|上記).*[\s\S]*$/i,
    // 「いかがでしょうか」「ご確認ください」等のGeminiコメント
    /\n.*(?:いかがでしょうか|ご確認ください|ご参考|お役に立て|何かあれば|修正が必要|変更が必要|調整してください|ご質問|お気軽に|以上です|ご検討).*$/i,
    // 「この文章は」「このメールは」等のメタコメント
    /\n.*(?:この文章|このメール|このスカウト|上記の|以上の).*(?:です|ました|ます|ません)[\s。]*$/i,
  ];
  for (const pattern of patterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  return cleaned.trim();
}

// ── Geminiの応答からラベル文字・提案を除去するパーサー ──
function cleanGeminiOutput(subject, body) {
  let cleanSubject = subject
    .replace(/^(件名|見出し|タイトル|Subject)\s*[:：]\s*/i, '')
    .trim();
  let cleanBody = body
    .replace(/^(本文|メール本文|Body)\s*[:：]\s*/i, '')
    .trim();

  cleanBody = removeGeminiSuggestions(cleanBody);

  return { subject: cleanSubject, body: cleanBody };
}

// ── backgroundからのメッセージ受信 ──
chrome.runtime.onMessage.addListener((message) => {
  const generateBtn = document.getElementById('scoutGenerateBtn');

  if (message.action === 'showResult') {
    if (generateBtn) generateBtn.disabled = false;
    hideStatus();

    let subjectText = message.subject || '';
    let bodyText = message.body || '';

    // rawTextからのフォールバックパース
    if ((!subjectText || !bodyText) && message.rawText) {
      const lines = message.rawText.trim().split('\n');
      if (!subjectText && lines.length > 0) {
        subjectText = lines[0].replace(/^(件名|見出し|タイトル|Subject)\s*[:：]\s*/i, '').trim();
      }
      if (!bodyText && lines.length > 2) {
        const bodyStart = lines[1].trim() === '' ? 2 : 1;
        bodyText = lines.slice(bodyStart).join('\n')
          .replace(/^(本文|メール本文|Body)\s*[:：]\s*/i, '')
          .trim();
      }
    }

    const cleaned = cleanGeminiOutput(subjectText, bodyText);
    subjectText = cleaned.subject;
    bodyText = cleaned.body;

    const resultBox = document.getElementById('scoutResultBox');

    // 異常検知: 件名・本文が短すぎる場合
    if (subjectText.length < 10) {
      showStatus(`⚠ 件名が短すぎます（${subjectText.length}文字）。再生成してください。`, 'warning');
      if (generateBtn) generateBtn.disabled = false;
      return;
    }
    if (bodyText.length < 30) {
      showStatus(`⚠ 本文が短すぎます（${bodyText.length}文字）。再生成してください。`, 'warning');
      if (generateBtn) generateBtn.disabled = false;
      return;
    }

    if (subjectText && bodyText) {
      // 生成結果を緑のボックスに表示（件名70/本文4000はグルメキャリーの上限）
      if (resultBox) {
        const subjectLen = subjectText.length;
        const bodyLen = bodyText.length;
        const subjectClass = subjectLen > 70 ? 'scout-char-over' : 'scout-char-ok';
        const bodyClass = bodyLen > 4000 ? 'scout-char-over' : 'scout-char-ok';

        resultBox.innerHTML =
          `<div class="scout-result-label">件名 <span class="${subjectClass}">${subjectLen}/70文字</span></div>` +
          `<div class="scout-result-text">${subjectText}</div>` +
          `<div class="scout-result-label" style="margin-top:8px;">本文 <span class="${bodyClass}">${bodyLen}/4000文字</span></div>` +
          `<div class="scout-result-text">${bodyText.substring(0, 200)}${bodyText.length > 200 ? '...' : ''}</div>`;
        resultBox.style.display = 'block';
      }

      showStatus('⏳ フォームに自動入力中...', 'info');
      (async () => {
        // まずisolated worldで入力を試みる
        let result = fillForm(subjectText, bodyText);

        // 入力に失敗した場合はMAIN world経由で再試行
        if (!result.subjectFilled || !result.bodyFilled) {
          const mainResult = await fillFormViaMainWorld(
            result.subjectFilled ? '' : subjectText,
            result.bodyFilled ? '' : bodyText
          );
          if (mainResult.subjectFilled) result.subjectFilled = true;
          if (mainResult.bodyFilled) result.bodyFilled = true;
        }

        const { subjectFilled, bodyFilled } = result;

        if (subjectFilled && bodyFilled) {
          // 少し待ってから「確認」ボタンをクリック
          await new Promise(r => setTimeout(r, 500));
          const confirmed = await clickConfirmButton();
          const newCount = await incrementScoutCount();
          updateBadge(newCount);
          if (confirmed) {
            showStatus(`✅ 確認画面が表示されました。内容を確認して「送信」を押してください。（本日 ${newCount} 通目）`, 'success');
          } else {
            showStatus(`✅ 入力完了。内容を確認して送信してください。（本日 ${newCount} 通目）`, 'success');
          }
        } else if (subjectFilled || bodyFilled) {
          showStatus(`⚠ 一部入力できませんでした（件名:${subjectFilled ? '○' : '×'} 本文:${bodyFilled ? '○' : '×'}）`, 'warning');
        } else {
          showStatus('⚠ フォームフィールドが見つかりませんでした。手動で入力してください。', 'warning');
        }

        // 8秒後にステータスとリザルトを非表示
        setTimeout(() => {
          hideStatus();
          if (resultBox) resultBox.style.display = 'none';
          if (generateBtn) generateBtn.disabled = false;
        }, 8000);
      })();
    }
  }

  if (message.action === 'showError') {
    if (generateBtn) generateBtn.disabled = false;
    showStatus(`❌ エラー: ${message.error}`, 'error');
  }

  if (message.action === 'geminiProgress') {
    showStatus(message.text, 'info');
  }
});

// ── ページ読み込み完了後に初期化 ──
function tryInit() {
  if (document.getElementById('scout-ext-panel')) return;
  if (isScoutFormPresent()) initPanel();
}

// 初回チェック
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInit);
} else {
  tryInit();
}

// DOM変化を監視（スカウトフォームの動的表示に対応）
let debounceTimer = null;
const observer = new MutationObserver(() => {
  if (document.getElementById('scout-ext-panel')) return;
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(tryInit, 300);
});

if (document.body) {
  observer.observe(document.body, { childList: true, subtree: true });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
