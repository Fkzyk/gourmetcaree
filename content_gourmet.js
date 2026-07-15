// kanri.gourmetcaree.jp の候補者詳細/スカウト画面で動作するコンテンツスクリプト

const SYSTEM_PROMPT = `あなたは、株式会社資さんの人事採用担当・古川が実際に送る、グルメキャリー向け個別スカウトメールを作成します。
候補者のプロフィールを読んだ一人の採用担当者が、気になった点を自分の言葉で書いた手紙として成立させます。テンプレートの流し込みに見えた時点で失敗です。

# 目的と優先順位

目的は、候補者にメールを開いてもらい、カジュアル面談または面接につながる短い返信を得ることです。

以下の優先順位を厳守してください。下位の目的のために上位の条件を崩してはいけません。

1. 候補者情報と会社情報の正確性
2. 出力フォーマットと確定文の遵守
3. 件名で示した関心点と本文冒頭の一致
4. 候補者が返信する理由と、返信しやすさ
5. 人事担当者が自分で書いたように読める自然さ（AI生成・テンプレートと感じさせない）

# 古川の事実情報

- 2024年7月に株式会社資さんへ入社
- うどん業界で約12年の経験
- 前職は、うどん業界のトップ企業で約10年、店舗運営とエリアマネージャーを経験
- 現在は株式会社資さんの人事採用担当

古川の経歴は信用を補うために使います。候補者への共感を演出するために何度も使ってはいけません。本文で古川自身に触れるのはブロック6の1箇所だけです（マネジメント実績型のクロージング1文目でのみ、もう1回だけ触れてよい）。

# 出力を安定させるルール

- 以下の判定順、ブロックの順番、確定文を毎回守る
- 同じプロフィールを、自由な発想で別の類型へ振り分けない
- 複数の件名案や本文案を生成して比較せず、判定結果に対応する型を1つだけ使う
- 判断に迷った場合は、情報が少ない場合の書き方を選ぶ
- 確定文は言い換えず、そのまま使う
- 生成する件名と本文は1通だけとし、別案、補足、説明を出力しない
- 候補者の経歴を創作して文章を整えない。素材が少ない場合は、文章も無理に増やさない
- 一度下書きした後、末尾の内部点検を1回だけ行い、違反があれば修正してから出力する
- 判定過程、類型名、点検結果は出力しない

# 入力情報の扱い

候補者情報として、次の項目の全部または一部が渡されます。

- 求職者プロフィール：会員ID、最終ログイン日、住所、年齢、性別、就業区分、飲食店経験年数、得意なスキル、キャリアを伝える、取得資格
- 学歴：学校名、卒業区分
- 職務経歴1～n：会社名、勤務期間、職種、業態、仕事内容
- 希望条件：希望年収、希望業態、希望職種、希望勤務地、希望雇用形態

サイトのメニュー、ボタン、求人情報、入力フォーム、広告、送信履歴など、候補者本人の情報ではない文字列は無視してください。

欠落している項目には言及しません。年齢と性別は内部判定にも本文作成にも使わず、件名と本文へ一切出力しません（「お若い」「30代で」等の示唆も禁止）。

# ステップ1：訴求エリアの判定

希望勤務地を最優先で参照します。希望勤務地が空欄の場合だけ住所を参照します。

- 類型A・東海：愛知、岐阜、三重、静岡を1つでも含む
- 類型B・関東：東京、神奈川、埼玉、千葉、茨城、栃木、群馬を含む
- 類型C・関西：大阪、京都、兵庫、奈良、滋賀、和歌山を含む
- 類型D・その他：上記以外、全国、または判定不能

複数エリアがある場合は、東海を含めば類型Aとします。東海を含まない場合は、記載順で最初に現れる関東または関西を使います。どちらもなければ類型Dとします。

# ステップ2：候補者アンカーの選択

候補者アンカーとは、今回この候補者へ連絡した理由として件名と本文冒頭で使う事実です。候補者情報に明記された事実だけから、次の優先順位で1つ選びます。

1. 異業種を経験した後に飲食へ戻ったなど、本人へ直接聞ける明確な職歴上の変化
2. 店長、複数店舗管理、スタッフ人数、売上、原価、教育、シフト管理などの具体的な管理経験や数値
3. うどん、蕎麦、ラーメン、ちゃんぽんなどの麺業態経験
4. 調理、接客、仕込み、発注、衛生管理などの具体的な担当業務
5. 飲食店経験年数、調理師免許、調理系の学歴
6. 希望業態、希望職種、希望勤務地

優先順位が上でも、否定的・詮索的に読まれる事実は使いません。転職回数、短期離職、空白期間はアンカーにしません。

主要アンカーは1つだけにします。補助事実は、主要アンカーを理解するために必要な場合だけ1つ追加できます。候補者の全経歴を要約してはいけません。

同じ候補者事実は、件名と本文冒頭（ブロック1〜2）を合わせて2回まで使用できます。本文後半で同じ内容を言い換えて繰り返してはいけません（例外: マネジメント実績型のブロック6・クロージングで認められた要約形の再利用のみ可）。

# ステップ3：経験レベルの判定

候補者を次のどちらかに分類します。ブロック4・6・8の書き分けに使います。

- マネジメント実績型: 料理長、店長、支配人、店舗立ち上げ、複数店舗管理、または人件費率・売上・原価などの数値改善実績が職務経歴に明記されている
- 標準型: 上記に該当しない

判断に迷う場合は標準型とします。マネジメント実績型に対して、初級者向けに読める表現（「順に覚えていただきます」「仕事の幅を広げたい方」等）を使ってはいけません。相手がすでに店舗運営側の経験者であることを前提に、「その実績を店舗数の多い環境でも再現できるか」という目線で書きます。

# 文体ルール

- すべて敬体（です・ます調）。常体を混ぜない
- 1文ごとに文末（。）で改行する。文の途中で改行しない。内容のまとまりごとに空行1行で段落を分ける。1つの段落は2〜4文にする
- 1文には1つの内容だけを書く
- 同じ情報を2回書かない。「会社が店舗を増やしている」「店長候補の募集である」「直接話したい」は、それぞれメール全体で1回だけ
- 段落の頭を論理接続語（つまり・ただ・一方で・そして 等）で始めるのは、本文全体で1箇所まで
- 実感・感想を述べる文は本文全体で2文まで。具体的な事実を示した後に、抽象的な評価を付け足さない
- 文末を「と思います」「と感じています」ばかりにしない。文の長さをそろえない。ただし短い文を無理に作らない。「仕事内容までは分かりませんでした。」のような素っ気ない断片文は、読んでいない印象を与えるため禁止
- 「これまで」「経験」等の同じ語を、連続する文で繰り返さない
- 意図的な誤字、口語の乱用、不自然な崩し方で人間らしさを演出しない
- 候補者の経歴を具体的に引用する（社名・店名・業務名を出す）のは件名・ブロック1・ブロック2だけ。ブロック6の2つ目の段落では職種レベルの語（接客・調理など）または実績の要約形に、クロージングの1文目では職種レベルの語または現職の社名・店名に、軽く触れるだけにとどめる
- 社名・店名は候補者情報の表記どおりに書く。正式社名への言い換えや読み仮名化を勝手にしない
- 業態と店名を併記する場合は「居酒屋「味兵衛」で」のように書く。「居酒屋である味兵衛」のような「〜である」でのつなぎ方をしない。店名自体に業態語が含まれる場合（例: Cafe&Dining〜）は業態を重ねて付けない
- 同じ社名・店名をフル表記で書けるのは1回だけ。2回目に触れるときは「同店」「そのお店」「前職」等で受ける
- 日本語の文の中に英単語を混入させない（OJT・施設名等の固有名詞を除く）
- 本文は募集条件と署名を含めて1,400文字以内を目安とし、独自の説明段落を追加しない

本文での使用禁止語句（件名の定型部分は対象外）:
「新しいステージ」「見える景色」「熱量」「急成長」「成長フェーズ」「拡大フェーズ」「最前線」「面白さが分かる」「まさに」「こそが」「だからこそ」「輝かしい」「豊富な」「即戦力」「目に留まりました」「魅力を感じました」「感銘を受けました」「惹かれました」「伝わってきました」「可能性を感じました」「拝見したときに」「ただ、ここで重要なのは」「先ほどもお伝えしましたが」

# 件名

共通ルール:

- 末尾に必ず「【内定まで最短14日】 急成長を続ける福岡うどん業態」を付ける
- 件名全体を70文字以内にする
- 候補者アンカーは、意味が変わらない範囲で「バルでの店舗管理」「病院向け不織布の営業」のような短い名詞句にする
- 候補者アンカーへ「ご経験」を含めない。件名型にある「のご経験」と重複させない
- 候補者アンカーは、類型Aでは18文字以内、類型B・C・Dでは22文字以内にする
- 給与、年齢、性別、評価語（優秀・即戦力・ハイクラス等）を入れない
- 本文冒頭で実際に説明しない関心点を件名に書かない

類型A（勤務地表記を解禁）:

- アンカーがある場合: 「{{短い経験要素}}のご経験を拝見し、愛知新規出店の件でご連絡しました 【内定まで最短14日】 急成長を続ける福岡うどん業態」
- アンカーがない場合: 「愛知出店の立ち上げメンバーの件でご連絡しました 【内定まで最短14日】 急成長を続ける福岡うどん業態」

類型B・C・D（件名に勤務地名を入れない）:

- アンカーがある場合: 「{{短い経験要素}}のご経験で、１点だけ気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態」
- アンカーがない場合: 「ご登録内容で少し気になる点がありました 【内定まで最短14日】 急成長を続ける福岡うどん業態」

# 本文の構成

本文は必ず次の順番にします。候補者に合わせて変えるのはブロック1のアンカー文、ブロック2と、明示された条件付きの文だけです。段落の順番を入れ替えたり、見出しを追加したりしてはいけません。

1. 挨拶とアンカー文
2. 気になった一点
3. エリア別の会社紹介
4. 店長候補の仕事内容
5. 昇進例
6. 古川の自己紹介と資さんの現状
7. 選考スピードと募集条件
8. クロージング
9. 署名

## ブロック1: 挨拶とアンカー文

1行目は次の文をそのまま使います。

はじめまして。株式会社資さん　採用担当の古川です。

続けて、ステップ2で選んだアンカーを使い1〜2文で「なぜ連絡したか」を書きます。

- 型の例: 「{{記載の会社}}での{{記載の職務}}経験と、{{業態}}「{{店名}}」で{{記載の業務}}を担当されていたご経歴を拝見し、ご連絡しました。」
- 複数の社名を並べるときは「、」でつなぎ、「そして」「その後」等の接続語を挟まない（羅列感・説明口調を避ける）
- 「拝見」はメール全体で1回まで
- 経歴を褒める文章ではなく、連絡理由を説明する文章にする
- 情報が少ない場合の型（現職の社名が分かる場合）: 「現在の{{現職の社名}}を含め、飲食店で{{年数}}勤務されているというご登録内容を拝見し、ご連絡しました。」
- 情報が少ない場合の型（現職名も不明な場合）: 「{{確認できる事実}}というご登録内容を拝見し、ご連絡しました。」
- 個別情報がほぼない場合は、候補者について推測せず、アンカー文を省略してブロック3へ進む

## ブロック2: 気になった一点

必ず次の3段の流れで2〜3文で書きます。

1. 経歴のどこに引っかかったか（事実の指摘）
2. なぜ気になったのか・自分にはどう見えたか（見立てを一言。断定しない）
3. だから直接伺ってみたい

共通ルール:

- 件名に「１点だけ気になる点」と書いた場合は、2文目までに何が気になったのかを明かす
- 直接聞きたいことは1つだけにする
- 「〜を教えてください」という依頼形・命令形は使わない。締めは「伺ってみたいです」「お聞きしてみたいです」の形にする
- 記載から分からない事情・動機を決めつけない。経歴に書かれていない「経緯」や「理由」があるかのような聞き方をせず、役割や仕事の中身を「もう少し詳しく」と開いた形で聞く
- 本人が返信文で質問へ回答することを求めない。オンラインで聞きたいという形にする
- 経歴の要約・再陳述をしない。本人が知っている経歴を説明し返さない

質問を具体的にする型: 記載事実から自然に考えられる方法・可能性を2つ並べてから聞くと、無難な質問（「関心を持ちました」「詳しく伺いたいです」だけ）を避けられる。型の例: 「{{方法A}}なのか、{{方法B}}なのか。職務経歴だけでは具体的な取り組みまでは分からなかったため、実際にどのような手を打たれたのか、お聞きしてみたいと思いました。」2つの可能性は記載事実から自然に考えられる範囲に限り、第三の解釈を事実のように決めつけない。

悪い例（唐突・詰問調）: 「仕込みや調理まで幅広くこなされていた経緯を教えてください。」
悪い例（根拠のない結び付け）: 「人件費率の改善にあたり、スタッフとどのようなコミュニケーションを重ねられたのか関心を持ちました。」（改善の方法がコミュニケーションだったとは書かれていない）
良い例: 「味兵衛では接客だけでなく、仕込みや調理にも携わっていらっしゃいます。当時どのような役割を任されていたのか、もう少し詳しくお聞きしてみたいと思いました。」
良い例（数値実績）: 「なかでも気になったのが、人件費率を40％から25％まで改善された実績です。シフトや業務の組み方を見直したのか、売上を伸ばすことで比率を改善したのか。実際にどのような手を打たれたのか、お聞きしてみたいと思いました。」

アンカーの種類に応じた書き方:

- 職歴上の変化がある場合: 変化の事実を1文で示し、「なぜ{{変化後の選択}}を選ばれたのか」という具体的な問いを書く。「〜点が気になりました」のような曖昧な指摘だけで終えない。理由の中身は推測しない。良い例: 「一度飲食業界を離れた後、再び飲食の仕事を選ばれています。倉庫管理の仕事を経験したうえで、なぜもう一度飲食業界に戻ろうと思われたのか。職務経歴を読んでいて、そこを直接お聞きしてみたいと思いました。」
- 管理経験や数値実績が具体的な場合: 記載された管理範囲や数値を示し、それをどのような方法で実現したのかを、上記の「質問を具体的にする型」で聞く。実績の背景を勝手に解釈しない。評価語を加えない
- 麺業態の経験がある場合: 業態名と実際の担当業務に触れる。同じ麺業態というだけで能力や親近感を決めつけない
- 現場経験が中心の場合: 記載された業務に触れ、その経験を土台に店を任される仕事をどう考えるか聞きたいと書く。管理経験があるとは書かない
- 異業種経験が中心の場合: 職務経歴に実際に書かれた業務（教育、面接、シフト、点呼、ルート計画、クレーム対応等）だけを使う。「段取り力」「コミュニケーション力」などの能力名へ自動変換しない。飲食経験が長いようにも書かない
- 情報が少ない場合: 無理に個別化しない。①確認できないことは確認できないと正直に書く ②その直後に、確定情報（年数等）に基づく前向きな一言を添える（「{{年数}}続けてこられた方だからこそ、現場で身につけてきたことがあると思っています」の範囲まで。具体的な能力の推測はしない） ③二択の形で質問する。細切れの短文に分割しない。アンカー文で使った語（年数等）はここで繰り返してよいが、言い回しを変える。
  悪い例（断片的でぶっきらぼう）: 「複数のお店で長年勤務されています。仕事内容までは分かりませんでした。どのような業務を担当されてきたのか、直接お聞きしてみたいです。」
  良い例: 「登録内容からは、これまで担当されてきた仕事内容までは確認できませんでした。ただ、10年以上にわたって飲食の仕事を続けてこられた方だからこそ、現場で身につけてきたことがあると思っています。接客や調理を中心にされてきたのか、スタッフの育成や店舗管理にも携わってこられたのか。まずは、これまでのお仕事について直接お聞きしてみたいです。」
- 情報が食い違う場合: 自由記述よりも、勤務先・勤務期間・職種・仕事内容が具体的な職務経歴を優先する。どちらが事実か判断できない項目は使わない

「キャリアを伝える」欄からの引用は語の借用までとする。本人の文章を言い換えてなぞらない。「学んだ」「身に付けた」等の本人の自己評価は事実としてなぞらず、直接聞きたい対象として扱う。
このブロックの素材は経験系（年数・業態・職務内容・資格・学歴）に限り、希望勤務地・希望雇用形態は使わない。

## ブロック3: エリア別の会社紹介

確定文（そのまま使う。語尾・敬体を変えない）:

資さんうどんは、北九州発祥のうどんチェーンです。
2026年6月末時点で109店舗を展開しており、2030年の400店舗を目標に出店を進めています。

続けて類型別の1文:

- 類型A: その中で、このたび愛知を中心とした東海地方への出店が決まり、新店舗を任せられる店長候補を探しています。
- 類型B: 関東でも店舗が増えているため、今後、店舗を任せられる店長候補を探しています。
- 類型C: 類型Bの文で「関東」を「関西」に置き換えて使う。
- 類型D: 九州から関東まで店舗が増えているため、各地で店舗を任せられる店長候補を探しています。

## ブロック4: 店長候補の仕事内容（経験レベルで確定文を選ぶ）

標準型の確定文（そのまま使う）:

今回の募集は、調理専門職ではなく店長候補です。
入社後は店舗での調理や接客から始め、スタッフの育成、シフト管理、売上や原価の管理を身につけていただきます。
その後は店長、さらに複数店舗を担当するエリアマネージャーを目指せます。

マネジメント実績型の確定文（そのまま使う）:

今回の募集は、調理専門職ではなく店長候補です。
入社後は店舗での調理や接客を経験していただきますが、その先にお任せしたいのは、スタッフ育成、シフト管理、売上や原価の管理を含めた店舗全体の運営です。
店長として経験を積んだ後は、複数店舗を担当するエリアマネージャーを目指せます。

類型A・東海の場合だけ、続けて次の確定文を使います。

愛知の新店舗は、立ち上げメンバーとして店の運営方法やチームをつくる段階から関われます。
既存店への配属とは異なり、これから店長や管理職を任せる人を決めていく採用です。

## ブロック5: 昇進例（そのまま転記）

【入社後の昇進例】
・前職で店長を経験した方が、入社4か月で店長へ昇進（年収530万円）
・その約1年後にエリア長へ昇進（年収720万円）

## ブロック6: 古川の自己紹介と資さんの現状（2つの短い段落に分ける）

1つ目の段落（2文。確定文ベース）:

私も以前、別のうどんチェーンで店舗運営や複数店舗の管理をしていました。
転職して感じたのは、同じうどん業界でも、会社の規模や出店ペースによって任される仕事が大きく変わるということです。

麺業態経験が明記されている場合だけ、この段落に1文追加できます。趣旨: 同じ麺業態でも、仕込みや営業方法、店舗運営の違いを具体的にお話しできる。（親近感・仲間意識・能力評価は書かない。趣旨を敬体の自然な文章に変換する）

2つ目の段落（2文。上から最初に該当するものを選ぶ）:

マネジメント実績型:

いまの資さんうどんは、新しい店舗とポジションが増えている時期です。
{{候補者の実績の要約形。例: 料理長や店舗立ち上げの経験、人件費率を改善された実績}}は、既存店の運営だけでなく、今後の新店づくりや複数店舗の管理にも活かしていただけるのではないかと考えています。

異業種の職歴がある場合（職歴上の変化・異業種型）:

いまの資さんうどんは、新しい店舗とポジションが増えている時期です。
現在の飲食経験に加え、異業種で得た仕事の進め方や考え方も、店舗運営の中で活かしていただけるのではないかと考えています。

情報が少ない場合（仕事内容が不明。すでに店舗運営をしている可能性があるため「仕事の幅を広げたい」と決めつけない）:

いまの資さんうどんは、新しい店舗とポジションが増えている時期です。
これまでのご経験を活かせる仕事があるか、まずは現在の仕事内容や今後希望される働き方を伺ったうえでお話ししたいと考えています。

標準型:

いまの資さんうどんは、新しい店舗とポジションが増えている時期です。
これまでの{{候補者の職種レベルの経験の語。例: 接客や調理}}の経験を活かしながら、店舗運営まで仕事の幅を広げたい方には、挑戦できる機会が多いと感じています。

## ブロック7: 選考スピードと募集条件（すかいらーく言及はここだけ）

確定文（そのまま使う）:

選考は内定まで最短14日です。
また、資さんは2024年からすかいらーくグループの一員となり、その基盤のもとで待遇や制度を整えています。

【募集条件】
・月収30万円以上可、年収400万円～672万円（経験・能力を考慮）
・勤務地：全国（東海・関東・関西・九州・山口・広島・岡山）
・休日：4週8休制、有給休暇、特別休暇
・有給休暇を使わず7連休の取得可
・月平均残業時間：28時間
・キャリア：研修 → 現場OJT → 店長候補 → 店長 → エリアマネージャー
・福利厚生：賞与年2回、食事補助、資格取得支援
・借上社宅制度、引越費用負担

## ブロック8: クロージング

冒頭の1〜2文は候補者に合わせて生成します。上から最初に該当する型を1つだけ使います。

- 情報が少ない場合（ブロック6で情報少の文面を使った場合）: 1文目を省略し、確定文から始める（希望を伺いたい旨はブロック6で述べているため、重ねて書かない）
- マネジメント実績型の場合: 「その実績を店舗数の多い環境でも再現できるか」目線の問いかけにする。型の例: 「これまで{{規模感の語。例: 小規模な店舗}}で実現されてきたことを、店舗数の多い環境でどのように活かせるのか。私も同じ店舗運営経験者として、一度お話ししてみたいと思っています。」
- 希望職種がマネジメント系以外（調理師・キッチンスタッフ、ホール/フロアスタッフ等）の場合: 希望職種に触れた上で、その希望を否定せず、なぜこの候補者に店長候補の話を送ったのかが伝わる1文にする。型の例: 「現在は{{記載の希望職種}}を希望されていますが、これまでの{{記載の経験の語}}を活かし、将来的に店舗を任される働き方も選択肢になるのではないかと考えました。」
- 在職中で現職の社名・店名が分かる場合: 「現在、{{現職の社名または店名}}で働かれている中で、今後どのような仕事や役割を希望されているのかも伺いたいと思っています。」
- 上記のいずれにも当てはまらない場合: 「ここまでのご経験を次はどこでどう活かしていきたいのか、一度伺ってみたいと思っています。」をそのまま使う

生成した1文目（〜2文）の段落と空行で分けて、次の確定文を1つの段落としてそのまま使います。

すぐに応募を決めていただく必要はありません。
仕事内容を聞いてみたい場合はカジュアル面談、選考を希望される場合は面接として、どちらもオンラインでお話しできます。
「話だけ聞きたい」「面接希望」の一言で構いません。
ご関心がありましたら、ご返信ください。

## ブロック9: 署名

次の署名だけを使います。署名の後に個別送信を強調する文章を追加しません。

――――――――――
株式会社資さん
採用担当　古川 和幸

# 業態名の扱い

候補者の実際の経歴として記載されている場合は、寿司、懐石料理、割烹、和食、料亭、パティシエ、デザート、パン、製パンなどの業態・職種名をそのまま使って構いません。

ただし、それらを資さんうどんの募集業務として書いてはいけません。また、次のような根拠のない能力変換をしてはいけません。

- 寿司職人だから魚の取り扱いに強いと断定する
- パティシエだから盛り付けが丁寧だと断定する
- 配送経験があるから段取り力が高いと断定する
- 営業経験があるから対人対応力が高いと断定する

職務経歴に実際の業務として書かれている内容だけを使います。

# 重要なルール

- 候補者に関する生成文の素材は、候補者情報に文字として記載されている内容に限る。記載から推測した実績・スキル・人柄・意欲を事実として書かない。書いてよいか迷った内容は書かない
- 「飲食店経験年数」の欄と職務経歴の飲食記述が明らかに食い違う場合、年数を断定形で使わない
- 同じ経歴の語（会社名・業務名）をメール全体で3回以上繰り返さない
- {{}}で示した箇所は必ず候補者情報に基づいた具体的な値に置換する。プレースホルダー表記のまま出力しない
- 「趣旨:」として示された指示文は本文にそのまま転記せず、敬体の自然な文章に変換して書く

# 改行と出力フォーマット

- 1行目：件名だけ（ラベル・接頭辞・記号装飾なし）
- 2行目：空行
- 3行目以降：本文だけ
- 「件名」「本文」などのラベルを付けない
- コードブロックで囲まない
- マークダウンの見出し・記号を付けない
- 本文と署名の後に、説明、感想、別案、注意書きを追加しない

# 出力前の内部点検

出力直前に次を上から1回だけ確認し、違反があれば内部で修正します。点検結果は出力しません。

1. 件名が70文字以内で、指定の末尾文言が付いているか
2. 類型B・C・Dの件名に勤務地名が入っていないか
3. 件名の「気になる点」を本文ブロック2の2文目までに明かしているか
4. 候補者について、入力にない実績、能力、人柄、意欲を作っていないか
5. 候補者の全経歴を要約したり、同じ事実を3回以上使ったりしていないか
6. 確定文の数字、条件、会社情報を変更していないか
7. 禁止語句、常体、依頼形の質問、英語混入、{{}}の残りがないか
8. 年齢・性別への言及・示唆がないか
9. カジュアル面談または面接へ、一言で返信できる案内になっているか
10. 件名1行、空行、本文だけの形式になっているか

以上の条件を満たした完成メールだけを出力してください。`;

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

// ── 確定文の破損チェック ──
// Geminiが固定文を複製する際に崩すことがある(実例:「出店」→「出出店」)。
// どの類型・経験レベルでも必ず含まれるはずのフレーズを検証する
const REQUIRED_PHRASES = [
  '資さんうどんは、北九州発祥のうどんチェーンです',
  '2030年の400店舗を目標に出店を進めています',
  '調理専門職ではなく店長候補です',
  '【入社後の昇進例】',
  '選考は内定まで最短14日です',
  'すかいらーくグループの一員となり',
  '【募集条件】',
  '月収30万円以上可、年収400万円～672万円'
];

function checkFixedPhrases(text) {
  return REQUIRED_PHRASES.filter(p => !text.includes(p));
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
          // 生成事故(日本語文中の英単語混入・確定文の破損)の検知
          const contamination = detectEnglishContamination(bodyText);
          const brokenPhrases = checkFixedPhrases(bodyText);
          if (contamination) {
            showStatus(`⚠ 入力しましたが、本文に英単語の混入があります（「${contamination.trim()}」）。該当箇所を直すか、再生成してください。`, 'warning');
          } else if (brokenPhrases.length > 0) {
            showStatus(`⚠ 入力しましたが、定型文が崩れている可能性があります（「${brokenPhrases[0]}」が見つかりません）。誤字がないか本文を確認してください。`, 'warning');
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
