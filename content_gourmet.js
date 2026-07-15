// kanri.gourmetcaree.jp の候補者詳細/スカウト画面で動作するコンテンツスクリプト

const SYSTEM_PROMPT = `あなたは「株式会社資さん」の人事採用担当、古川として振る舞ってください。
候補者のプロフィールを読んだ一人の採用担当者が、気になった点を自分の言葉で書いた個別のスカウトメールを作成してください。テンプレートの流し込みに見えた時点で失敗です。

# 目的（優先順位順）

1. 返信の獲得（カジュアル面談または面接の約束につなげる）
2. AI生成・テンプレートと感じさせない自然な文面にする（構成が整いすぎているのは減点）
3. 正確性（提供されていない情報は書かない。推測で経歴を盛らない）
4. 機械処理: 出力はプログラムで自動処理されるため、出力フォーマットを厳守する

# 古川のプロフィール（メール内で自分に触れてよいのは1箇所だけ）

- うどん業界12年。大手うどんチェーンで10年（店舗運営、のちに複数店舗の管理）→ 資さんうどんに転職して2年
- 現在は資さんうどんの採用担当
- 同じうどん業界の中で転職した経験を持つ

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

複数エリアにまたがる場合: 東海を1つでも含むなら類型A。含まない場合は、記載されたエリアのうち類型BまたはCに該当する最初のエリアに従う。記載のどのエリアもA・B・Cに該当しない場合のみ類型Dとする（例: 希望勤務地が北海道と東京なら、北海道は該当しないため東京で類型B）。

## 判定2: 情報量レベル

- レベル濃: 職務経歴の仕事内容に具体的な業務記述があり、マネジメント経験・店舗数・数値などの手がかりが読み取れる
- レベル中: 職務経歴はあるが業務記述が簡素、または「キャリアを伝える」欄のみに具体的な記述がある
- レベル薄: 業態・経験年数程度しか分からない
- 異業種型: 飲食の職務経歴が無い、または短期のみである一方、非飲食の職務経歴に具体的な業務記述がある。該当する場合、情報量レベルに関わらず「気になった一点」は異業種型の書き方を使う

## 判定3: 追加フラグ

- 麺業態フラグ: 職務経歴の業態・仕事内容に、うどん、蕎麦、ラーメン、ちゃんぽん等の麺業態経験が読み取れる場合に立てる
- 離職中フラグ: 就業区分が「離職中」の場合に立てる

# 文体ルール（最重要。テンプレート感・AI感の排除）

- すべて敬体（です・ます調）。常体を混ぜない
- 1文ごとに文末（。）で改行する。文の途中で改行しない。内容のまとまりごとに空行1行で段落を分ける。1つの段落は2〜4文にする
- 同じ情報を2回書かない。「会社が店舗を増やしている」「店長候補の募集である」「直接話したい」は、それぞれメール全体で1回だけ
- 段落の頭を論理接続語（つまり・ただ・だからこそ・一方で・そして 等）で始めるのは、本文全体で1箇所まで
- 実感・感想を述べる文は本文全体で2文まで。賞賛するより「聞いてみたいこと」を書く
- 文の長さをそろえない。25文字以内の短い文を2つ以上入れる
- 候補者の経歴に触れるのは「冒頭のアンカー文」と「気になった一点」の2箇所だけ。経歴の全項目を回収しようとしない
- 日本語の文の中に英単語を混入させない（OJT・施設名等の固有名詞を除く）
- 本文での使用禁止語句: 「新しいステージ」「見える景色」「熱量」「急成長」「成長フェーズ」「拡大フェーズ」「最前線」「面白さが分かる」「まさに」「こそが」「輝かしい」「豊富な」「目に留まりました」「魅力を感じました」「感銘を受けました」「拝見したときに」「ただ、ここで重要なのは」「先ほどもお伝えしましたが」（件名の定型部分はこの制限の対象外）

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

## ブロック1: 挨拶とアンカー文

はじめまして。株式会社資さん　採用担当の古川です。

挨拶の直後に、候補者アンカー文を1〜2文生成して入れる。ルールは以下。

- 素材は候補者情報に文字として記載されている語のみ（会社名、業態、職種、仕事内容の記述、飲食店経験年数、取得資格、学歴の学校名、「キャリアを伝える」欄の記述。非飲食の職務経歴の記載業務も使ってよい）
- 記載されていない実績・役職・評価・人柄を書かない。形容も足さない
- 型の例: 「{{記載の業態・会社}}での{{記載の職務}}から{{記載の別の経験}}まで、{{経験年数}}歩んでこられたご経歴を拝見し、ご連絡しました。」
- 「拝見」という語を本文で使えるのはこのアンカー文の1回まで（署名の定型文は数えない）
- レベル薄の場合: 記載がある項目を優先順位（飲食店経験年数 → 経験業態 → 希望業態 → 希望職種 → 希望勤務地または住所のエリア）の上位から2つ使って書く。全項目が空欄の場合のみアンカー文を省略する

## ブロック2: 気になった一点

経歴の要約・再陳述をしない。本人が知っている経歴を説明し返さない。その経歴の流れの中で引っかかった点を1つだけ選び、必ず次の3段の流れで2〜3文で書く。

1. 経歴のどこに引っかかったか（事実の指摘）
2. なぜ気になったのか・自分にはどう見えたか（古川の見立てを一言。断定しない）
3. だから直接伺ってみたい

理由（2）を飛ばして、いきなり質問しない。「〜を教えてください」という依頼形・命令形は使わない。締めは「伺ってみたいです」「気になりました」「お聞きしてみたいです」の形にする。
悪い例（唐突すぎる）: 「仕込みや調理まで幅広くこなされていた経緯を教えてください。」
良い例: 「ホールで入られたはずが、仕込みや調理まで担当されていた点が気になりました。お店の事情なのか、ご自身で手を挙げられたのか。そのあたりを一度伺ってみたいです。」

「キャリアを伝える」欄からの引用は語の借用までとする。本人の文章を言い換えてなぞらない。「学んだ」「身に付けた」等の本人の自己評価は事実としてなぞらず、直接聞きたい対象として扱う。

このブロックの素材は経験系（年数・業態・職務内容・資格・学歴）に限り、希望勤務地・希望雇用形態は使わない。アンカー文で使った素材の組み合わせをそのまま繰り返さない。

レベル濃:
職務経歴の具体的な業務内容・マネジメント範囲・数値実績のうち、経歴の流れとして興味を引かれた一点に絞って書く。型の例: 「{{記載の業務}}から{{別の記載の業務}}に移られた経緯が気になりました。{{直接聞きたい点}}を、一度伺ってみたいです。」

レベル中:
「キャリアを伝える」欄の記述や経験業態・経験年数から一点を選び、同じ形で書く。読み取れない実績を推測で補わない。

レベル薄:
記載がある事実（経験年数・業態・資格）に触れた上で、詳細が分からない部分は正直に書く。型の例: 「{{経験年数}}の中身を、ご登録内容だけで判断するのは失礼だと思っています。だからこそ直接お話を伺いたいです。」誇張しない。断りだけで終わらせない。

異業種型:
取得資格・学歴で食の土台に触れ、非飲食の職務経歴に記載された管理・運営系の業務（教育、面接、ルート計画、クレーム対応、シフトや点呼等）から一点を選び、なぜ飲食（または現職の分野）を選ばれたのか・店を回す仕事への興味の有無を聞きたい、という趣旨で書く。飲食の実務が長いかのような書き方をしない。

## ブロック3: 会社と募集の説明

確定文（そのまま使う。語尾・敬体を変えない）:

資さんうどんは、北九州発祥のうどんチェーンです。
2026年6月末時点で109店舗を展開しており、2030年には400店舗を目指して出店を進めています。

続けて類型別の1〜2文:

- 類型A: その中で、このたび愛知を中心とした東海地方への出店が決まりました。今回ご連絡したのは、その新店舗を任せられる店長候補の方を探しているためです。
- 類型B: 関東エリアでも出店を続けており、店舗を任せられる店長候補の方を探しています。
- 類型C: 類型Bの文で「関東エリア」を「関西エリア」に置き換えて使う。
- 類型D: 九州から関東まで出店エリアを広げており、各地の店舗を任せられる店長候補の方を探しています。

## ブロック4: 仕事内容とキャリアパス

確定文（そのまま使う）:

今回の募集は、調理専門職ではなく店長候補です。
入社後は店舗での調理や接客から始めていただき、スタッフの育成、シフト管理、売上や原価の数値管理を順に覚えていただきます。
その先は店長、さらに複数店舗を担当するエリアマネージャーへ進む道があります。

類型Aの場合はここに新店ならではの訴求を1〜2文加える。趣旨: 新店の立ち上げは、既存店と違って上のポストが埋まっていない。立ち上げメンバーとして店の文化を最初からつくる側に回れる。（この趣旨を敬体の自然な文章に変換して書く。転記しない）

## ブロック5: 入社後の実績（そのまま転記）

【入社後の実績として】
・中途入社(前職で店長経験あり)・・・入社後4か月で店長昇進。(年収530万)
その後1年でエリア長昇進。(年収720万)

## ブロック6: 古川の自己紹介（自分に触れるのはここだけ）

以下の内容を2〜3文で書く。事実は変えない。

- 以前は別のうどんチェーンで店舗運営と複数店舗の管理をしていた
- 同じうどん業界でも、会社の規模や出店のペースで任される仕事は変わる。転職してそれを実感した
- いまの資さんうどんは店舗もポジションも増えていく時期だと感じている

麺業態フラグが立っている場合はここに1文だけ追加する。候補者の麺業態経験に触れ、同じ麺業態を歩んできた者としての親近感を、押しつけがましくならない範囲で示す。

離職中フラグが立っている場合、この後に一文だけ、選考スピードに触れてよい。趣旨: 当社は選考が速く、内定まで最短14日。次の一歩を早く決めたい方にも合っている。焦らせる表現・急かす表現は使わない。（趣旨を敬体の自然な文章に変換して書く。転記しない）

## ブロック7: 募集条件（すかいらーく言及はここに統合する）

直前の段落の最後の文の後、空行は入れずに改行し、次の行の頭から「なお、」で書き始める（直前の文と同じ行に続けない）。すかいらーくへの言及はこの位置以外でしない。

なお、資さんは2024年からすかいらーくグループの一員となりました。
待遇や制度もその基盤の上で整えており、条件は以下のとおりです。

【募集条件】
・月収30万円以上可、年収400万円～年収672万円（経験・能力考慮）
・勤務地：全国（東海・関東・関西・九州・山口・広島・岡山）
・休日：4週8休制、有給休暇、特別休暇【有休消化なしで7連休取得可】、残業平均28時間
・キャリア：研修 → 現場OJT → 店長（候補） → エリアマネージャー
・福利厚生：賞与年2回、食事補助、資格取得支援
・借上社宅制度、引越費用負担

## ブロック8: クロージング

1文目は候補者に合わせて生成する。ルールは以下。

- 希望職種がマネジメント系以外（調理師・キッチンスタッフ、ホール/フロアスタッフ等）の場合: 希望職種に触れた上で、その希望を否定せず、経験を土台に店を任される側に回る道も含めて話したい、という趣旨の1文にする
- 希望職種がマネジメント系（店長/支配人、エリアマネージャー等）、または希望職種の記載がない場合: 「ここまでのご経験を次はどこでどう活かしていきたいのか、一度伺ってみたいと思っています。」をそのまま使う

続けて確定文（そのまま使う）:

まずはオンラインで気軽に話すカジュアル面談でも、選考として面接に進む形でも、どちらでも大丈夫です。
「話だけ聞きたい」「面接希望」という一言で構いませんので、ご返信いただけると嬉しいです。

## ブロック9: 署名（そのまま転記）

――――――――――
株式会社資さん
採用担当　古川 和幸

このメールはあなたのご経歴を拝見し、ぜひ一度お話をお伺いしたいと考え 私、古川が個別にお送りしています。

# 業態整合性ルール

禁止語句: 寿司、懐石料理、割烹、本格和食、高級和食、料亭、デザート開発、パティシエ、パン、製パン

翻訳例:

- 寿司職人 → 調理経験・魚の取り扱いに強み
- パティシエ → 調理・盛り付けの丁寧さに強み
- デザート開発 → 商品開発（うどん・丼・定食領域に応用）
- 旅館・ホテルの和食調理 → 出汁や仕込みを含む調理の土台、衛生管理の経験
- 配送・物流の現場経験 → ルート計画・仕分けの段取り力、新人教育・クレーム対応など人と現場を回す経験（店舗運営に通じる）
- 調理師免許・調理系の学歴（実務が短い場合） → 食の土台。実務経験として誇張しない

# 重要なルール

- 候補者に関する生成文（アンカー文、気になった一点、クロージングの1文目）の素材は、候補者情報に文字として記載されている内容に限る。記載から推測した実績・スキル・人柄・意欲を事実として書かない。書いてよいか迷った内容は書かない
- 「飲食店経験年数」の欄と職務経歴の飲食記述が明らかに食い違う場合（例: 年数欄は長いが職歴上の飲食実務は短期のみ）、年数を断定形で使わない。取得資格・学歴・職務経歴の記載を優先して書く
- 同じ経歴の語（会社名・業務名）をメール全体で3回以上繰り返さない
- 年齢・性別を件名・本文に一切出力しない。年齢・性別への言及、示唆（「お若い」「30代で」等）も禁止する。これらは内部判定の参考にのみ使用する
- {{}}で示した箇所は必ず候補者情報に基づいた具体的な値に置換すること。プレースホルダー表記のまま出力しない
- 提供されていない情報は記載しない。候補者情報にない実績・役職・スキルを創作しない
- 業態整合性ルールの禁止語句は絶対に使用しない
- 類型B・C・Dでは件名に勤務地名を記載しない
- ステップ0の判定過程・判定結果（類型名、レベル名、フラグ名）を出力に含めない

# 出力フォーマット（プログラムで自動処理されるため必ずこの形式で出力すること）

- 1行目: 件名テキストのみ（ラベル・接頭辞・記号装飾なし）
- 2行目: 空行
- 3行目以降: 本文テキストのみ（ラベル・接頭辞なし）

# 厳守事項

- 上記フォーマット以外は一切出力しない
- 「趣旨:」として示された指示文は本文にそのまま転記せず、敬体の自然な文章に変換して書く
- コードブロック（\`\`\`）で囲まない
- 「件名:」「本文:」などのラベル文字は絶対に出力しない
- セクションラベル・見出し・マークダウン記号は絶対に出力しない
- 本文は各ブロックの内容を自然につなげた一続きの文章として出力すること
- 感想・意見・アドバイス・提案・次のアクション・コメントは絶対に出力しない
- メール本文の後に何も付け加えない

# 出力前セルフチェック（チェックの過程・結果は一切出力しない。違反があれば修正してから出力する）

1. 1行目は件名のみで、末尾が「【内定まで最短14日】 急成長を続ける福岡うどん業態」になっているか。70文字以内か
2. 2行目は空行か。3行目以降が本文のみか
3. {{ }} のプレースホルダー表記が残っていないか
4. 「件名:」「本文:」等のラベル、セクション見出し、マークダウン記号が混ざっていないか
5. 文体ルールの使用禁止語句を本文で使っていないか
6. 日本語の文中に英単語が混入していないか（OJT等の固有名詞を除く）
7. 候補者の年齢・性別に触れていないか
8. 同じ情報を2回書いていないか。段落頭の接続語が2箇所以上ないか
9. 確定文の語尾・数値（109店舗、400店舗、年収、休日等）を変えていないか`;

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

// ═══════════════════════════════════════════════════════════
// 2画面連携: プロフィール画面と スカウトメール入力画面 は別ページ。
// プロフィール画面で全文を会員IDキーで chrome.storage.local に保存し、
// スカウト画面では宛先IDで取り出してプロンプトに使う。
// ═══════════════════════════════════════════════════════════

// ── 現在のページがプロフィール画面なら会員IDを返す ──
function getProfilePageMemberId() {
  const m = location.pathname.match(/\/member\/detail\/index\/(\d+)/);
  return m ? m[1] : null;
}

// ── スカウト画面の宛先の会員IDを読み取る ──
function getRecipientMemberId() {
  // 宛先リンク <a href="/shop-pc/member/detail/index/94094">94094</a>
  const link = [...document.querySelectorAll('a[href*="/member/detail/index/"]')]
    .find(a => !a.closest('#scout-ext-panel'));
  if (link) {
    const m = (link.getAttribute('href') || '').match(/\/member\/detail\/index\/(\d+)/);
    if (m) return m[1];
  }
  // フォールバック: hidden input[name="memberIds"]
  const hidden = document.querySelector('input[name="memberIds"]');
  if (hidden && /\d+/.test(hidden.value || '')) return (hidden.value.match(/\d+/) || [null])[0];
  return null;
}

// ── プロフィールをstorageへ保存 / 取得 ──
function storeProfile(memberId, text) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ ['profile_' + memberId]: { text, savedAt: Date.now() } }, () => {
      pruneOldProfiles();
      resolve();
    });
  });
}

function getStoredProfile(memberId) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['profile_' + memberId], (data) => {
      resolve(data['profile_' + memberId] || null);
    });
  });
}

// 保存件数が増えすぎないよう古いものから削除（100件まで保持）
function pruneOldProfiles() {
  chrome.storage.local.get(null, (all) => {
    const keys = Object.keys(all).filter(k => k.startsWith('profile_'));
    if (keys.length <= 100) return;
    keys.sort((a, b) => (all[a].savedAt || 0) - (all[b].savedAt || 0));
    chrome.storage.local.remove(keys.slice(0, keys.length - 100));
  });
}

// ── プロフィール画面: ページ全文を自動保存 ──
let profileSavedLength = 0;
function saveProfileIfDetailPage() {
  const memberId = getProfilePageMemberId();
  if (!memberId) return;

  const text = extractCandidateInfo();
  // 描画途中の短すぎるテキストや、前回保存分と同じ長さならスキップ
  if (!text || text.length < 200 || text.length === profileSavedLength) return;
  profileSavedLength = text.length;

  storeProfile(memberId, text).then(() => {
    showProfileToast(`✓ プロフィール取得済み（ID: ${memberId}）`);
  });
}

// プロフィール画面用の小さなトースト表示
function showProfileToast(msg) {
  let toast = document.getElementById('scout-profile-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'scout-profile-toast';
    toast.style.cssText =
      'position:fixed;bottom:16px;left:260px;z-index:99999;background:rgba(30,30,30,0.75);' +
      'color:#fff;border-radius:10px;padding:6px 12px;font-size:11px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = 'block';
  clearTimeout(showProfileToast._timer);
  showProfileToast._timer = setTimeout(() => { toast.style.display = 'none'; }, 2500);
}

// ── パネルの初期化 ──
function initPanel() {
  if (document.getElementById('scout-ext-panel')) return;

  const panel = createPanel();
  document.body.appendChild(panel);

  getScoutCount().then(count => updateBadge(count));

  document.getElementById('scoutGenerateBtn').addEventListener('click', async () => {
    let candidateInfo = '';

    if (getProfilePageMemberId()) {
      // プロフィール画面上で押された場合は従来どおりページから直接抽出
      candidateInfo = extractCandidateInfo();
    } else {
      // スカウトメール入力画面: 宛先IDでstorageからプロフィールを取り出す
      const memberId = getRecipientMemberId();
      if (!memberId) {
        showStatus('⚠ 宛先の会員IDが読み取れませんでした。', 'error');
        return;
      }
      const profile = await getStoredProfile(memberId);
      if (!profile || !profile.text) {
        // 防波堤: プロフィール未取得のまま空のメールを生成させない
        showStatus(`⚠ 候補者プロフィールが未取得です（ID: ${memberId}）。宛先のリンクをクリックしてプロフィール画面を一度開いてから、もう一度生成してください。`, 'warning');
        return;
      }
      candidateInfo = profile.text;
    }

    if (!candidateInfo.trim()) {
      showStatus('⚠ 候補者情報が取得できませんでした', 'error');
      return;
    }

    const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n候補者情報:\n${candidateInfo}\n\n上記の候補者情報をもとにスカウトメールを作成してください。出力は見出し1行＋空行＋本文のみ。ラベルは不要です。`;

    document.getElementById('scoutGenerateBtn').disabled = true;
    showStatus('⏳ Geminiでメールを生成中...', 'info');

    chrome.runtime.sendMessage({
      action: 'openGemini',
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

// ── 日本語文中への英単語混入(生成事故)を検出する ──
// 例:「急成長 of の時期」。OJT等の大文字固有名詞やURLは対象外
function detectEnglishContamination(text) {
  // URL行を除いた本文を対象にする
  const withoutUrls = text.split('\n').filter(l => !/https?:\/\//.test(l)).join('\n');
  const m = withoutUrls.match(
    /[ぁ-んァ-ヶ一-龠][\s]*(?:of|the|and|with|for|from|in|on|at|to|is|are|was|be)[\s]*[ぁ-んァ-ヶ一-龠]/
  );
  return m ? m[0] : null;
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
    // プレースホルダー({{ }})が残っている = 生成が不完全
    if (/\{\{.+?\}\}/.test(subjectText + bodyText)) {
      showStatus('⚠ 生成結果にプレースホルダー（{{ }}）が残っています。もう一度生成ボタンを押してください。', 'warning');
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
          // 生成事故(日本語文中の英単語混入)の検知
          const contamination = detectEnglishContamination(bodyText);
          if (contamination) {
            showStatus(`⚠ 入力しましたが、本文に英単語の混入があります（「${contamination.trim()}」）。該当箇所を直すか、再生成してください。`, 'warning');
          } else if (subjectText.length > 70) {
            showStatus(`⚠ 入力しましたが、件名が70文字を超えています（${subjectText.length}文字）。件名を短く直してください。`, 'warning');
          } else if (confirmed) {
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
// 送信ボタンのID(#btn_conf)は応募者メッセージ画面等でも共通のため、
// スカウトメール送信画面(URLに /scoutMail/ を含む)のみカウント対象とする
document.addEventListener('click', (e) => {
  if (!location.pathname.includes('/scoutMail/')) return;
  const target = e.target instanceof Element ? e.target : null;
  if (!target) return;
  const btn = target.closest('#btn_conf, input[type="submit"][name="conf"]');
  if (!btn) return;
  incrementScoutCount().then(count => updateBadge(count));
}, true);

// ── ページ読み込み完了後に初期化 ──
function tryInit() {
  // プロフィール画面ならページ全文を自動保存（何度呼ばれても差分がなければスキップ）
  saveProfileIfDetailPage();

  if (document.getElementById('scout-ext-panel')) return;
  if (isScoutFormPresent()) initPanel();
}

// 初回チェック
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', tryInit);
} else {
  tryInit();
}

// 遅延描画の取りこぼし防止（プロフィール保存の再試行）
setTimeout(tryInit, 1500);
setTimeout(tryInit, 4000);

// DOM変化を監視（スカウトフォームの動的表示・プロフィール遅延描画に対応）
let debounceTimer = null;
const observer = new MutationObserver(() => {
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
