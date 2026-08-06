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

// 件数を手で書き換える(押し忘れ・数え間違いの調整用)
function setScoutCount(count) {
  return new Promise((resolve) => {
    const n = Math.max(0, Math.min(999, Math.round(count) || 0));
    chrome.storage.local.set({ scoutCount: n, scoutCountDate: getTodayKey() }, () => resolve(n));
  });
}

function updateBadge(count) {
  const badge = document.getElementById('scoutBadge');
  if (badge) {
    badge.textContent = count;
    // 0件のときも押せるように表示は残す(数字を手で直せるようにするため)。
    // ただし色は控えめにして目立たせない
    badge.style.display = 'flex';
    badge.style.background = count > 0 ? '#d32f2f' : '#9aa0a6';
  }
  const inline = document.getElementById('scoutCountValue');
  if (inline) inline.textContent = count;
  const chip = document.getElementById('scout-count-chip');
  if (chip) {
    chip.textContent = count;
    chip.style.background = count > 0 ? '#d32f2f' : '#9aa0a6';
  }
}

// ── どの画面でも件数を直せる小さな丸(左下) ──
// スカウト画面以外にはバッジが出ないため、常設の丸を置く
function renderCountChip() {
  // スカウト画面は生成ボタンのバッジがあるので不要(同じ場所で重なる)
  if (document.getElementById('scout-ext-panel')) {
    const dup = document.getElementById('scout-count-chip');
    if (dup) dup.remove();
    return;
  }
  let chip = document.getElementById('scout-count-chip');
  if (!chip) {
    chip = document.createElement('div');
    chip.id = 'scout-count-chip';
    chip.title = 'クリックすると件数を手で直せます';
    chip.style.cssText =
      'position:fixed;bottom:16px;z-index:99999;width:34px;height:34px;border-radius:50%;' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;' +
      'font-size:13px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.18);background:#9aa0a6;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
    document.body.appendChild(chip);
    chip.addEventListener('click', (e) => { e.stopPropagation(); showCountEditor(); });
  }
  // 一覧ページは操作ボタン(6個)の右隣、それ以外は左下の定位置に置く
  chip.style.left = document.getElementById('scout-batch-panel') ? '500px' : '260px';
  // 数字の読み込みは作った直後だけ(tryInitは何度も呼ばれるため)
  if (!chip.dataset.loaded) {
    chip.dataset.loaded = '1';
    getScoutCount().then(n => updateBadge(n));
  }
}

// ── バッジをクリックしたときの件数調整パネル ──
function showCountEditor() {
  const old = document.getElementById('scout-count-editor');
  if (old) { old.remove(); return; } // もう一度押したら閉じる

  const el = document.createElement('div');
  el.id = 'scout-count-editor';
  el.style.cssText =
    // ボタンの少し上に出す(一覧ページの操作ボタン列と重ならない位置)
    'position:fixed;bottom:58px;left:260px;z-index:100000;background:#fff;' +
    'border:1px solid #dadce0;border-radius:10px;padding:8px 10px;' +
    'box-shadow:0 3px 12px rgba(0,0,0,0.2);color:#202124;font-size:12px;' +
    'display:flex;align-items:center;gap:8px;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
  const btn = (id, label) =>
    `<button id="${id}" style="width:26px;height:26px;border:1px solid #dadce0;border-radius:6px;` +
    `background:#f8f9fa;color:#202124;cursor:pointer;font-size:15px;line-height:1;padding:0;">${label}</button>`;
  el.innerHTML =
    `<span style="color:#5f6368;">本日</span>` +
    btn('scoutCountMinus', '−') +
    `<b id="scoutCountValue" style="min-width:24px;text-align:center;font-size:14px;">0</b>` +
    btn('scoutCountPlus', '＋') +
    `<span style="color:#5f6368;">件</span>` +
    `<button id="scoutCountClose" style="border:none;background:none;color:#5f6368;` +
    `cursor:pointer;font-size:13px;padding:0 2px;">×</button>`;
  document.body.appendChild(el);

  const apply = (diff) => {
    getScoutCount().then(n => setScoutCount(n + diff)).then(n => {
      updateBadge(n);
      const c = document.getElementById('scoutCounterToday');
      if (c) c.textContent = n; // 稼働中のカウンター表示も合わせる
    });
  };
  document.getElementById('scoutCountMinus').addEventListener('click', () => apply(-1));
  document.getElementById('scoutCountPlus').addEventListener('click', () => apply(1));
  document.getElementById('scoutCountClose').addEventListener('click', () => el.remove());
  getScoutCount().then(n => { const v = document.getElementById('scoutCountValue'); if (v) v.textContent = n; });
}

// ── パネルのHTML作成（フローティングボタン + バッジ）──
function createPanel() {
  const panel = document.createElement('div');
  panel.id = 'scout-ext-panel';
  panel.innerHTML = `
    <div id="scoutStatus" class="scout-status" style="display:none;"></div>
    <div class="scout-btn-wrapper">
      <button class="scout-btn scout-btn-primary" id="scoutGenerateBtn"></button>
      <span id="scoutBadge" class="scout-badge" title="クリックすると件数を手で直せます" style="display:none;">0</span>
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

  // バッジをクリックすると、その日の件数を手で増減できる
  const badgeEl = document.getElementById('scoutBadge');
  if (badgeEl) {
    badgeEl.style.cursor = 'pointer';
    badgeEl.addEventListener('click', (e) => { e.stopPropagation(); showCountEditor(); });
  }

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
  'はじめまして。株式会社資さん',
  '資さんうどんは、北九州発祥のうどんチェーンです',
  '2026年6月末時点で109店舗を展開しており',
  '2030年の400店舗を目標に出店を進めています',
  '調理専門職ではなく店長候補です',
  '【入社後の昇進例】',
  '入社4か月で店長へ昇進（年収530万円）',
  'エリア長へ昇進（年収720万円）',
  '選考は内定まで最短14日です',
  'すかいらーくグループの一員となり',
  '【募集条件】',
  '月収30万円以上可、年収400万円～672万円',
  '休日：4週8休制、有給休暇、特別休暇',
  '有給休暇を使わず7連休の取得可',
  '月平均残業時間：28時間',
  'キャリア：研修 → 現場OJT → 店長候補 → 店長 → エリアマネージャー',
  '賞与年2回、食事補助、資格取得支援',
  '借上社宅制度、引越費用負担',
  '「話だけ聞きたい」「面接希望」の一言で構いません',
  '採用担当　古川 和幸'
];

function checkFixedPhrases(text) {
  // 空白(半角/全角/改行)の違いで誤検知しないよう、両側から空白を除いて照合する
  // (署名の「採用担当　古川 和幸」等はGemini出力で空白種が揺れるため)
  const normalize = s => s.replace(/[\s　]+/g, '');
  const normText = normalize(text);
  return REQUIRED_PHRASES.filter(p => !normText.includes(normalize(p)));
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
    // ── バッチ処理のフック(手動フローより先に処理) ──
    if (message.mode === 'verify') { batchHandleVerify(message); return; }
    if (batchAwait === 'generate') { batchHandleGenerated(message); return; }

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
    if (batchAwait) { batchHandleError(message.error); return; }
    if (generateBtn) generateBtn.disabled = false;
    showStatus(`❌ エラー: ${message.error}`, 'error');
  }

  if (message.action === 'geminiProgress') {
    showStatus(message.text, 'info');
    // 進捗が届いている＝処理は生きているので、見張りタイマーを延長する
    // (Gemini側のエラーからのやり直し中に3分で打ち切られるのを防ぐ)
    if (batchAwait) {
      armWatchdog(batchAwait);
      showBatchToast(message.text);
    }
  }
});

// ── 他のタブ・ポップアップからの停止を検知して即座に反映する ──
// (拡張機能アイコンの停止ボタンはstorageを書き換えるだけなので、
//  開いている画面側の待機状態とカウンター表示をここで片付ける)
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local' || !changes.autoBatch) return;
  const nb = changes.autoBatch.newValue;
  if (!nb || !nb.active) {
    clearTimeout(batchWatchdog);
    batchAwait = null;
    hideBatchCounter();
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

  // 全自動スカウトの振り分け(バッチ稼働中のみ動く。1ページ1回)
  routeBatch();

  if (!document.getElementById('scout-ext-panel') && isScoutFormPresent()) initPanel();

  // 件数の丸はどの画面にも出す(いつでも手で直せるように)
  renderCountChip();
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


// ═══════════════════════════════════════════════════════════
// 全自動スカウトマシーン（バッチ処理）
// 一覧 → プロフィール(NG判定) → スカウト画面(生成→検証→送信) → 一覧 → 次へ
// 送信は即時実行(確認画面なし・実機確認済み)。送信後は検索一覧に戻る。
// 送信済みの候補者はサイト側で一覧から自動的に消える。
// ═══════════════════════════════════════════════════════════

// 件数上限なし。「止」を押すか、候補者が尽きるまで動き続ける
const BATCH_MAX = 0;              // 0 = 1ページあたりの取得件数を制限しない
// 自動ページ送りの有効/無効。
// このサイトの「次へ」は画面上の検索フォームを再送信する実装のため、
// プロフィール画面を経由して一覧に戻るとフォームが空になり、
// 「都道府県を選択してください」というアラートが出て処理が止まっていた。
// 対策として、バッチ開始時の検索条件を覚えておき、ページ送りの直前に
// フォームへ書き戻す(serializeSearchForm / restoreSearchForm)。
// あわせて、クリックの間だけサイトのアラートを止め、進めなかった場合は
// 原因を添えて終了する(放置運用でも固まらないようにするため)。
const BATCH_AUTO_PAGING = true;

// 新規候補ゼロのページが続いたら候補者が尽きたと判断する。
// 処理済みの方が並ぶページが何ページも続くことがあるため多めにする
// (1ページの確認は数秒。ページが進まない場合は別の判定で止まる)
const BATCH_MAX_EMPTY_PAGES = 12;
const BATCH_BODY_MIN = 300;

// NG職種(過去経歴に1つでもあればNG)。表記ゆれ込み
const NG_OCCUPATIONS = [
  ['パティシエ', 'パティシエール'],
  ['寿司職人', '鮨職人', 'すし職人'],
  ['ソムリエ'],
  ['バーテンダー', 'バーテン'],
  ['パン職人', 'パン製造', '製パン', 'ブーランジェ'],
  ['バリスタ']
];

// NGワード(職種以外。プロフィールに含まれていたら対象外)
// 画面の「語」ボタンから追加した語はこれに上乗せされる
const NG_KEYWORDS = [
  ['特定技能'],
  ['日本語能力', '日本語検定'],
  ['JLPT', 'ｊｌｐｔ']
];

// 氏名の欄を示すラベル。
// 「ふりがな」「フリガナ」「氏名(カナ)」等の読み欄は**含めない**
// (日本人でも読み欄はカタカナになるため、含めると全員がNGになってしまう)
const NAME_FIELD_LABELS = ['氏名', 'お名前', '会員名', '求職者名', '応募者名', '名前'];

// 読み欄・ローマ字欄を表す語(この語を含むラベルは氏名欄として扱わない)
const NAME_READING_RE = /カナ|かな|ふりがな|フリガナ|ヨミ|読み|ローマ字/;

// 氏名の値と間違えやすい語(これらは氏名の値として採用しない)
const NAME_VALUE_SKIP = [
  '氏名', 'お名前', '会員名', '求職者名', '応募者名', '名前',
  'ふりがな', 'フリガナ', 'カナ', 'セイ', 'メイ', '姓', '名',
  '性別', '年齢', '住所', '必須', '任意', '未登録', '非公開', '未入力'
];

// 氏名の見出しが並ぶ表(氏名／ふりがな→値／値)で読み飛ばしてよい行。
// 「性別」「住所」など**別項目**の見出しはここに入れない
// (氏名欄が空のとき、その先の別項目の値を氏名と取り違えるため)
const NAME_HEADER_SKIP = [
  '氏名', 'お名前', '会員名', '求職者名', '応募者名', '名前',
  'ふりがな', 'フリガナ', 'カナ', 'セイ', 'メイ', '姓', '名', '必須', '任意'
];

// 生成メール本文に含まれていたら不合格にする語
const BODY_FORBIDDEN = [
  '目に留まりました', '魅力を感じました', '感銘を受けました',
  'ただ、ここで重要なのは', '先ほどもお伝えしましたが'
];

let batchAwait = null;   // 'generate' | 'verify' | null
let batchMail = null;    // 直近の生成メール {subject, body}
let batchRouted = false; // このページ読み込みでバッチ処理を起動済みか

function zenToHan(s) { return s.replace(/[０-９]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0)); }

// ── 氏名の判定(外国籍が推測できる表記を対象外にする) ──

// 氏名欄の値として使えそうな文字列かを確かめて整える。だめなら null
function cleanNameValue(v) {
  if (!v) return null;
  let s = String(v)
    .replace(/[（(][^）)]*[）)]/g, '')  // 「山田太郎(ヤマダタロウ)」の括弧内を除く
    .replace(/様$/, '')
    .replace(/[\s　]+/g, ' ')
    .trim();
  if (!s || s.length > 30) return null;
  if (NAME_VALUE_SKIP.includes(s)) return null;
  if (NAME_READING_RE.test(s)) return null;
  if (/^[-ー―−~〜/／:：*＊。、,.]+$/.test(s)) return null;
  if (/[0-9０-９]/.test(s)) return null; // 「会員ID 99956」等の数値行は氏名ではない
  return s;
}

// プロフィール本文から氏名欄の値だけを取り出す。
// 自己PRや職務経歴に含まれるカタカナ語を誤って拾わないよう、
// 「氏名」等のラベル行に紐づく値しか見ない
function extractNameFromText(text) {
  const lines = (text || '').split('\n').map(l => l.trim());
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || NAME_READING_RE.test(line)) continue; // 読み欄・ローマ字欄は見ない
    const label = NAME_FIELD_LABELS.find(l => line.startsWith(l));
    if (!label) continue;
    // ラベルの後に長い文章が続く行(説明文など)は項目名ではない
    const rest = line.slice(label.length).replace(/^[ \t　]*[:：]?[ \t　]*/, '').trim();
    if (rest.length > 30) continue;

    // 値の場所: 同じ行 → 無ければ次の行。
    // 「氏名/ふりがな」のように見出しだけが続く表もあるため、
    // 氏名まわりの見出し行だけは読み飛ばす。
    // それ以外の行に当たったら、そこで打ち切る
    // (氏名欄が空のときに、別項目の値を氏名と取り違えないため)
    let value = rest;
    for (let j = i + 1; !value && j <= i + 3 && j < lines.length; j++) {
      const c = lines[j];
      if (!c) continue;
      const flat = c.replace(/[\s　]/g, '');
      if (NAME_HEADER_SKIP.includes(flat) || NAME_READING_RE.test(c)) continue;
      value = c;
    }
    if (!value || isProfileLabel(value)) continue; // 氏名欄が空

    const v = cleanNameValue(value);
    if (v) return v;
  }
  return null;
}

// 氏名がすべてローマ字・すべてカタカナなら対象外(外国籍と推測されるため)。
// 漢字・ひらがなが1文字でも混ざっていれば対象内のまま
function foreignNameNg(name) {
  const s = cleanNameValue(name);
  if (!s) return null;
  // 区切り記号を除いた本体だけで文字種を判定する(長音「ー」「ｰ」は残す)
  const core = s.replace(/[\s　・･.,、'’\-‐‑−/／]/g, '');
  if (core.length < 2) return null;
  if (/^[A-Za-zＡ-Ｚａ-ｚ]+$/.test(core)) return 'NG氏名(ローマ字表記)';
  if (/^[ァ-ヶヷ-ヺーｦ-ﾟ]+$/.test(core)) return 'NG氏名(カタカナ表記)'; // 全角・半角カタカナ
  return null;
}

// この判定のON/OFF(既定はON)。「語」ボタンの画面から切り替えられる
function getForeignNameNg() {
  return new Promise(res => chrome.storage.local.get(['ngForeignName'], d => res(d.ngForeignName !== false)));
}
function setForeignNameNg(on) {
  return new Promise(res => chrome.storage.local.set({ ngForeignName: !!on }, res));
}

// ── プロフィールの記入量の判定 ──

// プロフィール画面に出てくる項目名。値が空かどうかの判定に使う
// (グルメキャリーは値が空だと欄そのものが空になるため、
//  ラベル行の次が別のラベル行なら「その項目は未記入」と分かる)
const PROFILE_LABELS = [
  '基本情報', '経験値', '希望条件', '学歴', '職務経歴', 'メール画面', 'プロフィール',
  '会員ID', '性別', '生年月日', '年齢', '生年月日/年齢', '住所', '就業区分',
  '最終ログイン日', '最終ログイン',
  '飲食店経験年数', '得意なスキル', 'キャリアを伝える', '取得資格',
  '希望年収', '希望業態', '希望職種', '希望勤務地', '希望雇用形態',
  '学校名', '卒業区分', '会社名', '勤務期間', '仕事内容', '業態', '職種'
];

// このどれかに記入があれば「詳細まで登録済み」とみなす項目
const DETAIL_FIELD_LABELS = [
  '飲食店経験年数', '得意なスキル', 'キャリアを伝える', '取得資格',
  '希望年収', '希望業態', '希望職種', '希望勤務地', '希望雇用形態',
  '学校名', '卒業区分', '会社名', '勤務期間', '仕事内容', '業態'
];

// プロフィール画面の表から「項目名 → 値」を直接読む。
// テキストの行だけで判断すると、空欄のときに次の項目の値を拾ってしまうため、
// 表の構造が読めるときはこちらを優先する
function readProfileFieldsFromDom() {
  const fields = {};
  const put = (k, v) => {
    const key = (k || '').replace(/[\s　]+/g, '');
    if (!key || key.length > 20) return;
    // 同じ項目名が複数ある場合(職務経歴1〜n)は、最初に見つかった「記入のある値」を採用する
    if (fields[key] === undefined || isEmptyFieldValue(fields[key])) {
      fields[key] = (v || '').replace(/[\s　]+/g, ' ').trim();
    }
  };
  document.querySelectorAll('tr').forEach(tr => {
    const cells = [...tr.children].filter(c => c.tagName === 'TH' || c.tagName === 'TD');
    if (cells.length !== 2) return; // 「項目名 | 値」の2列だけを対象にする
    put(cells[0].textContent, cells[1].textContent);
  });
  document.querySelectorAll('dl').forEach(dl => {
    const kids = [...dl.children];
    for (let i = 0; i < kids.length - 1; i++) {
      if (kids[i].tagName === 'DT' && kids[i + 1].tagName === 'DD') {
        put(kids[i].textContent, kids[i + 1].textContent);
      }
    }
  });
  return fields;
}

// 未記入を表す値か(グルメキャリーは空欄を「--」で表示することがある)
function isEmptyFieldValue(v) {
  return !String(v || '').replace(/[-‐‑–—ー―−ｰ－\s　.。、,]/g, '').trim();
}

function isProfileLabel(s) {
  const v = (s || '').replace(/[\s　]/g, '');
  if (!v) return true;
  if (/^(職務経歴|学歴)\d*$/.test(v)) return true;
  return PROFILE_LABELS.includes(v);
}

// 項目名に対応する値を取り出す(同じ行にある場合・次の行にある場合の両方に対応)
function profileFieldValue(lines, label) {
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith(label)) continue;
    // 空欄だった場合は、同じ項目名の次の出現(職務経歴2以降など)も見る
    const rest = lines[i].slice(label.length).replace(/^[ \t　]*[:：/／]?[ \t　]*/, '').trim();
    if (rest && !isProfileLabel(rest)) {
      if (!isEmptyFieldValue(rest)) return rest;
      continue;
    }
    const next = (lines[i + 1] || '').trim();
    if (next && !isProfileLabel(next) && !isEmptyFieldValue(next)) return next;
  }
  return '';
}

// 基本情報しか登録されていないプロフィールか
// (経験値・希望条件・学歴・職務経歴がすべて空。あとから記入される可能性があるため
//  NG登録はせず、今回だけ見送る)
// fields: 画面の表から読んだ「項目名→値」(あればこちらを優先)
function isSparseProfile(text, fields) {
  // ① 画面の表から見て、どれかに記入があれば「詳細あり」
  const domKnown = !!fields && DETAIL_FIELD_LABELS.some(l => fields[l] !== undefined);
  if (domKnown && DETAIL_FIELD_LABELS.some(l => !isEmptyFieldValue(fields[l]))) return false;

  // ② テキストから見て、どれかに記入があれば「詳細あり」
  // (職務経歴など、表として読めない部分を取りこぼさないため、両方で確認する)
  const lines = (text || '').split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const textKnown = DETAIL_FIELD_LABELS.some(l => lines.some(x => x.startsWith(l)));
  if (DETAIL_FIELD_LABELS.some(l => profileFieldValue(lines, l))) return false;

  // 想定した項目名がどちらの方法でも見つからないページ(画面構成の変更など)は判定しない
  if (!domKnown && !textKnown) return false;
  return true;
}

// ── NG判定(ルールベース・Geminiに任せない) ──
// extraWords: 画面から追加したNGワード(1語1エントリ)
// opts.nameNg: 氏名(ローマ字のみ/カタカナのみ)判定を使うか
// opts.fallbackName: プロフィールに氏名欄が無い場合に使う、一覧から拾った氏名
// opts.fields: プロフィール画面の表から読んだ「項目名→値」
function ngCheck(profileText, extraWords, opts) {
  const text = profileText || '';
  const o = opts || {};
  for (const group of NG_OCCUPATIONS) {
    for (const w of group) {
      if (text.includes(w)) return `NG職種(${group[0]})`;
    }
  }
  const keywordGroups = NG_KEYWORDS.concat((extraWords || []).map(w => [w]));
  for (const group of keywordGroups) {
    for (const w of group) {
      if (w && text.includes(w)) return `NGワード(${group[0]})`;
    }
  }

  // 氏名がすべてローマ字・すべてカタカナなら対象外。
  // 氏名欄が読み取れない場合は判定せず通す(安易にスキップしない)
  if (o.nameNg !== false) {
    // 画面の表から読めた氏名 → 本文から読めた氏名 → 一覧から拾った氏名 の順
    let name = null;
    if (o.fields) {
      const key = NAME_FIELD_LABELS.find(l => o.fields[l] !== undefined && !NAME_READING_RE.test(l));
      if (key) name = o.fields[key] || null;
    }
    const nameNg = foreignNameNg(name || extractNameFromText(text) || o.fallbackName);
    if (nameNg) return nameNg;
  }

  // 基本情報しか登録されていない方は今回は見送る。
  // (NGではない。あとから経歴を登録される可能性があるので、次回また対象に含める)
  if (isSparseProfile(text, o.fields)) return '情報不足(基本情報のみ・詳細が未登録)';

  // 飲食店経験年数が「未経験」なら対象外。
  // 自己PR欄の「未経験から〜」等を誤検知しないよう、項目の値だけを見る
  const expMatch = text.match(/飲食店経験年数[ \t　]*\n?[ \t　]*([^\n]{0,12})/);
  if (expMatch && /未経験|経験なし/.test(expMatch[1])) {
    return 'NG未経験(飲食店経験年数が未経験)';
  }
  const t = zenToHan(text);
  // 年齢の読み取り。表記ゆれが多いので候補を集め、15〜99歳に収まるものを使う
  // (「生年月日 / 年齢 → 1997/07/10 29才」のように、生年月日と同じ欄の場合がある)
  // 自己PRの「20歳から飲食業界で」等を年齢と誤読しないよう、
  // 「年齢」「生年月日」の欄に紐づく数値を先に見る
  const ageCands = [];
  let m;
  if (o.fields) {
    for (const k of ['年齢', '生年月日/年齢', '生年月日・年齢', '生年月日']) {
      const v = zenToHan(o.fields[k] || '');
      const mm = v.match(/([0-9]{1,3})[ \t]*[歳才]/) || v.match(/^[ \t]*([0-9]{1,3})[ \t]*$/);
      if (mm) { ageCands.push(parseInt(mm[1], 10)); break; }
    }
  }
  m = t.match(/(?:年齢|生年月日)[\s\S]{0,30}?([0-9]{1,3})[ \t　]*[歳才]/); // 「年齢 → 29才」
  if (m) ageCands.push(parseInt(m[1], 10));
  m = t.match(/年齢[^0-9]{0,10}([0-9]{1,3})(?![0-9])/);     // 「年齢 29」(西暦は除外)
  if (m) ageCands.push(parseInt(m[1], 10));
  m = t.match(/^[0-9]{4,}[ \t　]*[（(]([0-9]{1,3})[）)]/m);  // 見出しの「101906 （29）」
  if (m) ageCands.push(parseInt(m[1], 10));
  m = t.match(/([0-9]{1,3})[ \t　]*[歳才]/);                // 最後の手段: 本文中の「38歳」
  if (m) ageCands.push(parseInt(m[1], 10));
  let age = ageCands.find(a => a >= 15 && a <= 99);
  if (age === undefined) age = null;

  let companies = null;
  // ① 「◯社経験」表記
  m = t.match(/([0-9]+)社経験/);
  if (m) companies = parseInt(m[1], 10);
  // ② 職務経歴の「勤務期間」ラベルの出現数(職歴1件につき1つ)
  if (companies === null) {
    const labels = t.match(/勤務期間/g);
    if (labels && labels.length > 0) companies = labels.length;
  }
  // ③ 期間表記(2022/04〜・2022年4月〜)の出現数
  if (companies === null) {
    const jobs = t.match(/\d{4}(?:\/\d{1,2}|年\d{1,2}月)\s*[〜~～]/g);
    if (jobs && jobs.length > 0) companies = jobs.length;
  }

  if (age === null && companies === null) return '判定不能(年齢と社数の両方が読み取れない)';
  if (age === null) return '判定不能(年齢が読み取れない)';
  if (companies === null) return '判定不能(社数が読み取れない)';
  const tens = Math.floor(age / 10);
  const tenshoku = companies - 1; // 転職回数 = 社数 - 1
  if (tenshoku >= tens) return `転職回数NG(${tenshoku}回≧年齢10の位${tens})`;
  return null;
}

// ── バッチ状態の保存/取得 ──
function getBatch() {
  return new Promise(res => chrome.storage.local.get(['autoBatch'], d => res(d.autoBatch || null)));
}
function setBatch(b) {
  return new Promise(res => chrome.storage.local.set({ autoBatch: b }, res));
}
function getSentRegistry() {
  return new Promise(res => chrome.storage.local.get(['autoSentIds'], d => res(d.autoSentIds || {})));
}
function addSentRegistry(id) {
  return new Promise(res => chrome.storage.local.get(['autoSentIds'], d => {
    const reg = d.autoSentIds || {};
    reg[id] = Date.now();
    chrome.storage.local.set({ autoSentIds: reg }, res);
  }));
}

// NG判定(職種・転職回数)は決定的なので記録し、次回以降キューの枠を消費させない
// (検証不合格のスキップは再挑戦の余地があるため記録しない)
function getNgRegistry() {
  return new Promise(res => chrome.storage.local.get(['autoNgIds'], d => res(d.autoNgIds || {})));
}
function addNgRegistry(id, reason) {
  return new Promise(res => chrome.storage.local.get(['autoNgIds'], d => {
    const reg = d.autoNgIds || {};
    reg[id] = { reason, at: Date.now() };
    chrome.storage.local.set({ autoNgIds: reg }, res);
  }));
}
// NG記録のリセット(送信済み記録は消さないので二重送信は起きない)
function clearNgRegistry() {
  return new Promise(res => chrome.storage.local.set({ autoNgIds: {} }, res));
}

function isListPage() { return location.pathname.includes('/member/list'); }
function isScoutPage() { return location.pathname.includes('/scoutMail/'); }

// ── 進捗トースト(バッチ稼働中は常時表示) ──
function showBatchToast(msg) {
  let t = document.getElementById('scout-batch-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'scout-batch-toast';
    t.style.cssText =
      'position:fixed;bottom:64px;left:260px;z-index:99999;background:rgba(26,115,232,0.92);' +
      'color:#fff;border-radius:10px;padding:8px 14px;font-size:12px;max-width:420px;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.display = 'block';
}
function hideBatchToast() {
  const t = document.getElementById('scout-batch-toast');
  if (t) t.style.display = 'none';
}

// ── 進捗カウンター(バッチ稼働中は全ページで常時表示) ──
// 途中でも「何件スカウトしたか」が一目で分かるようにする
function showBatchCounter(b) {
  if (!b) return;
  const counts = { sent: 0, ready: 0, skip: 0, error: 0 };
  (b.log || []).forEach(e => { if (counts[e.result] !== undefined) counts[e.result]++; });
  const done = (b.log || []).length;
  const mainLabel = b.dryRun ? '準備OK' : '完了';
  const mainCount = b.dryRun ? counts.ready : counts.sent;

  let el = document.getElementById('scout-batch-counter');
  if (!el) {
    el = document.createElement('div');
    el.id = 'scout-batch-counter';
    el.style.cssText =
      'position:fixed;bottom:104px;left:260px;z-index:99999;background:#fff;' +
      'border:2px solid #1a73e8;border-radius:10px;padding:8px 14px;' +
      'box-shadow:0 3px 12px rgba(0,0,0,0.2);color:#202124;' +
      'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
    document.body.appendChild(el);
  }
  el.style.display = 'block';
  el.innerHTML =
    `<div style="font-size:11px;color:#5f6368;margin-bottom:2px;">` +
    `処理中${b.dryRun ? '（確認モード）' : ''}</div>` +
    `<div style="font-size:22px;font-weight:bold;color:#1a73e8;line-height:1.1;">` +
    `<span style="font-size:12px;font-weight:normal;color:#5f6368;">今回 </span>` +
    `${mainLabel} ${mainCount}<span style="font-size:13px;font-weight:normal;">件</span></div>` +
    `<div style="font-size:11px;color:#5f6368;margin:3px 0 2px;">` +
    `処理済み ${done}件（対象外 ${counts.skip} / エラー ${counts.error}）</div>` +
    // バッチをやり直しても消えない累計。「動」で0に戻る今回分と区別する
    `<div style="font-size:11px;color:#202124;margin-bottom:8px;padding-top:4px;` +
    `border-top:1px dashed #dadce0;">本日 <b id="scoutCounterToday">…</b>件</div>` +
    // どの画面からでも止められるよう、カウンターに停止ボタンを持たせる
    `<button id="scoutCounterStopBtn" style="width:100%;padding:6px 0;border:none;border-radius:6px;` +
    `background:#b3261e;color:#fff;cursor:pointer;font-size:12px;font-weight:bold;">■ 停止</button>`;
  // innerHTMLで作り直すため、毎回ハンドラを付け直す
  const stopBtn = document.getElementById('scoutCounterStopBtn');
  if (stopBtn) stopBtn.addEventListener('click', requestBatchStop);
  // 本日の送信数は非同期で取得して後から埋める
  getScoutCount().then(n => {
    const t = document.getElementById('scoutCounterToday');
    if (t) t.textContent = n;
  });
}

function hideBatchCounter() {
  const el = document.getElementById('scout-batch-counter');
  if (el) el.style.display = 'none';
}

// ── 一覧ページ: 操作パネル(小さな丸ボタン) ──
function batchMiniBtn(id, label, title, bg) {
  return `<button id="${id}" title="${title}" style="width:34px;height:34px;border:none;border-radius:50%;` +
    `cursor:pointer;background:${bg};color:#fff;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,0.18);">${label}</button>`;
}

function renderBatchPanel() {
  if (!isListPage()) return;
  if (document.getElementById('scout-batch-panel')) return;
  const p = document.createElement('div');
  p.id = 'scout-batch-panel';
  p.style.cssText =
    'position:fixed;bottom:16px;left:260px;z-index:99999;display:flex;gap:6px;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
  p.innerHTML =
    batchMiniBtn('batchDryBtn', '試', '確認モードで開始（送信しない）', '#5f6368') +
    batchMiniBtn('batchLiveBtn', '動', '開始（本番）', '#1a73e8') +
    batchMiniBtn('batchResumeBtn', '再', '中断した処理を再開', '#e8710a') +
    batchMiniBtn('batchStopBtn', '止', '停止', '#b3261e') +
    batchMiniBtn('batchReportBtn', '報', '前回の結果を表示', '#188038') +
    batchMiniBtn('batchNgWordBtn', '語', '対象外にする語の設定', '#7b1fa2');
  document.body.appendChild(p);
  document.getElementById('batchNgWordBtn').addEventListener('click', showNgWordEditor);
  document.getElementById('batchDryBtn').addEventListener('click', () => startBatch(true));
  document.getElementById('batchLiveBtn').addEventListener('click', () => startBatch(false));
  document.getElementById('batchResumeBtn').addEventListener('click', resumeBatch);
  document.getElementById('batchStopBtn').addEventListener('click', requestBatchStop);
  document.getElementById('batchReportBtn').addEventListener('click', async () => {
    const last = await new Promise(res => chrome.storage.local.get(['autoLastReport'], d => res(d.autoLastReport || null)));
    if (last) showReport(last); else showBatchToast('レポートはまだありません');
  });
}

// ── 追加NGワードの保存/取得(画面から編集できる) ──
function getCustomNgWords() {
  return new Promise(res => chrome.storage.local.get(['customNgWords'], d => res(d.customNgWords || [])));
}
function setCustomNgWords(words) {
  return new Promise(res => chrome.storage.local.set({ customNgWords: words }, res));
}

// ── NGワード編集ダイアログ ──
async function showNgWordEditor() {
  const old = document.getElementById('scout-ngword-editor');
  if (old) old.remove();

  const custom = await getCustomNgWords();
  const nameNgOn = await getForeignNameNg();
  const ngReg = await getNgRegistry();
  const ngCount = Object.keys(ngReg).length;
  const builtinOcc = NG_OCCUPATIONS.map(g => g.join('／')).join('、');
  const builtinKw = NG_KEYWORDS.map(g => g.join('／')).join('、');

  const el = document.createElement('div');
  el.id = 'scout-ngword-editor';
  el.style.cssText =
    'position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:100000;background:#fff;' +
    'border:2px solid #1a73e8;border-radius:12px;padding:18px;width:560px;max-width:92vw;' +
    'box-shadow:0 8px 32px rgba(0,0,0,0.3);color:#202124;font-size:13px;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
  el.innerHTML =
    `<div style="font-size:15px;font-weight:bold;margin-bottom:10px;">対象外にするNGワードの設定</div>` +
    `<div style="font-size:12px;color:#5f6368;line-height:1.7;margin-bottom:10px;">` +
    `プロフィールにこの語が含まれる候補者には、スカウトを送りません。<br>` +
    `<b>1行に1語</b>ずつ書いてください。空行は無視されます。</div>` +
    `<textarea id="ngWordArea" rows="9" style="width:100%;box-sizing:border-box;padding:8px;` +
    `border:1px solid #dadce0;border-radius:6px;font-size:13px;line-height:1.6;` +
    `font-family:inherit;resize:vertical;">${custom.join('\n')}</textarea>` +
    `<div style="font-size:11px;color:#5f6368;margin-top:10px;line-height:1.6;">` +
    `<b>もとから設定されているNG（変更不要）</b><br>` +
    `職種: ${builtinOcc}<br>キーワード: ${builtinKw}<br>` +
    `そのほか「転職回数が年齢の10の位以上」「飲食店経験年数が未経験」も自動で対象外になります。<br>` +
    `基本情報しか登録していない方は、NG登録せずその回だけ見送ります（次回また対象に含まれます）。</div>` +
    `<div style="margin-top:12px;padding-top:12px;border-top:1px solid #e0e0e0;">` +
    `<label style="display:flex;align-items:flex-start;gap:8px;cursor:pointer;">` +
    `<input type="checkbox" id="ngNameChk"${nameNgOn ? ' checked' : ''} style="margin-top:2px;">` +
    `<span style="font-size:12px;line-height:1.6;">お名前が<b>すべてローマ字</b>または` +
    `<b>すべてカタカナ</b>の方を対象外にする<br>` +
    `<span style="font-size:11px;color:#5f6368;">` +
    `氏名の欄がある画面でだけ働きます。<b>グルメキャリーのプロフィールには氏名欄が無いため、` +
    `現状この判定は行われません</b>（氏名が表示されるようになった場合に効きます）。` +
    `</span></span></label></div>` +
    `<div style="margin-top:14px;padding-top:12px;border-top:1px solid #e0e0e0;">` +
    `<div style="font-size:12px;font-weight:bold;margin-bottom:4px;">NG記録のリセット</div>` +
    `<div style="font-size:11px;color:#5f6368;line-height:1.6;margin-bottom:8px;">` +
    `これまでに<b>${ngCount}名</b>がNG判定で記録され、次回以降のスカウト対象から外れています。<br>` +
    `NGワードを消しても、すでに記録された方は戻りません。もう一度対象に含めたい場合はリセットしてください。<br>` +
    `<b>送信済みの記録は消えません</b>ので、同じ方に二度送ることはありません。</div>` +
    `<button id="ngResetBtn" style="padding:6px 14px;border:1px solid #b3261e;border-radius:6px;` +
    `background:#fff;color:#b3261e;cursor:pointer;font-size:12px;"${ngCount ? '' : ' disabled'}>` +
    `NG記録をリセット（${ngCount}名）</button></div>` +
    `<div style="margin-top:14px;text-align:right;">` +
    `<button id="ngWordCancel" style="padding:7px 18px;margin-right:8px;border:none;border-radius:6px;` +
    `background:#5f6368;color:#fff;cursor:pointer;font-size:13px;">キャンセル</button>` +
    `<button id="ngWordSave" style="padding:7px 22px;border:none;border-radius:6px;` +
    `background:#1a73e8;color:#fff;cursor:pointer;font-size:13px;font-weight:bold;">保存</button></div>`;
  document.body.appendChild(el);

  document.getElementById('ngWordCancel').addEventListener('click', () => el.remove());
  const resetBtn = document.getElementById('ngResetBtn');
  if (resetBtn && ngCount) {
    resetBtn.addEventListener('click', async () => {
      if (!confirm(`NG判定の記録（${ngCount}名）をリセットします。\nこの方たちは次回から再びスカウト対象に含まれます。\n（送信済みの記録は消えないため、二重送信は起きません）\n\nよろしいですか？`)) return;
      await clearNgRegistry();
      resetBtn.textContent = 'リセットしました';
      resetBtn.disabled = true;
      showBatchToast(`NG記録をリセットしました（${ngCount}名を対象に戻しました）`);
      setTimeout(hideBatchToast, 5000);
    });
  }
  document.getElementById('ngWordSave').addEventListener('click', async () => {
    const words = document.getElementById('ngWordArea').value
      .split('\n').map(s => s.trim()).filter(s => s.length > 0);
    await setCustomNgWords(words);
    const nameChk = document.getElementById('ngNameChk');
    if (nameChk) await setForeignNameNg(nameChk.checked);
    el.remove();
    showBatchToast(`NGワードを保存しました（追加分 ${words.length}語）`);
    setTimeout(hideBatchToast, 4000);
  });
}

// ── 一覧ページから未処理の候補者IDを収集 ──
async function collectIdsOnPage(excludeIds) {
  const sent = await getSentRegistry();
  const ng = await getNgRegistry();
  const ids = [];
  document.querySelectorAll('a[href*="/member/detail/index/"]').forEach(a => {
    const m = (a.getAttribute('href') || '').match(/\/member\/detail\/index\/(\d+)/);
    if (!m) return;
    const id = m[1];
    if (ids.includes(id) || sent[id] || ng[id]) return;
    if (excludeIds && excludeIds.includes(id)) return;
    ids.push(id);
  });
  return ids;
}

// ── 一覧ページの表から氏名を読み取る(会員ID → 氏名) ──
// プロフィール画面に氏名欄が無い場合の保険。
// 見出し(th)で氏名の列を特定できたときだけ読み取り、
// 特定できなければ何も返さない(別の列を氏名と誤認しないため)
function collectNamesOnPage() {
  const names = {};
  document.querySelectorAll('table').forEach(table => {
    const headRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headRow) return;
    const heads = [...headRow.children].map(c => (c.textContent || '').replace(/[\s　]+/g, '').trim());
    const col = heads.findIndex(h =>
      h && !NAME_READING_RE.test(h) && NAME_FIELD_LABELS.some(l => h === l));
    if (col < 0) return;
    table.querySelectorAll('tr').forEach(tr => {
      const link = tr.querySelector('a[href*="/member/detail/index/"]');
      if (!link) return;
      const m = (link.getAttribute('href') || '').match(/\/member\/detail\/index\/(\d+)/);
      if (!m) return;
      // 列数が見出し行と違う行は、列の位置がずれて別の値を拾うため使わない
      if (tr.children.length !== heads.length) return;
      const cell = tr.children[col];
      if (!cell) return;
      const v = cleanNameValue(cell.textContent || '');
      if (v) names[m[1]] = v;
    });
  });
  return names;
}

// ── 検索フォームの保存と再送信 ──
// このサイトのページ送りは「検索フォームの再送信」で動く。
// プロフィール画面を経由して一覧に戻るとフォームの中身が空になるうえ、
// 都道府県のように「選択」ダイアログで作られる項目は、まっさらな画面では
// 入力欄そのものが存在しないため、値を書き戻すこともできない。
// そこで、バッチ開始時の検索条件をまるごと覚えておき、一覧に戻るときは
// 自前のフォームで同じ内容を送信し直す(サイトの入力チェックを経由しない)。
function findSearchForm() {
  const forms = [...document.querySelectorAll('form')].filter(f => !f.closest('#scout-batch-panel'));
  if (!forms.length) return null;
  // ①「この条件で検索する」ボタンを持つフォーム(いちばん確実)
  const byButton = forms.find(f =>
    [...f.querySelectorAll('input[type="submit"], input[type="button"], button, a')].some(el => {
      const t = (el.tagName === 'INPUT' ? el.value : el.textContent) || '';
      return /この条件で検索|検索する/.test(t);
    }));
  if (byButton) return byButton;
  // ② 検索条件の項目名を含むフォーム
  const byField = forms.find(f => /希望雇用形態|希望業態|希望勤務地|現住所/.test(f.textContent || ''));
  if (byField) return byField;
  // ③ 最後の手段: 入力欄がいちばん多いフォーム
  return forms.reduce((best, f) => {
    const n = f.querySelectorAll('input, select, textarea').length;
    return n > (best ? best.querySelectorAll('input, select, textarea').length : -1) ? f : best;
  }, null);
}

// ページ番号を保持する隠しフィールド。書き戻すとページ送りが1ページ目に戻るため触らない
const PAGING_FIELD_RE = /^(page|pageno|page_no|pagenum|pageindex|p|offset|start)$/i;

// 検索条件ではなく候補者一覧の選択チェックボックス等は対象外にする
function isCandidateRowField(el) {
  const tr = el.closest('tr');
  return !!(tr && tr.querySelector('a[href*="/member/detail/index/"]'));
}

// ページ番号の項目名(この値を書き換えて目的のページを取り出す)
const PAGE_NUMBER_FIELD_RE = /^(page|pageno|page_no|pagenum|pageindex|nowpage|currentpage)$/i;

function serializeSearchForm() {
  const form = findSearchForm();
  if (!form) return null;
  const data = [];
  const pageNames = [];
  form.querySelectorAll('input, select, textarea').forEach(el => {
    if (!el.name || el.disabled) return;
    if (el.type === 'submit' || el.type === 'button' || el.type === 'file' || el.type === 'password') return;
    if (isCandidateRowField(el)) return;         // 一覧の選択チェックは触らない
    if (PAGE_NUMBER_FIELD_RE.test(el.name)) {    // ページ番号は覚えるが値は使わない
      if (!pageNames.includes(el.name)) pageNames.push(el.name);
      return;
    }
    if (PAGING_FIELD_RE.test(el.name)) return;   // offset等も送信時に指定し直す
    if (el.type === 'checkbox' || el.type === 'radio') {
      data.push({ name: el.name, value: el.value, checked: el.checked, type: el.type });
    } else if (el.tagName === 'SELECT' && el.multiple) {
      data.push({ name: el.name, values: [...el.selectedOptions].map(o => o.value), type: 'select-multiple' });
    } else {
      data.push({ name: el.name, value: el.value, type: el.type || el.tagName.toLowerCase() });
    }
  });
  // 中身がほとんど無いフォームは「空の状態」なので覚えない
  const filled = data.filter(d => d.checked || (d.value && d.value.length) || (d.values && d.values.length));
  if (!filled.length) return null;
  return {
    action: form.getAttribute('action') || location.pathname,
    method: (form.getAttribute('method') || 'post').toLowerCase(),
    fields: data,
    pageNames
  };
}

// 覚えた検索条件を、自前のフォームで送信し直して一覧を開く。
// サイトの「次へ」と違って画面の入力チェックを通らないため、
// プロフィール画面を経由してフォームが空になっていても確実に開ける
function submitSavedSearch(saved, pageNo) {
  if (!saved || !saved.fields || !saved.fields.length) return false;
  const f = document.createElement('form');
  f.method = saved.method === 'get' ? 'get' : 'post';
  f.action = saved.action || location.pathname;
  f.style.display = 'none';
  const add = (name, value) => {
    const i = document.createElement('input');
    i.type = 'hidden';
    i.name = name;
    i.value = value == null ? '' : String(value);
    f.appendChild(i);
  };
  saved.fields.forEach(d => {
    if (d.type === 'checkbox' || d.type === 'radio') {
      if (d.checked) add(d.name, d.value);       // 未チェックは送らない(ブラウザと同じ挙動)
    } else if (d.type === 'select-multiple') {
      (d.values || []).forEach(v => add(d.name, v));
    } else {
      add(d.name, d.value);
    }
  });
  if (pageNo && saved.pageNames && saved.pageNames.length) {
    saved.pageNames.forEach(n => add(n, pageNo));
  }
  document.body.appendChild(f);
  f.submit();
  return true;
}

// 一覧へ戻る(覚えた条件で送信し直す。無理なら元のURLへ)
function gotoListPage(b, pageNo) {
  if (b && b.searchForm && submitSavedSearch(b.searchForm, pageNo)) return;
  location.href = (b && b.listUrl) || '/shop-pc/member/list';
}

function restoreSearchForm(data) {
  if (!data || !data.length) return false;
  const form = findSearchForm();
  if (!form) return false;
  let restored = 0;
  // 注意: ここでは change イベントを発火させない。
  // 表示件数の選択などは変更時に自動で再検索する作りのことがあり、
  // 書き戻した瞬間にページが飛んでしまうため。フォーム送信時に値は読まれる
  data.forEach(d => {
    const els = [...form.querySelectorAll(`[name="${CSS.escape(d.name)}"]`)]
      .filter(el => !isCandidateRowField(el));
    if (!els.length) return;
    if (d.type === 'checkbox' || d.type === 'radio') {
      const el = els.find(x => x.value === d.value) || els[0];
      el.checked = d.checked;
      restored++;
    } else if (d.type === 'select-multiple') {
      const el = els[0];
      [...el.options].forEach(o => { o.selected = (d.values || []).includes(o.value); });
      restored++;
    } else {
      els[0].value = d.value;
      restored++;
    }
  });
  return restored > 0;
}

// ページ送りのクリック中だけ、サイトのアラートを止める(処理が固まるのを防ぐ)。
// 指示はページ側へ非同期で伝わるため、有効になった合図を待ってから次に進む
function suppressSiteAlert(ms) {
  return new Promise((resolve) => {
    let done = false;
    const handler = (e) => {
      if (e.source !== window || e.data?.type !== 'scout_alert_suppress_ready') return;
      if (done) return;
      done = true;
      window.removeEventListener('message', handler);
      resolve(true);
    };
    window.addEventListener('message', handler);
    window.postMessage({ type: 'scout_suppress_alert', ms: ms || 8000 }, '*');
    setTimeout(() => {
      if (done) return;
      done = true;
      window.removeEventListener('message', handler);
      resolve(false);
    }, 1500);
  });
}
function restoreSiteAlert() {
  window.postMessage({ type: 'scout_restore_alert' }, '*');
}

// 現在のページ番号(ページ送りの見出しでリンクになっていない数字)
function currentPageNumber() {
  const nav = [...document.querySelectorAll('a')].find(a => (a.textContent || '').trim() === '次へ');
  const box = nav ? nav.parentElement : null;
  if (box) {
    const active = [...box.children].find(c => c.tagName !== 'A' && /^\d+$/.test((c.textContent || '').trim()));
    if (active) return parseInt(active.textContent.trim(), 10);
  }
  return null;
}

// ページ番号のリンク(「次へ」が効かない場合の代替)
function findPageNumberLink(num) {
  if (!num) return null;
  return [...document.querySelectorAll('a')].find(a => {
    if (a.closest('#scout-batch-panel')) return false;
    return (a.textContent || '').trim() === String(num);
  }) || null;
}

// ── 検索結果の件数(「3044名が検索されました」)を読む ──
// 一覧を開き直したときに件数が跳ね上がっていたら、検索条件が
// 引き継がれていない(全国が対象になっている等)と判断するために使う
function getSearchResultCount() {
  const body = document.body;
  const t = zenToHan((body && (body.innerText || body.textContent)) || '');
  const m = t.match(/([0-9,]+)\s*名が検索されました/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  return isNaN(n) ? null : n;
}

// ── 地域の照合(検索条件が外れたまま送ってしまう事故の防止) ──
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];
// 地域の照合を行う上限。これより多くの都道府県が並ぶ検索は
// 「地域を絞っていない」とみなして照合しない(正しい候補者を弾かないため)
const PREF_CHECK_MAX = 10;

function extractPrefecture(text) {
  const t = String(text || '');
  return PREFECTURES.find(p => t.includes(p)) || null;
}

// 一覧に並んでいる候補者の都道府県を集める(開始時の「対象地域」として記憶する)
function collectPrefsOnPage() {
  const prefs = [];
  document.querySelectorAll('tr').forEach(tr => {
    if (!tr.querySelector('a[href*="/member/detail/index/"]')) return;
    const p = extractPrefecture(tr.textContent || '');
    if (p && !prefs.includes(p)) prefs.push(p);
  });
  return prefs;
}

// ── 一覧の「次へ」リンクを探す ──
// このサイトのページ送りはJavaScript式(href="javascript:..." や "#")なので、
// hrefの内容では有効性を判断できない。無効化クラスの有無だけで判定する
function findNextPageLink() {
  const links = [...document.querySelectorAll('a, button')].filter(el => {
    if (el.closest('#scout-batch-panel')) return false;
    const t = (el.textContent || '').trim();
    return t === '次へ' || t === '次へ >' || t === '>' || t === '次' || t === '次のページ';
  });
  return links.find(el => {
    if (el.disabled) return false;
    const cls = el.className || '';
    return !/disabled|inactive|is-disabled/i.test(cls);
  }) || null;
}

async function startBatch(dryRun) {
  const existing = await getBatch();
  if (existing && existing.active) { showBatchToast('すでに動いています。止めるには「止」を押してください'); return; }
  let queue = await collectIdsOnPage(null);
  if (BATCH_MAX > 0) queue = queue.slice(0, BATCH_MAX);
  // このページが処理済みの人だけでも中止しない。次のページから探し始める
  const startNote = queue.length
    ? `このページの${queue.length}件から開始し、終わり次第ページを進めて続けます。`
    : `このページは処理済みの方だけのため、次のページから対象を探して始めます。`;
  const limitNote =
    `${startNote}\n件数の上限はありません。「止」を押すまで、または候補者がいなくなるまで動き続けます。`;
  if (!dryRun && !confirm(`本番モード: 検証を通過したメールは確認なしで自動送信されます。\n${limitNote}\nよろしいですか？`)) return;
  if (dryRun && !confirm(`ドライラン: 送信ボタンは押さずに生成と検証だけを行います。\n${limitNote}\nよろしいですか？`)) return;
  await setBatch({
    active: true, dryRun, queue, idx: 0,
    phase: queue.length ? 'profile' : 'refill',
    regen: 0, stopped: false,
    log: [], startedAt: Date.now(),
    listUrl: location.href, emptyPages: 0,
    names: collectNamesOnPage(),
    // 一覧に戻るときに送信し直すための検索条件と、いま見ているページ番号
    searchForm: serializeSearchForm(),
    pageNo: currentPageNumber() || 1,
    lastPageSig: pageSignature(),
    // 開始時の検索件数。一覧を開き直したときの照合に使う
    searchCount: getSearchResultCount(),
    // 開始時の一覧に並んでいた都道府県(対象地域の照合に使う)
    prefs: collectPrefsOnPage()
  });
  const b = await getBatch();
  showBatchCounter(b);
  if (queue.length) {
    gotoCurrent();
  } else {
    showBatchToast('このページは処理済みです。対象がいるページを探します...');
    batchRefillStep();
  }
}

async function requestBatchStop() {
  const b = await getBatch();
  if (b && b.active) {
    // ハードストップ: 生成待ちで固まっていても即座に終了する
    // (旧実装は停止フラグを立てるだけで、回答が返らないと処理されず固まった)
    clearTimeout(batchWatchdog);
    batchAwait = null;
    batchRouted = false;
    b.stopped = true;
    await finishBatch(b, '停止しました');
  } else {
    showBatchToast('実行中のバッチはありません');
    setTimeout(hideBatchToast, 3000);
  }
}

// ── ウォッチドッグ: 生成/検査の応答が一定時間来なければ自動でスキップ ──
// (人間がGeminiを触って固まった場合などの自動復帰)
let batchWatchdog = null;
function armWatchdog(kind) {
  clearTimeout(batchWatchdog);
  batchWatchdog = setTimeout(async () => {
    if (batchAwait === kind) {
      await batchHandleError('応答タイムアウト(3分)。Geminiが応答しませんでした');
    }
  }, 180000);
}

async function gotoCurrent() {
  const b = await getBatch();
  if (!b || !b.active) return;
  // 待機中に停止が押されていたら、次の候補へ進まず即終了する
  if (b.stopped) { await finishBatch(b); return; }
  location.href = '/shop-pc/member/detail/index/' + b.queue[b.idx];
}

const BATCH_RESULT_LABEL = {
  sent: '送信済み', ready: '準備OK(未送信)', skip: 'スキップ', error: 'エラー'
};

async function finishBatch(b, msg) {
  b.active = false;
  await setBatch(b);
  await new Promise(res => chrome.storage.local.set({ autoLastReport: b }, res));
  hideBatchCounter();
  hideBatchToast();
  // 完了時は画面中央に結果を開かず、右下に控えめなお知らせを出すだけにする
  // (詳しい結果は、お知らせの「詳細」か「報」ボタンから開く)
  showDoneNotice(b, msg);
}

// ── 完了のお知らせ(画面右下・控えめな表示) ──
function showDoneNotice(b, msg) {
  const old = document.getElementById('scout-done-notice');
  if (old) old.remove();

  const counts = { sent: 0, ready: 0, skip: 0, error: 0 };
  (b.log || []).forEach(e => { if (counts[e.result] !== undefined) counts[e.result]++; });
  const main = b.dryRun ? counts.ready : counts.sent;

  const el = document.createElement('div');
  el.id = 'scout-done-notice';
  el.style.cssText =
    'position:fixed;right:20px;bottom:20px;z-index:99999;background:#fff;' +
    'border:1px solid #dadce0;border-left:4px solid #188038;border-radius:8px;' +
    'padding:12px 14px;width:270px;box-shadow:0 4px 16px rgba(0,0,0,0.16);' +
    'color:#202124;font-size:12px;line-height:1.6;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
  el.innerHTML =
    `<div style="display:flex;align-items:flex-start;justify-content:space-between;">` +
    `<div style="font-weight:bold;">処理が完了しました</div>` +
    `<span id="scoutDoneClose" title="閉じる" style="cursor:pointer;color:#5f6368;` +
    `font-size:14px;line-height:1;padding:0 2px;">×</span></div>` +
    `<div style="margin-top:4px;">完了 <b>${main}</b>件 ／ 対象外 ${counts.skip}件` +
    `${counts.error ? ` ／ エラー ${counts.error}件` : ''}</div>` +
    (msg ? `<div style="margin-top:6px;color:#5f6368;font-size:11px;">${msg}</div>` : '') +
    `<div style="margin-top:8px;"><span id="scoutDoneDetail" style="cursor:pointer;color:#1a73e8;` +
    `text-decoration:underline;font-size:11px;">詳細を見る</span></div>`;
  document.body.appendChild(el);

  document.getElementById('scoutDoneClose').addEventListener('click', () => el.remove());
  document.getElementById('scoutDoneDetail').addEventListener('click', () => {
    el.remove();
    showReport(b);
  });
}

// メール全文は直近この件数分だけ保持する
// (件数無制限で回すため、全件保持するとstorage超過とレポート肥大を招く)
const BATCH_KEEP_MAILS = 40;

async function recordAndNext(result, reason, mail) {
  const b = await getBatch();
  if (!b || !b.active) return;
  b.log.push({ id: b.queue[b.idx], result, reason: reason || '', mail: mail || null, at: Date.now() });
  // 古いエントリのメール本文を落とす(結果と理由の行は全件残す)
  const withMail = b.log.filter(e => e.mail);
  if (withMail.length > BATCH_KEEP_MAILS) {
    withMail.slice(0, withMail.length - BATCH_KEEP_MAILS).forEach(e => { e.mail = null; e.mailTrimmed = true; });
  }
  if (result === 'sent') await addSentRegistry(b.queue[b.idx]);
  // 生成まで進めた候補者があれば、Geminiは動いているので連続エラーの数を戻す
  if (result === 'sent' || result === 'ready') b.errStreak = 0;
  b.idx++;
  b.phase = 'profile';
  b.regen = 0;
  b.pendingMail = null;

  showBatchCounter(b);
  if (b.stopped) { await finishBatch(b); return; }

  // 通常は5〜10秒。Geminiが不調なときは間隔を空けて様子を見る
  let wait = 5000 + Math.floor(Math.random() * 5000);
  if (b.errStreak) wait = Math.min(60000 * b.errStreak, 180000);

  // キューを使い切ったら一覧へ戻って補充する(件数上限なし)
  if (b.idx >= b.queue.length) {
    b.phase = 'refill';
    await setBatch(b);
    showBatchToast(`${b.log.length}件 完了。一覧に戻って次を探します...`);
    // 覚えた検索条件で一覧を開き直す(現在のページのまま)
    setTimeout(() => gotoListPage(b, b.pageNo || null), wait);
    return;
  }

  await setBatch(b);
  showBatchToast(`${b.log.length}件 完了。${Math.round(wait / 1000)}秒後に次へ...`);
  setTimeout(gotoCurrent, wait);
}

// ── 一覧ページでキューを補充する。無ければ次ページへ進む ──
let refillRetry = 0;
let refillInFlight = false;
let refillSeq = 0;
// ページ送りを予約したら、そのページでは以後の補充処理を止める
// (DOM監視からの再呼び出しで二重にページを進めないため。ページ遷移で自動的に解除される)
let pagingScheduled = false;
async function batchRefillStep() {
  // 二重実行の防止。
  // AJAXでページ送りすると DOM監視(MutationObserver)経由の routeBatch と
  // クリック後の保険タイマーの両方から呼ばれ得るため、同時実行を禁止する
  // (同時に走ると片方がキュー追加、もう片方が「空ページ」と誤判定して
  //  次ページへ進んでしまい、処理が飛ぶ)
  if (refillInFlight) return;
  refillInFlight = true;
  refillSeq++;
  try {
    await batchRefillStepInner();
  } finally {
    refillInFlight = false;
  }
}

async function batchRefillStepInner() {
  if (pagingScheduled) return; // 次ページへの移動を予約済み
  const b = await getBatch();
  if (!b || !b.active) return;
  if (b.stopped) { await finishBatch(b); return; }

  // 描画待ち: 候補者リンクが1つも無い場合はまだ読み込み中の可能性が高い。
  // ここで「空ページ」と誤判定すると候補者を取りこぼすため、数回リトライする
  const anyLink = document.querySelector('a[href*="/member/detail/index/"]');
  if (!anyLink && refillRetry < 4) {
    refillRetry++;
    showBatchToast(`一覧の読み込みを待っています... (${refillRetry}/4)`);
    setTimeout(batchRefillStep, 2000);
    return;
  }
  refillRetry = 0;

  // 検索条件が引き継がれているかの確認。
  // 開き直した一覧の件数が開始時より大きく増えていたら、条件が外れて
  // 対象外の地域まで含まれている可能性が高いので、送らずに止める
  const nowCount = getSearchResultCount();
  if (b.searchCount && nowCount && nowCount > b.searchCount + 50) {
    await finishBatch(b,
      `検索条件が引き継がれていない可能性があるため停止しました` +
      `（開始時 ${b.searchCount}名 → いま ${nowCount}名）。` +
      `お手数ですが、条件を入れて「この条件で検索する」を押し直してから「動」で再開してください。`);
    return;
  }

  // ページ送りをしたのに中身が前と同じなら、それ以上先には進めない
  // (最終ページに達した場合など。無限に同じページを見続けないための歯止め)
  const sig = pageSignature();
  if (b.pagingTried && sig && sig === b.lastPageSig) {
    await finishBatch(b, 'これ以上ページを進められないため終了しました');
    return;
  }
  b.lastPageSig = sig;
  b.pagingTried = false;

  // このバッチで既に処理した候補者は除外(送信済み・NG済みはレジストリ側で除外)
  const fresh = await collectIdsOnPage(b.queue);

  if (fresh.length) {
    b.queue = b.queue.concat(fresh);
    b.names = Object.assign(b.names || {}, collectNamesOnPage());
    b.phase = 'profile';
    b.emptyPages = 0;
    b.listUrl = location.href;
    // 検索条件が画面に残っていれば覚え直す(一覧に戻るときに送信し直すため)
    const form = serializeSearchForm();
    if (form) b.searchForm = form;
    b.pageNo = currentPageNumber() || b.pageNo || 1;
    if (!b.searchCount && nowCount) b.searchCount = nowCount;
    if (!b.prefs || !b.prefs.length) b.prefs = collectPrefsOnPage();
    await setBatch(b);
    showBatchToast(`${fresh.length}件を追加。処理を続けます...`);
    setTimeout(gotoCurrent, 1500);
    return;
  }

  // このページに新規候補者がいない
  b.emptyPages = (b.emptyPages || 0) + 1;

  // 自動ページ送りが無効な場合は、ここで終了して次の手を案内する
  if (!BATCH_AUTO_PAGING) {
    await finishBatch(b,
      'このページに未処理の候補者がいなくなりました。' +
      '表示件数を増やす（20件→100件など）か、検索条件を変えてから再度「動」を押してください。');
    return;
  }

  if (b.emptyPages >= BATCH_MAX_EMPTY_PAGES) {
    await finishBatch(b, '対象の候補者がいなくなったため終了しました');
    return;
  }
  const shownPage = currentPageNumber();
  const nowPage = b.pageNo || shownPage || 1;
  const nextPage = nowPage + 1;

  // ① 覚えた条件でページ番号を指定して送信し直す(最優先。入力チェックを通らない)
  if (b.searchForm && b.searchForm.pageNames && b.searchForm.pageNames.length) {
    b.pageNo = nextPage;
    b.pagingTried = true; // 進んだのに中身が同じなら最終ページと判断する
    await setBatch(b);    // phaseは'refill'のまま
    showBatchToast(`このページは処理済みです。${nextPage}ページ目を確認します...（${b.emptyPages}）`);
    pagingScheduled = true;
    setTimeout(() => { gotoListPage(b, nextPage); }, 2000);
    return;
  }

  // ② ページ番号の項目が分からない場合は、画面のページ送りをクリックする
  const next = findNextPageLink();
  const numberLink = findPageNumberLink(shownPage ? shownPage + 1 : null);
  if (!next && !numberLink) {
    await finishBatch(b, '最終ページまで処理したため終了しました');
    return;
  }
  b.pageNo = nextPage;
  b.pagingTried = true; // 進んだのに中身が同じなら最終ページと判断する
  await setBatch(b);
  showBatchToast(`このページは処理済みです。次のページへ進みます... (${b.emptyPages}/${BATCH_MAX_EMPTY_PAGES})`);
  pagingScheduled = true;
  setTimeout(async () => {
    // 条件が足りずアラートが出ても固まらないよう、クリックの前に止めておく
    // (指示は非同期で伝わるため、有効になるのを待ってからクリックする)
    await suppressSiteAlert(15000);
    // 画面に入力欄が残っていれば条件を書き戻す(あれば成功率が上がる)
    restoreSearchForm(b.searchForm && b.searchForm.fields);

    const seqAtClick = refillSeq;
    const before = pageSignature();
    // JavaScript式のページ送りにも対応するため、必ずクリックで遷移させる
    (next || numberLink).click();
    // 「次へ」で動かなかった場合に備え、少し待ってページ番号のリンクも試す
    if (next && numberLink) {
      setTimeout(() => {
        if (pageSignature() === before && refillSeq === seqAtClick) numberLink.click();
      }, 4000);
    }
    // AJAXで表が差し替わる場合はページが再読み込みされず、
    // content scriptも再実行されないため、自分で再チェックする
    // (ページ遷移が起きた場合はこのタイマーごと破棄される)
    batchRouted = false;
    waitForListChange(before, seqAtClick, 0);
  }, 2000);
}

// ページ送りが失敗した(サイトのアラートで止められた)ことを覚えておく
let lastSuppressedAlert = '';
window.addEventListener('message', (e) => {
  if (e.source !== window || e.data?.type !== 'scout_alert_suppressed') return;
  lastSuppressedAlert = String(e.data.message || '').slice(0, 100);
});

// 一覧に並んでいる候補者IDの並び。ページが切り替わったかの判定に使う
function pageSignature() {
  const ids = [];
  document.querySelectorAll('a[href*="/member/detail/index/"]').forEach(a => {
    const m = (a.getAttribute('href') || '').match(/\/member\/detail\/index\/(\d+)/);
    if (m) ids.push(m[1]);
  });
  return ids.join(',');
}

// ページ送りクリック後、一覧の中身が入れ替わるのを待ってから補充を再開する。
// AJAXの読み込みが遅い場合に、古いページを見て「処理済み」と誤判定し
// ページを飛ばしてしまうのを防ぐ(最大約12秒待って、その後は続行)
function waitForListChange(before, seqAtClick, attempt) {
  setTimeout(async () => {
    if (refillSeq !== seqAtClick) return; // 他経路で既に補充が走った
    if (pageSignature() !== before) { lastSuppressedAlert = ''; pagingScheduled = false; batchRefillStep(); return; }
    if (attempt >= 3) {
      // サイト側のアラートで止められた場合は、原因を添えて終了する
      // (同じ操作を繰り返しても進めないため)
      if (lastSuppressedAlert) {
        const b = await getBatch();
        if (b && b.active) {
          await finishBatch(b,
            `次のページへ進めませんでした（画面の案内: ${lastSuppressedAlert}）。` +
            `検索条件を入れ直して検索し直してから、もう一度「動」を押してください。`);
          return;
        }
      }
      // 予約を解除して、同じページのままかどうかを補充処理に判定させる
      pagingScheduled = false;
      batchRefillStep();
      return;
    }
    waitForListChange(before, seqAtClick, attempt + 1);
  }, 3000);
}

// ── ページ種別ごとの処理振り分け(tryInitから毎回呼ばれる。1ページ1回だけ実行) ──
async function routeBatch() {
  renderBatchPanel();
  if (batchRouted) return;
  // 競合防止: 非同期読み込みの前に同期的にガードを立てる
  // (tryInitは1ページで複数回呼ばれるため、await中に2回目が通過するのを防ぐ)
  batchRouted = true;
  const b = await getBatch();
  if (!b || !b.active) { batchRouted = false; hideBatchCounter(); return; }
  showBatchCounter(b);
  const target = b.queue[b.idx];

  // 送信後: サイトは検索一覧に戻る(実機確認済み)。スカウト画面のままなら失敗
  if (b.phase === 'postSend') {
    if (isScoutPage()) {
      await recordAndNext('error', '送信後もスカウト画面のまま');
    } else {
      await recordAndNext('sent', '', b.pendingMail || null);
    }
    return;
  }

  // キュー補充フェーズ: 一覧ページで次の候補者を集める / 次ページへ進む
  if (b.phase === 'refill') {
    if (isListPage()) {
      setTimeout(batchRefillStep, 1500);
    } else {
      // 一覧以外にいる場合は、覚えた検索条件で一覧を開き直す
      setTimeout(() => gotoListPage(b, b.pageNo || null), 1500);
    }
    return;
  }

  showBatchToast(`${b.log.length + 1}件目を処理中...`);

  if (b.phase === 'profile' && getProfilePageMemberId() === target) {
    setTimeout(() => batchProfileStep(target), 2000);
    return;
  }
  if (b.phase === 'scout' && isScoutPage()) {
    setTimeout(() => batchScoutStep(target), 1500);
    return;
  }
  // 想定外のページにいる場合は、現在の候補者をプロフィールからやり直す
  // (スリープ復帰・手動でのページ移動などからの自動復帰)
  if (b.phase === 'profile' || b.phase === 'scout') {
    b.phase = 'profile';
    b.regen = 0;
    await setBatch(b);
    showBatchToast('処理を再開します...');
    setTimeout(gotoCurrent, 1500);
  }
}

// ── 中断した処理を再開する(スリープ復帰・固まった場合) ──
async function resumeBatch() {
  const b = await getBatch();
  if (!b || !b.active) {
    showBatchToast('中断中の処理はありません。開始するには「動」を押してください');
    setTimeout(hideBatchToast, 4000);
    return;
  }
  // 応答待ちなどの一時状態をリセットし、現在の候補者からやり直す
  clearTimeout(batchWatchdog);
  batchAwait = null;
  batchMail = null;
  batchRouted = false;
  b.regen = 0;
  if (b.phase === 'scout' || b.phase === 'postSend') b.phase = 'profile';
  await setBatch(b);
  showBatchCounter(b);
  showBatchToast(`${b.log.length}件まで完了。続きから再開します...`);
  if (b.phase === 'refill') {
    setTimeout(() => gotoListPage(b, b.pageNo || null), 1500);
  } else {
    setTimeout(gotoCurrent, 1500);
  }
}

// ── プロフィール画面: 情報取得→NG判定→スカウト画面へ ──
async function batchProfileStep(target) {
  let text = extractCandidateInfo();
  if (!text || text.length < 200) {
    await new Promise(r => setTimeout(r, 2500));
    text = extractCandidateInfo();
  }
  if (!text || text.length < 200) { await recordAndNext('skip', 'プロフィール取得失敗'); return; }

  // 氏名は 画面の表 → プロフィール本文 → 一覧で拾った氏名 の順に見る
  const bNames = await getBatch();

  // 対象地域の照合。検索条件が外れて別の地域の方が混ざった場合に送らない
  // (開始時の一覧に無かった都道府県の方は、その回は見送る)
  const prefs = (bNames && bNames.prefs) || [];
  if (prefs.length && prefs.length <= PREF_CHECK_MAX) {
    const domFields = readProfileFieldsFromDom();
    const addr = domFields['住所'] || profileFieldValue(
      text.split('\n').map(l => l.trim()).filter(Boolean), '住所');
    const pref = extractPrefecture(addr);
    if (pref && !prefs.includes(pref)) {
      const bb = await getBatch();
      bb.outOfArea = (bb.outOfArea || 0) + 1;
      await setBatch(bb);
      if (bb.outOfArea >= 3) {
        await finishBatch(bb,
          `検索条件が引き継がれていない可能性があるため停止しました` +
          `（対象地域外の方が続けて${bb.outOfArea}名: 直近は${pref}）。` +
          `条件を入れて「この条件で検索する」を押し直してから「動」で再開してください。`);
        return;
      }
      await recordAndNext('skip', `対象地域外(${pref})`);
      return;
    }
    if (bNames.outOfArea) { bNames.outOfArea = 0; await setBatch(bNames); }
  }
  const ng = ngCheck(text, await getCustomNgWords(), {
    nameNg: await getForeignNameNg(),
    fields: readProfileFieldsFromDom(),
    fallbackName: (bNames && bNames.names) ? bNames.names[target] : null
  });
  if (ng) {
    // 決定的なNG(職種・NGワード・氏名・未経験・転職回数)は記録して次回以降のキューから除外する
    // (「判定不能」「情報不足」は、あとから本人が記入する可能性があるため記録しない。
    //  次回のバッチでもう一度プロフィールを見に行く)
    if (!ng.startsWith('判定不能') && !ng.startsWith('情報不足')) {
      await addNgRegistry(target, ng);
    }
    await recordAndNext('skip', ng);
    return;
  }

  await storeProfile(target, text);

  const btn = [...document.querySelectorAll('a, button, input[type="button"], input[type="submit"]')]
    .find(el => ((el.tagName === 'INPUT' ? el.value : el.textContent) || '').includes('スカウトメール送信'));
  if (!btn) { await recordAndNext('error', 'スカウトメール送信ボタンが見つからない'); return; }

  const b = await getBatch();
  b.phase = 'scout';
  await setBatch(b);
  if (btn.tagName === 'A' && btn.href) { location.href = btn.href; } else { btn.click(); }
}

// ── スカウト画面: 生成を開始 ──
async function batchScoutStep(target) {
  const rid = getRecipientMemberId();
  if (rid !== target) { await recordAndNext('error', `宛先不一致(宛先=${rid})`); return; }
  const profile = await getStoredProfile(target);
  if (!profile || !profile.text) { await recordAndNext('error', 'プロフィール未保存'); return; }
  batchRequestGenerate(profile.text);
}

async function batchRequestGenerate(profileText) {
  const b = await getBatch();
  if (!b || !b.active) return;
  batchAwait = 'generate';
  batchMail = null;
  armWatchdog('generate');
  showBatchToast(`${b.log.length + 1}件目: 文面を作成中...`);
  const fullPrompt = `${SYSTEM_PROMPT}\n\n---\n候補者情報:\n${profileText}\n\n上記の候補者情報をもとにスカウトメールを作成してください。出力は件名1行＋空行＋本文のみ。ラベルは不要です。`;
  chrome.runtime.sendMessage({ action: 'openGemini', prompt: fullPrompt, mode: 'generate' });
}

// ── 生成結果の受け取り(第1層: ルールベース検証 → 入力 → 第2層: AI二次検査) ──
async function batchHandleGenerated(message) {
  batchAwait = null;
  clearTimeout(batchWatchdog);
  const b = await getBatch();
  if (!b || !b.active) return;

  let subjectText = message.subject || '';
  let bodyText = message.body || '';
  if ((!subjectText || !bodyText) && message.rawText) {
    const lines = message.rawText.trim().split('\n');
    if (!subjectText && lines.length > 0) subjectText = lines[0].trim();
    if (!bodyText && lines.length > 2) {
      const bodyStart = lines[1].trim() === '' ? 2 : 1;
      bodyText = lines.slice(bodyStart).join('\n').trim();
    }
  }
  const cleaned = cleanGeminiOutput(subjectText, bodyText);
  subjectText = cleaned.subject;
  bodyText = cleaned.body;

  const issues = [];
  if (subjectText.length < 10 || subjectText.length > 70) issues.push(`件名文字数(${subjectText.length})`);
  if (bodyText.length < BATCH_BODY_MIN) issues.push(`本文が短い(${bodyText.length}文字)`);
  if (/\{\{.+?\}\}/.test(subjectText + bodyText)) issues.push('プレースホルダー残り');
  const contamination = detectEnglishContamination(bodyText);
  if (contamination) issues.push(`英単語混入(${contamination.trim()})`);
  const broken = checkFixedPhrases(bodyText);
  if (broken.length) issues.push(`確定文破損(${broken[0]})`);
  for (const w of BODY_FORBIDDEN) {
    if ((subjectText + bodyText).includes(w)) { issues.push(`禁止語句(${w})`); break; }
  }
  outer:
  for (const g of NG_OCCUPATIONS) {
    for (const w of g) {
      if (bodyText.includes(w)) { issues.push(`NG職種語の混入(${w})`); break outer; }
    }
  }

  if (issues.length) { await batchRetryOrSkip(b, issues.join(' / '), { subject: subjectText, body: bodyText }); return; }

  // フォーム入力
  let result = fillForm(subjectText, bodyText);
  if (!result.subjectFilled || !result.bodyFilled) {
    const mr = await fillFormViaMainWorld(result.subjectFilled ? '' : subjectText, result.bodyFilled ? '' : bodyText);
    result.subjectFilled = result.subjectFilled || mr.subjectFilled;
    result.bodyFilled = result.bodyFilled || mr.bodyFilled;
  }
  if (!result.subjectFilled || !result.bodyFilled) {
    await recordAndNext('error', 'フォーム入力失敗', { subject: subjectText, body: bodyText });
    return;
  }

  batchMail = { subject: subjectText, body: bodyText };
  batchAwait = 'verify';
  armWatchdog('verify');
  showBatchToast(`${b.log.length + 1}件目: 内容を確認中...`);
  chrome.runtime.sendMessage({ action: 'openGemini', mode: 'verify', prompt: buildVerifyPrompt(subjectText, bodyText) });
}

function buildVerifyPrompt(subject, body) {
  return `あなたは日本語ビジネスメールの校閲担当です。以下のスカウトメールに明確な不備がないか検査してください。

検査観点(これ以外は指摘しない):
- 誤字・脱字(例:「出出店」「有気休暇」のような文字の重複・誤変換)
- 文の途切れ・不完全な文
- 意味の通らない文
- 敬語の明らかな破綻
- 日本語文中への英単語の混入(OJT等の固有名詞は除く)
- プレースホルダーらしき記号の残り

出力形式(厳守):
- 不備がなければ「PASS」とだけ出力する
- 不備があれば1行目に「FAIL」、2行目以降に不備の箇所を1行ずつ列挙する
- 文体の好み・改善提案・感想は出力しない

---
件名: ${subject}

本文:
${body}`;
}

// ── AI二次検査の結果(第3層: 合格→送信/ドライラン記録、不合格→再生成1回→スキップ) ──
async function batchHandleVerify(message) {
  batchAwait = null;
  clearTimeout(batchWatchdog);
  const b = await getBatch();
  if (!b || !b.active) return;
  const raw = (message.rawText || message.subject || '').trim();
  const firstLine = (raw.split('\n')[0] || '').trim();
  const pass = /^PASS/i.test(firstLine);

  if (!pass) {
    const reason = raw.split('\n').slice(0, 4).join(' / ').slice(0, 200) || 'AI検査FAIL(理由不明)';
    await batchRetryOrSkip(b, `AI検査不合格: ${reason}`, batchMail);
    return;
  }

  if (b.dryRun) { await recordAndNext('ready', 'ドライラン(送信せず)', batchMail); return; }

  // 送信(即時送信・確認画面なし。送信後は検索一覧へ戻る)
  b.phase = 'postSend';
  b.pendingMail = batchMail;
  await setBatch(b);
  const btn = document.querySelector('#btn_conf, input[type="submit"][name="conf"]');
  if (!btn) {
    const b2 = await getBatch();
    b2.phase = 'scout';
    await setBatch(b2);
    await recordAndNext('error', '送信ボタンが見つからない', batchMail);
    return;
  }
  showBatchToast(`${b.log.length + 1}件目: 完了処理中...`);
  btn.click();
  // 15秒たっても画面遷移しない場合は失敗として次へ
  setTimeout(async () => {
    const cur = await getBatch();
    if (cur && cur.active && cur.phase === 'postSend' && isScoutPage()) {
      await recordAndNext('error', '送信後に画面遷移しない');
    }
  }, 15000);
}

async function batchRetryOrSkip(b, reason, mail) {
  if (b.regen < 1) {
    b.regen++;
    await setBatch(b);
    showBatchToast(`確認で差し戻し、作り直します(${String(reason).slice(0, 80)})`);
    const profile = await getStoredProfile(b.queue[b.idx]);
    if (profile && profile.text) { batchRequestGenerate(profile.text); return; }
  }
  await recordAndNext('skip', `検証不合格: ${reason}`, mail);
}

// Gemini側の不調が続いたら止める回数
// (不調のまま続けると、候補者を「エラー」で消費してしまうため)
const BATCH_MAX_ERROR_STREAK = 4;

async function batchHandleError(err) {
  const kind = batchAwait;
  batchAwait = null;
  const b = await getBatch();
  if (!b || !b.active) return;

  // Geminiが不調なときは、次々に候補者を消費せず一旦止める
  const msg = String(err);
  const geminiDown = /Gemini側のエラー|送信できませんでした|応答タイムアウト|入力エリアが見つかりません/.test(msg);
  if (geminiDown) {
    b.errStreak = (b.errStreak || 0) + 1;
    await setBatch(b);
    if (b.errStreak >= BATCH_MAX_ERROR_STREAK) {
      await finishBatch(b,
        `Geminiの不調が${b.errStreak}回続いたため一時停止しました（${msg.slice(0, 60)}）。` +
        `15〜30分ほどおいてから「再」を押すと、続きから再開できます。`);
      return;
    }
  }

  await batchRetryOrSkip(b, `${kind === 'verify' ? 'AI検査' : '生成'}エラー: ${msg.slice(0, 120)}`, batchMail);
}

// ── 完了レポート ──
function showReport(b) {
  hideBatchToast();
  const old = document.getElementById('scout-batch-report');
  if (old) old.remove();

  const counts = { sent: 0, ready: 0, skip: 0, error: 0 };
  b.log.forEach(e => { if (counts[e.result] !== undefined) counts[e.result]++; });
  const lines = b.log.map((e, i) =>
    `${i + 1}. ID ${e.id}: ${BATCH_RESULT_LABEL[e.result] || e.result}${e.reason ? ` - ${e.reason}` : ''}`);
  const mailDump = b.log.filter(e => e.mail).map(e =>
    `\n===== ID ${e.id} (${BATCH_RESULT_LABEL[e.result] || e.result}) =====\n件名: ${e.mail.subject}\n\n${e.mail.body}`).join('\n');
  const trimmed = b.log.filter(e => e.mailTrimmed).length;
  const trimNote = trimmed
    ? `\n\n※ メール全文は直近${BATCH_KEEP_MAILS}件のみ表示しています（古い${trimmed}件は結果のみ）\n`
    : '';
  const summary =
    `処理結果${b.dryRun ? '【確認モード】' : ''}\n` +
    `送信:${counts.sent}件 / 準備OK:${counts.ready}件 / スキップ:${counts.skip}件 / エラー:${counts.error}件\n\n` +
    lines.join('\n') + trimNote + '\n' + mailDump;

  const el = document.createElement('div');
  el.id = 'scout-batch-report';
  el.style.cssText =
    'position:fixed;top:40px;left:50%;transform:translateX(-50%);z-index:100000;background:#fff;' +
    'border:2px solid #1a73e8;border-radius:12px;padding:16px;width:640px;max-width:90vw;max-height:70vh;' +
    'overflow:auto;box-shadow:0 8px 32px rgba(0,0,0,0.3);font-size:12px;color:#222;' +
    'font-family:-apple-system,BlinkMacSystemFont,"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;';
  const pre = document.createElement('pre');
  pre.style.cssText = 'white-space:pre-wrap;word-break:break-all;margin:0 0 12px;';
  pre.textContent = summary;
  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'コピー';
  copyBtn.style.cssText = 'margin-right:8px;padding:6px 16px;border:none;border-radius:6px;background:#1a73e8;color:#fff;cursor:pointer;';
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(summary).then(() => { copyBtn.textContent = 'コピーしました'; });
  });
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '閉じる';
  closeBtn.style.cssText = 'padding:6px 16px;border:none;border-radius:6px;background:#5f6368;color:#fff;cursor:pointer;';
  closeBtn.addEventListener('click', () => el.remove());
  el.appendChild(pre);
  el.appendChild(copyBtn);
  el.appendChild(closeBtn);
  document.body.appendChild(el);
}
