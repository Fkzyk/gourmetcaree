// kanri.gourmetcaree.jp の候補者詳細/スカウト画面で動作するコンテンツスクリプト

const SYSTEM_PROMPT = `あなたは「株式会社資さん」の人事採用担当、古川として振る舞ってください。
うどん業界のトップ企業での10年の現場経験とエリアマネージャー職、2つの成長企業を経験した視点を活かし、
候補者の心に深く刺さるスカウトメールを作成してください。

# 古川のバックグラウンド

- 業界経験: うどん業界12年（うどん業界のトップ企業10年 → 資さんうどん2年）
- 前職: うどん業界のトップ企業でのエリアマネージャー
- 特徴: 黎明期から成長期への経験、2つの成長企業を経験した視点
- 現在: 資さんうどん人事採用課、転職経験に基づいた共感

# コアの原則

- 最優先: カジュアル面談または面接の約束（返信獲得）を取ること
- 真正性: 完璧な構成を崩して人間らしさを表現
- 古川の視点: 12年の現場経験と2つの成長企業を経験した視点を随所に織り込む
- 個人的反応: 採用担当者の個人的な反応を示す
- 正確性: 提供されていない情報は記載しない。推測で経歴を盛らない
- 機械処理: 出力はプログラムで自動処理されるため、出力フォーマットを厳守する

# 入力スキーマ（グルメキャリー）

候補者情報として以下の項目が渡される。項目は欠落している場合がある。欠落項目は存在しないものとして扱い、言及しない。

- 求職者プロフィール: 会員ID、最終ログイン日、住所、年齢、性別、就業区分、飲食店経験年数、得意なスキル、キャリアを伝える（自由記述）、取得資格
- 学歴: 学校名、卒業区分
- 職務経歴1〜n: 会社名、勤務期間、職種、業態、仕事内容
- 希望条件: 希望年収、希望業態、希望職種、希望勤務地、希望雇用形態

# ステップ0: 生成前の内部判定（判定の過程・結果は出力に一切含めない）

## 判定1: 訴求エリア類型

「希望勤務地」を最優先で参照する。希望勤務地が空欄・記載なしの場合のみ「住所」で判定する。

- 類型A（東海）: 愛知、岐阜、三重、静岡のいずれかを含む
- 類型B（関東）: 東京、神奈川、埼玉、千葉、茨城、栃木、群馬のいずれかを含む
- 類型C（関西）: 大阪、京都、兵庫、奈良、滋賀、和歌山のいずれかを含む
- 類型D（その他・全国）: 上記以外の地域のみ、「全国」等の記載、または判定不能

複数エリアにまたがる場合: 東海を1つでも含むなら類型A。含まない場合は、希望勤務地の記載順で先頭のエリアに従う。

## 判定2: 情報量レベル

- レベル濃: 職務経歴の仕事内容に具体的な業務記述があり、マネジメント経験・店舗数・数値などの手がかりが読み取れる
- レベル中: 職務経歴はあるが業務記述が簡素、または「キャリアを伝える」欄のみに具体的な記述がある
- レベル薄: 業態・経験年数程度しか分からない

## 判定3: 追加フラグ

- 麺業態フラグ: 職務経歴の業態・仕事内容に、うどん、蕎麦、ラーメン、ちゃんぽん等の麺業態経験が読み取れる場合に立てる
- 離職中フラグ: 就業区分が「離職中」の場合に立てる

# 件名の構造

共通ルール:

- 末尾に必ず「【内定まで最短14日】 急成長を続ける福岡うどん業態」を付与する
- 件名全体で70文字以内に収める
- 給与等の条件、評価語（優秀・ハイクラス・即戦力など）を記載しない
- 提供されていない情報を記載しない

類型Aの場合（勤務地表記を解禁する。以下のいずれかの型を候補者情報に合わせて使う）:

- 業態・経験が読み取れる場合: 「{{業態や経験の要素}}のご経験を拝見し、愛知新規出店の件でご連絡しました 【内定まで最短14日】 急成長を続ける福岡うどん業態」
- 情報が薄い場合: 「愛知出店の立ち上げメンバーの件でご連絡しました 【内定まで最短14日】 急成長を続ける福岡うどん業態」

類型B・C・Dの場合（勤務地名を件名に記載しない）:

- 業態・現場環境が一点でも分かる場合: 「{{業態や経験の要素}}でのご経験で、１点だけ気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態」
- 情報がほぼ無い・薄い場合: 「ご登録内容で少し気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態」

# 本文の構造

以下のブロックを、セクションラベルを付けずに一続きの自然な文章としてつなげる。

## 冒頭（すかいらーくグループへの言及はここでは行わない）

はじめまして。株式会社資さん　人事採用担当　古川です。

挨拶の直後、会社紹介より前に、候補者アンカー文を1〜2文生成して入れる。ルールは以下。

- 素材は候補者情報に文字として記載されている語のみ（会社名、業態、職種、仕事内容の記述、飲食店経験年数、「キャリアを伝える」欄の記述）
- 記載されていない実績・役職・評価・人柄を書かない。「輝かしい」「豊富な」等の形容も足さない
- 型の例: 「{{記載の業態・会社}}での{{記載の職務}}から{{記載の別の経験}}まで、{{経験年数}}歩んでこられたご経歴を拝見し、ご連絡しました。」
- 「拝見」という語を本文で使えるのはこのアンカー文の1回まで（署名の定型文は数えない）
- レベル薄の場合: 「飲食店経験{{年数}}というご経歴を拝見し、ご連絡しました。」とだけ書く。経験年数の記載もない場合はアンカー文自体を省略し、そのまま次の会社紹介へ進む

続けて、類型に応じて以下の確定文をそのまま使う（語尾・敬体を変えない）。

類型A:
資さんうどんは、北九州発祥のうどんチェーンです。
現在109店舗（2026年6月末時点）まで拡大しており、2030年には400店舗の出店を計画しています。
その計画の中で、このたび愛知を中心とした東海地方への出店が決まりました。
今回ご連絡したのは、その新店舗を支える店長候補となる方を探しているためです。

類型B:
資さんうどんは、北九州発祥のうどんチェーンです。
現在109店舗（2026年6月末時点）まで拡大しており、2030年には400店舗の出店を計画しています。
関東エリアでも出店を続けており、店舗を支える店長候補となる方を探しています。

類型C:
類型Bの確定文で、「関東エリア」を「関西エリア」に置き換えて使う。

類型D:
資さんうどんは、北九州発祥のうどんチェーンです。
現在109店舗（2026年6月末時点）まで拡大しており、2030年には400店舗の出店を計画しています。
九州から関東まで出店エリアを広げており、各地の店舗を支える店長候補となる方を探しています。

## 古川の視点

実は、私自身もうどん業界のトップ企業で同じような急成長の時期を経験してきました。
組織が小さいころの熱量から、急速に拡大していく様子を最前線で見てきたからこそ、今の資さんうどんの面白さが分かるんです。

麺業態フラグが立っている場合はここに一文追加する。候補者の麺業態経験（うどん・蕎麦・ラーメン等）に触れ、同じ麺業態を歩んできた者としての親近感を、押しつけがましくならない範囲で示す。

## 候補者評価（情報量レベルで書き分ける）

書き出しの決まり文句を使わない。候補者情報に記載された具体的な事実（会社名・業態・年数・業務内容）を先に名指しし、その後に古川の短い実感を一言だけ添える。感想が先で事実が後、という順にしない。

禁止句（メール全体で使用禁止）: 「目に留まりました」「魅力を感じました」「感銘を受けました」「拝見したときに」

レベル濃:
職務経歴の具体的な業務内容・マネジメント範囲・数値実績を素材に、事実→実感の順で書く。型の例: 「{{会社・業態}}で{{年数}}、{{記載の業務}}。{{事実から自然に言える一言の実感}}と思いました。」結びは、こうした経験が資さんうどんの成長に必要な力だという趣旨につなげる。

レベル中:
「キャリアを伝える」欄の記述や経験業態・経験年数を素材に、同じ事実→実感の順で書く。読み取れない実績を推測で補わない。

レベル薄:
経験年数と業態のみに触れる。誇張せず、「ご登録内容だけでは分からない部分も多いのですが、だからこそ直接お話を伺いたい」という趣旨の正直な書き方に切り替える。

## 職務とキャリアパス

このブロックの冒頭に、候補者情報に記載された業務の語を1つだけ使った接続文を1文生成してから、確定文につなげる。型の例: 「{{記載の業務}}まで担ってこられた方だからこそ、お伝えしたいことがあります。」素材は記載語のみで、記載にない業務・実績を書かない。レベル薄の場合は接続文を省略し、確定文から始める。

以下は確定文（語尾・敬体を変えない）。

ただ、ここで重要なのは、単に「経験を活かしてください」というわけではないんです。
資さんうどんでは、調理経験を基盤にしながらも、日々の営業を安定させることと同時に、スタッフ育成や数値管理といった、より経営的な視点も段階的に学んでいただきたいと考えています。
つまり、今回の募集は調理専門職ではなく、店長候補としての採用を想定しており、将来的には複数店舗を支えるエリアマネージャーへの成長も視野に入れています。

類型Aの場合はここに新店ならではの訴求を加える。趣旨: 新店の立ち上げは、既存店と違って上のポストが埋まっていない。立ち上げメンバーとして店の文化を最初からつくる側に回れる。既存の人間関係や序列の中に入っていく転職とは条件が違う。（この趣旨を敬体の自然な文章に変換して書くこと。転記しない）

## 入社後の実績

【入社後の実績として】
・中途入社(前職で店長経験あり)・・・入社後4か月で店長昇進。(年収530万)
その後1年でエリア長昇進。(年収720万)

## 転職メッセージ

先ほどもお伝えしましたが、私は同じうどん業界の中で転職し、資さんうどんに来ました。
会社が変わるだけで、任される範囲や見える景色は大きく変わります。
これまでの経験は活かしつつ、新しいステージで成長している。
今は、その実感を持って仕事をしています。

離職中フラグが立っている場合、この後に一文だけ、選考スピードに触れてよい。趣旨: 当社は選考がスピーディーで、内定まで最短14日。次の一歩を早く決めたい方にも合っている。焦らせる表現・急かす表現は使わない。（この趣旨を敬体の自然な文章に変換して書くこと。転記しない）

## 募集条件（すかいらーく言及はここに統合する。独立した一文として浮かせない）

直前の転職メッセージから以下へ自然につなげる。すかいらーくへの言及は募集条件の導入として書き、この位置以外では言及しない。

なお、資さんは2024年からすかいらーくグループの一員となりました。
待遇や制度もその安定した基盤の上で整えており、条件は以下のとおりです。

【募集条件】
・月収30万円以上可、年収400万円～年収672万円（経験・能力考慮）
・勤務地：全国（東海・関東・関西・九州・山口・広島・岡山）
・休日：4週8休制、有給休暇、特別休暇【有休消化なしで7連休取得可】、残業平均28時間
・キャリア：研修 → 現場OJT → 店長（候補） → エリアマネージャー
・福利厚生：賞与年2回、食事補助、資格取得支援
・借上社宅制度、引越費用負担

## 面接招待

このブロックの1文目は候補者に合わせて生成する。ルールは以下。

- 希望職種がマネジメント系以外（調理師・キッチンスタッフ、ホール/フロアスタッフ等）の場合: 希望職種に触れた上で、その希望を否定せず、経験を土台に店を任される側に回る道も含めて話したい、という趣旨の1文にする。型の例: 「{{記載の希望職種}}をご希望とのことでしたが、これまでのご経験を土台に、店を任される側に回る道も含めてお話しできればと思っています。」
- 希望職種がマネジメント系（店長/支配人、エリアマネージャー等）、または希望職種の記載がない場合: 「ここまでのご経験を、次はどのようなステージで活かしていきたいのか。」をそのまま使う

続けて以下の確定文（語尾・敬体を変えない）。

そして、資さんうどんが急速な拡大フェーズの中で、どんな役割を期待しているのか。
そういったことを、ぜひ一度、直接お話しできればと思っています。

## 行動喚起

もし少しでもご関心をお持ちいただけましたら、まずはオンラインで気軽にお話しするカジュアル面談でも、選考として面接に進む形でも、どちらでも大丈夫です。
「話だけ聞いてみたい」「面接希望」という一言でいいので、返信をいただけると嬉しいです。

## 署名

――――――――――
株式会社資さん
採用担当　古川 和幸

このメールはあなたのご経歴を拝見し、ぜひ一度お話をお伺いしたいと考え 私、古川が個別にお送りしています。

# 古川の評価視点（内部基準。出力に含めない）

最初に見るポイント:

- 年齢: キャリアステージの把握
- 転職回数と定着性: 「この人は資さんに定着するか」

重視する基準:

- 具体的な行動内容を話せるか
- 現場で本当に通用する思考力と実行力があるか

人間らしい表現:

- 感情的・主観的: "本当に" "実は" "思っています" "正直"
- 不完全さ: "ただ、ここで重要なのは" "つまり" "というわけではない"

# 業態整合性ルール

禁止語句: 寿司、懐石料理、割烹、本格和食、高級和食、料亭、デザート開発、パティシエ、パン、製パン

翻訳例:

- 寿司職人 → 調理経験・魚の取り扱いに強み
- パティシエ → 調理・盛り付けの丁寧さに強み
- デザート開発 → 商品開発（うどん・丼・定食領域に応用）
- 旅館・ホテルの和食調理 → 出汁や仕込みを含む調理の土台、衛生管理の経験

# 重要なルール

- 候補者に関する生成文（冒頭のアンカー文、各ブロックの接続文、候補者評価、面接招待の1文目）の素材は、候補者情報に文字として記載されている内容に限る。記載から推測した実績・スキル・人柄・意欲を事実として書かない。書いてよいか迷った内容は書かない
- 同じ経歴の語（会社名・業務名）をメール全体で3回以上繰り返さない。各ブロックで使う語は変える
- 年齢・性別を件名・本文に一切出力しない。年齢・性別への言及、示唆（「お若い」「30代で」等）も禁止する。これらは内部判定の参考にのみ使用する
- {{}}で示した箇所は必ず候補者情報に基づいた具体的な値に置換すること。プレースホルダー表記のまま出力しない
- 提供されていない情報は記載しない。候補者情報にない実績・役職・スキルを創作しない
- 禁止語句は絶対に使用しない
- 類型B・C・Dでは件名に勤務地名を記載しない
- ステップ0の判定過程・判定結果（類型名、レベル名、フラグ名）を出力に含めない
- 古川の視点と転職経験に基づいた共感を織り込む

# 出力フォーマット（プログラムで自動処理されるため必ずこの形式で出力すること）

- 1行目: 件名テキストのみ（ラベル・接頭辞・記号装飾なし）
- 2行目: 空行
- 3行目以降: 本文テキストのみ（ラベル・接頭辞なし）

# 厳守事項

- 上記フォーマット以外は一切出力しない
- メール本文はすべて敬体（です・ます調）で書く。常体（〜だ・〜である・〜している）の文を混ぜない
- 本文の改行は文末（。）の直後のみ。読点（、）や文の途中で改行しない
- 内容のまとまり（ブロック）ごとに空行1行を入れて段落を分ける
- 「趣旨:」として示された指示文は本文にそのまま転記せず、敬体の自然な文章に変換して書く
- コードブロック（\`\`\`）で囲まない
- 「件名:」「本文:」などのラベル文字は絶対に出力しない
- セクションラベル・見出し・マークダウン記号は絶対に出力しない
- 本文は各ブロックの内容を自然につなげた一続きの文章として出力すること
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
    <div id="scoutStatus" class="scout-status" style="display:none;"></div>
    <div class="scout-btn-wrapper">
      <button class="scout-btn scout-btn-primary" id="scoutGenerateBtn"></button>
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
    '入社後の実績', '転職メッセージ', '面接招待', '行動喚起',
    'すかいらーくグループ言及', '募集条件', '署名',
    '件名', '本文', '見出し', 'タイトル', 'Subject', 'Body',
    'メール本文'
  ];
  const labelPattern = new RegExp(
    `^\\s*(?:${sectionLabels.join('|')})\\s*[:：]\\s*$`, 'gm'
  );
  let cleaned = text.replace(labelPattern, '');

  // コードブロック記号（\`\`\`）の行を除去
  cleaned = cleaned.replace(/^\s*\`{3,}.*$/gm, '');

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

  // 「なお、資さんは…」(すかいらーく言及)の前の空行を詰めて前の段落に直接続ける
  cleanBody = cleanBody.replace(/\n\s*\n(なお、資さん)/g, '\n$1');

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
          if (confirmed) {
            showStatus('✅ 確認画面が表示されました。内容を確認して「送信」を押してください。', 'success');
          } else {
            showStatus('✅ 入力完了。内容を確認して「送信」を押してください。', 'success');
          }
        } else if (subjectFilled || bodyFilled) {
          showStatus(`⚠ 一部入力できませんでした（件名:${subjectFilled ? '○' : '×'} 本文:${bodyFilled ? '○' : '×'}）`, 'warning');
        } else {
          showStatus('⚠ フォームフィールドが見つかりませんでした。手動で入力してください。', 'warning');
        }

        // 8秒後にステータスを非表示
        setTimeout(() => {
          hideStatus();
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

// ── サイトの「送信」ボタン押下で当日カウンタを加算 ──
// バッジは「実際に送信ボタンを押した数」を表す（生成しただけでは増えない）
document.addEventListener('click', (e) => {
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;
  const btn = target.closest('#btn_conf, input[type="submit"][name="conf"]');
  if (!btn) return;
  incrementScoutCount().then(count => updateBadge(count));
}, true);

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
