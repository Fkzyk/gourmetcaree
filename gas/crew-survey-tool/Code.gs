/**
 * 全クルーアンケート提出確認ツール
 * ------------------------------------------------------------
 * 「26.4 学生クルー対象アンケート（回答）」の提出確認ツールと同じ仕様で、
 * 【2026】全クルー対象アンケート（回答）向けにカスタマイズしたものです。
 *
 * 機能:
 *  1. リスト更新（未提出者抽出）
 *     - 従業員リストから対象者（パート・アルバイト / 在籍中 / 店舗所属）を抽出
 *     - 氏名がカタカナのみの従業員は「外国人リスト」へ出力し対象から除外
 *     - 「除外リスト」に社員Noがある人も対象から除外
 *     - フォームの回答と照合し「未提出者」「回答率_店舗別」「回答率_営業部別」を自動生成
 *  2. 進捗確認シート更新
 *     - フォームの回答を「店舗名 / 従業員番号 / 氏名 / 進捗状況 / 架電 / …」の並びで転記
 *     - 進捗状況プルダウン・架電チェックボックスを自動設定
 *     - 同一従業員番号の重複回答は最新のみ残す（手入力済みの進捗状況・架電は保持）
 *  3. 初期セットアップ（不足シートの自動作成）
 *
 * 使い方: メニュー「📝 全クルーアンケート」から実行
 * ※ このスクリプトは Google スプレッドシート形式のファイルに紐付けて使ってください。
 *   （.xlsx のままでは Apps Script を追加できないため、
 *     ファイル > Google スプレッドシートとして保存 で変換が必要です）
 */

// ============================ 設定 ============================

var CONFIG = {
  // シート名
  SHEET_FORM: 'フォームの回答 1',
  SHEET_PROGRESS: '進捗確認',
  SHEET_PENDING: '未提出者',
  SHEET_RATE_STORE: '回答率_店舗別',
  SHEET_RATE_DIVISION: '回答率_営業部別',
  SHEET_FOREIGN: '外国人リスト',
  SHEET_EXCLUDE: '除外リスト',
  SHEET_EMPLOYEE: '従業員リスト',
  SHEET_STORE_MASTER: '店長・営業部長',
  SHEET_TEMPLATE: 'テンプレ',
  SHEET_MANUAL: '💡操作マニュアル',

  // 抽出条件
  // 社員区分名にこの文字を含む人が対象（給与システムの出力は半角カナのため両方登録:
  //  ﾊﾟｰﾄ・ｱﾙﾊﾞｲﾄ / ﾊﾟｰﾄ（社保） が対象、店員・準社員は対象外）
  EMPLOYMENT_KEYWORDS: ['パート', 'アルバイト', 'ﾊﾟｰﾄ', 'ｱﾙﾊﾞｲﾄ'],
  AGE_MIN: 22,  // 22歳以上に限定（制限をなくす場合は null を設定）
  AGE_MAX: null,

  // 進捗状況プルダウンの選択肢（学生版と同一）
  PROGRESS_OPTIONS: ['SMS送信済', '説明会日程調整中', '説明会済', '最終選考待ち', '内定', '内定承諾', '対象外'],

  // 共有用ファイルに書き出すシート（従業員リスト等の個人情報はここに含めない）
  SHARE_SHEETS: ['未提出者', '回答率_店舗別', '回答率_営業部別'],
  SHARE_FILE_NAME: '【共有用】全クルーアンケート 集計結果',

  TOOL_TITLE: '全クルーアンケート'
};

// ========================== メニュー ==========================

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📝 ' + CONFIG.TOOL_TITLE)
    .addItem('リストを更新する（未提出者抽出）', 'updateLists')
    .addItem('進捗確認シートを更新', 'syncProgressSheet')
    .addSeparator()
    .addItem('すべて更新', 'updateAll')
    .addItem('共有用ファイルを出力（集計シートのみ）', 'exportShareFile')
    .addItem('初期セットアップ（不足シート作成）', 'setupSheets')
    .addToUi();
}

function updateAll() {
  updateLists();
  syncProgressSheet();
}

// ==================== 1. 未提出者抽出・集計 ====================

function updateLists() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var now = new Date();

  // --- マスター読み込み ---
  var storeMaster = readStoreMaster_(ss);     // {map: 店番 -> {division, storeName}, divisionOrder: [...]}
  var storeMap = storeMaster.map;
  var excludeSet = readExcludeList_(ss);      // 除外する社員No の Set
  var respondentSet = readRespondents_(ss);   // 回答済み社員No の Set

  // --- 従業員リストから対象者を抽出 ---
  var empSheet = mustGetSheet_(ss, CONFIG.SHEET_EMPLOYEE);
  var empValues = empSheet.getDataRange().getValues();
  if (empValues.length < 2) throw new Error('「' + CONFIG.SHEET_EMPLOYEE + '」にデータがありません。');

  var col = findColumns_(empValues[0], {
    no: ['社員No', '社員NO', '社員番号'],
    name: ['氏名'],
    storeNo: ['所属No', '所属NO'],
    storeName: ['所属名'],
    kubun: ['社員区分名', '社員区分'],
    retired: ['退職年月日'],
    age: ['年齢']
  });
  // 外国人フラグ列(0/1)は任意。存在すればフラグを優先して外国籍判定に使う
  var foreignCol = findFormColumnOptional_(empValues[0], ['外国人']);

  var targets = [];   // 対象者 {no, name, age, storeNo, storeName, division, answered}
  var foreigners = []; // カタカナのみ氏名
  for (var r = 1; r < empValues.length; r++) {
    var row = empValues[r];
    var no = normalizeEmployeeNo_(row[col.no]);
    if (!no) continue;

    var kubun = String(row[col.kubun] || '');
    var isPartTime = CONFIG.EMPLOYMENT_KEYWORDS.some(function (k) { return kubun.indexOf(k) !== -1; });
    if (!isPartTime) continue;

    if (row[col.retired] !== '' && row[col.retired] != null) continue; // 退職済みは除外

    // 給与システムの年齢は「69.03」(69歳3ヶ月)形式のため整数部を年齢とする
    var age = Math.floor(Number(row[col.age]) || 0);
    if (CONFIG.AGE_MIN != null && !(age >= CONFIG.AGE_MIN)) continue;
    if (CONFIG.AGE_MAX != null && !(age <= CONFIG.AGE_MAX)) continue;

    var storeNo = normalizeStoreNo_(row[col.storeNo]); // 所属No「0004」と店番「4」のゼロ埋め差を吸収
    var store = storeMap[storeNo];
    if (!store) continue; // 店舗所属者のみ対象

    var name = String(row[col.name] || '').trim();
    var person = { no: no, name: name, age: age, storeNo: storeNo, storeName: store.storeName, division: store.division };

    // 外国籍判定: 外国人フラグ(=1)またはカタカナのみ氏名のどちらかに該当すれば除外
    // (フラグの登録漏れがあってもカタカナ氏名なら確実に未提出者から外すため両方で判定)
    var isForeign = (foreignCol !== null && String(row[foreignCol]).trim() === '1') || isKatakanaOnly_(name);
    if (isForeign) { // 妥当性確認用リストへ出し対象から除外
      foreigners.push(person);
      continue;
    }
    if (excludeSet[no]) continue; // 除外リスト該当者

    person.answered = !!respondentSet[no];
    targets.push(person);
  }

  // --- 集計 ---
  var answered = targets.filter(function (t) { return t.answered; });
  var pending = targets.filter(function (t) { return !t.answered; });

  writePendingSheet_(ss, now, targets.length, answered.length, pending);
  writeStoreRateSheet_(ss, now, targets, storeMaster.divisionOrder);
  writeDivisionRateSheet_(ss, now, targets, storeMaster.divisionOrder);
  writeForeignSheet_(ss, foreigners);

  SpreadsheetApp.getActiveSpreadsheet().toast(
    '対象 ' + targets.length + '人 / 回答済み ' + answered.length + '人 / 未提出 ' + pending.length + '人',
    'リスト更新 完了', 10);
}

/**
 * 店長・営業部長(店舗マスター)シートを読み込む。
 * 列はヘッダー名(営業部/店番/店名)で自動判定するため、
 * 「営業部組織_YYYY年M月」形式(営業部,都道府県,市町村,店番,店名,…)のシートもそのまま使える。
 * 営業部の表示順はマスターの出現順を保持する。
 */
function readStoreMaster_(ss) {
  var sheet = mustGetSheet_(ss, CONFIG.SHEET_STORE_MASTER);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('「' + CONFIG.SHEET_STORE_MASTER + '」にデータがありません。');
  var col = findColumns_(values[0], {
    division: ['営業部'],
    storeNo: ['店番'],
    storeName: ['店名', '店舗名']
  });
  var map = {};
  var divisionOrder = [];
  for (var r = 1; r < values.length; r++) {
    var storeNo = normalizeStoreNo_(values[r][col.storeNo]);
    if (!storeNo) continue;
    var division = String(values[r][col.division] || '').trim();
    map[storeNo] = {
      division: division,
      storeName: String(values[r][col.storeName] || '').trim()
    };
    if (division && divisionOrder.indexOf(division) === -1) divisionOrder.push(division);
  }
  return { map: map, divisionOrder: divisionOrder };
}

/** 除外リスト: A列の社員No */
function readExcludeList_(ss) {
  var sheet = ss.getSheetByName(CONFIG.SHEET_EXCLUDE);
  var set = {};
  if (!sheet) return set;
  var values = sheet.getDataRange().getValues();
  for (var r = 1; r < values.length; r++) {
    var no = normalizeEmployeeNo_(values[r][0]);
    if (no) set[no] = true;
  }
  return set;
}

/** フォームの回答から回答済み従業員番号の Set を作る */
function readRespondents_(ss) {
  var sheet = mustGetSheet_(ss, CONFIG.SHEET_FORM);
  var values = sheet.getDataRange().getValues();
  var set = {};
  if (values.length < 2) return set;
  var noCol = findFormColumn_(values[0], ['②従業員番号', '従業員番号', '②社員番号', '社員番号']);
  for (var r = 1; r < values.length; r++) {
    var no = normalizeEmployeeNo_(values[r][noCol]);
    if (no) set[no] = true;
  }
  return set;
}

function writePendingSheet_(ss, now, totalCount, answeredCount, pending) {
  var sheet = getOrCreateSheet_(ss, CONFIG.SHEET_PENDING);
  sheet.clear();

  var pendingCount = pending.length;
  var conditions = '在籍中のパート・アルバイト、店舗所属者のみ、外国籍・除外リスト対象除く';
  if (CONFIG.AGE_MIN != null && CONFIG.AGE_MAX != null) {
    conditions = CONFIG.AGE_MIN + '〜' + CONFIG.AGE_MAX + '歳の' + conditions;
  } else if (CONFIG.AGE_MIN != null) {
    conditions = CONFIG.AGE_MIN + '歳以上の' + conditions;
  } else if (CONFIG.AGE_MAX != null) {
    conditions = CONFIG.AGE_MAX + '歳以下の' + conditions;
  }
  var summary = [
    [CONFIG.TOOL_TITLE + ' 未提出者リスト', ''],
    ['集計日時', now],
    ['対象者総数', totalCount + '人(' + conditions + ')'],
    ['回答済み', answeredCount + '人 (' + percent_(answeredCount, totalCount) + ')'],
    ['未提出', pendingCount + '人 (' + percent_(pendingCount, totalCount) + ')'],
    ['詳細集計', '営業部別 → 「' + CONFIG.SHEET_RATE_DIVISION + '」シート / 店舗別 → 「' + CONFIG.SHEET_RATE_STORE + '」シート'],
    ['', ''],
    ['店舗名', '社員No', '氏名', '年齢']
  ];
  sheet.getRange(1, 1, summary.length - 1, 2).setValues(summary.slice(0, -1).map(function (r) { return [r[0], r[1]]; }));
  sheet.getRange(8, 1, 1, 4).setValues([summary[summary.length - 1]]).setFontWeight('bold').setBackground('#d9ead3');

  pending.sort(function (a, b) {
    return a.storeName === b.storeName ? Number(a.no) - Number(b.no) : (a.storeName < b.storeName ? -1 : 1);
  });
  if (pending.length) {
    sheet.getRange(9, 1, pending.length, 4).setValues(pending.map(function (p) {
      return [p.storeName, Number(p.no), p.name, p.age];
    }));
  }
  sheet.getRange('A1').setFontWeight('bold').setFontSize(12);
  sheet.getRange(2, 2).setNumberFormat('yyyy/mm/dd hh:mm');
  sheet.setFrozenRows(8);
  sheet.autoResizeColumns(1, 4);
}

function writeStoreRateSheet_(ss, now, targets, divisionOrder) {
  var sheet = getOrCreateSheet_(ss, CONFIG.SHEET_RATE_STORE);
  sheet.clear();

  var byStore = {};
  targets.forEach(function (t) {
    var key = t.storeNo;
    if (!byStore[key]) byStore[key] = { division: t.division, storeNo: t.storeNo, storeName: t.storeName, total: 0, answered: 0 };
    byStore[key].total++;
    if (t.answered) byStore[key].answered++;
  });
  var rows = Object.keys(byStore).map(function (k) { return byStore[k]; });
  var divIdx = function (d) {
    var i = (divisionOrder || []).indexOf(d);
    return i === -1 ? 999 : i;
  };
  rows.sort(function (a, b) {
    return divIdx(a.division) !== divIdx(b.division)
      ? divIdx(a.division) - divIdx(b.division)
      : Number(a.storeNo) - Number(b.storeNo);
  });

  sheet.getRange(1, 1).setValue('店舗別 回答率').setFontWeight('bold').setFontSize(12);
  sheet.getRange(2, 1).setValue('集計日時: ' + formatDate_(now));
  sheet.getRange(4, 1, 1, 7).setValues([['営業部', '店番', '店舗名', '対象者数', '回答済み', '未提出', '回答率']])
    .setFontWeight('bold').setBackground('#d9ead3');
  if (rows.length) {
    sheet.getRange(5, 1, rows.length, 7).setValues(rows.map(function (s) {
      return [s.division, Number(s.storeNo), s.storeName, s.total, s.answered, s.total - s.answered, s.total ? s.answered / s.total : 0];
    }));
    sheet.getRange(5, 7, rows.length, 1).setNumberFormat('0.0%');
  }
  sheet.setFrozenRows(4);
  sheet.autoResizeColumns(1, 7);
}

function writeDivisionRateSheet_(ss, now, targets, divisionOrder) {
  var sheet = getOrCreateSheet_(ss, CONFIG.SHEET_RATE_DIVISION);
  sheet.clear();

  var byDiv = {};
  var order = (divisionOrder || []).slice(); // 店舗マスターの出現順(関東第一→…→九州第三)を維持
  targets.forEach(function (t) {
    if (!byDiv[t.division]) {
      byDiv[t.division] = { total: 0, answered: 0 };
      if (order.indexOf(t.division) === -1) order.push(t.division);
    }
    byDiv[t.division].total++;
    if (t.answered) byDiv[t.division].answered++;
  });
  order = order.filter(function (d) { return byDiv[d]; });

  sheet.getRange(1, 1).setValue('営業部別 回答率').setFontWeight('bold').setFontSize(12);
  sheet.getRange(2, 1).setValue('集計日時: ' + formatDate_(now));
  sheet.getRange(4, 1, 1, 5).setValues([['営業部', '対象者数', '回答済み', '未提出', '回答率']])
    .setFontWeight('bold').setBackground('#d9ead3');

  var rows = order.map(function (d) {
    var v = byDiv[d];
    return [d, v.total, v.answered, v.total - v.answered, v.total ? v.answered / v.total : 0];
  });
  var totalAll = targets.length;
  var answeredAll = targets.filter(function (t) { return t.answered; }).length;
  rows.push(['全体合計', totalAll, answeredAll, totalAll - answeredAll, totalAll ? answeredAll / totalAll : 0]);

  sheet.getRange(5, 1, rows.length, 5).setValues(rows);
  sheet.getRange(5, 5, rows.length, 1).setNumberFormat('0.0%');
  sheet.getRange(4 + rows.length, 1, 1, 5).setFontWeight('bold');
  sheet.setFrozenRows(4);
  sheet.autoResizeColumns(1, 5);
}

function writeForeignSheet_(ss, foreigners) {
  var sheet = getOrCreateSheet_(ss, CONFIG.SHEET_FOREIGN);
  sheet.clear();
  sheet.getRange(1, 1).setValue('外国籍と思われる従業員の一覧(妥当性確認用)').setFontWeight('bold');
  sheet.getRange(2, 1, 1, 4).setValues([['店舗名', '社員No', '氏名', '年齢']])
    .setFontWeight('bold').setBackground('#fce5cd');
  if (foreigners.length) {
    foreigners.sort(function (a, b) { return a.storeName < b.storeName ? -1 : 1; });
    sheet.getRange(3, 1, foreigners.length, 4).setValues(foreigners.map(function (p) {
      return [p.storeName, Number(p.no), p.name, p.age];
    }));
  }
  sheet.autoResizeColumns(1, 4);
}

// ==================== 2. 進捗確認シート ====================

/**
 * フォームの回答を「店舗名 / 従業員番号 / 氏名 / 進捗状況 / 架電 / (残りの設問) / 電話番号」
 * の並びで進捗確認シートへ転記する。
 * - タイムスタンプ列は除外（学生版と同じ仕様）
 * - 同一従業員番号の重複回答は最新タイムスタンプのみ残す
 * - 既存の「進捗状況」「架電」の手入力値は従業員番号キーで引き継ぐ
 * - 電話番号はハイフン等を除去して数字のみに正規化
 */
function syncProgressSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var formSheet = mustGetSheet_(ss, CONFIG.SHEET_FORM);
  var values = formSheet.getDataRange().getValues();
  if (values.length < 2) throw new Error('「' + CONFIG.SHEET_FORM + '」に回答がありません。');

  var header = values[0];
  var iTime = findFormColumn_(header, ['タイムスタンプ']);
  var iStore = findFormColumn_(header, ['①店舗名', '店舗名']);
  var iNo = findFormColumn_(header, ['②従業員番号', '従業員番号', '②社員番号', '社員番号']);
  var iName = findFormColumn_(header, ['③氏名', '氏名']);
  var iPhone = findFormColumnOptional_(header, ['⑦電話番号', '電話番号']);

  // 進捗確認に載せる「残りの設問」列（タイムスタンプ・店舗名・番号・氏名以外を元の順で）
  var restCols = [];
  for (var c = 0; c < header.length; c++) {
    if (c === iTime || c === iStore || c === iNo || c === iName) continue;
    if (String(header[c] || '') === '') continue;
    restCols.push(c);
  }

  // 既存の進捗状況・架電を従業員番号キーで退避
  var progressSheet = getOrCreateSheet_(ss, CONFIG.SHEET_PROGRESS);
  var saved = {};
  if (progressSheet.getLastRow() > 1) {
    var old = progressSheet.getDataRange().getValues();
    for (var r = 1; r < old.length; r++) {
      var key = normalizeEmployeeNo_(old[r][1]);
      if (key && (old[r][3] !== '' || old[r][4] === true)) {
        saved[key] = { status: old[r][3], called: old[r][4] === true };
      }
    }
  }

  // 重複回答は最新のみ（従業員番号キー、タイムスタンプ比較）
  var latest = {};
  var orderKeys = [];
  for (var r2 = 1; r2 < values.length; r2++) {
    var row = values[r2];
    var no = normalizeEmployeeNo_(row[iNo]);
    if (!no && !String(row[iName] || '')) continue;
    var key2 = no || ('NAME:' + row[iName]);
    var ts = row[iTime] instanceof Date ? row[iTime].getTime() : r2;
    if (!(key2 in latest)) orderKeys.push(key2);
    if (!(key2 in latest) || ts >= latest[key2].ts) latest[key2] = { ts: ts, row: row, no: no };
  }

  // 出力
  var outHeader = [String(header[iStore]), String(header[iNo]), String(header[iName]), '進捗状況', '架電']
    .concat(restCols.map(function (c) { return String(header[c]); }));
  var out = orderKeys.map(function (k) {
    var e = latest[k];
    var s = saved[e.no] || { status: '', called: false };
    return [e.row[iStore], e.no || e.row[iNo], e.row[iName], s.status, s.called]
      .concat(restCols.map(function (c) {
        var v = e.row[c];
        if (iPhone !== null && c === iPhone) v = normalizePhone_(v);
        return v;
      }));
  });

  progressSheet.clear();
  progressSheet.getRange(1, 1, 1, outHeader.length).setValues([outHeader])
    .setFontWeight('bold').setBackground('#c9daf8').setWrap(true);
  if (out.length) {
    // 従業員番号を6桁ゼロ埋めの文字列として保持(先に書式を設定しないと数値化され先頭の0が落ちる)
    progressSheet.getRange(2, 2, out.length, 1).setNumberFormat('@');
    progressSheet.getRange(2, 1, out.length, outHeader.length).setValues(out);
    // 進捗状況プルダウン
    var rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CONFIG.PROGRESS_OPTIONS, true)
      .setAllowInvalid(true)
      .build();
    progressSheet.getRange(2, 4, out.length, 1).setDataValidation(rule);
    // 架電チェックボックス(insertCheckboxesは値をfalseに戻すため、引き継いだ値を再設定)
    progressSheet.getRange(2, 5, out.length, 1).insertCheckboxes();
    progressSheet.getRange(2, 5, out.length, 1).setValues(out.map(function (r) { return [r[4] === true]; }));
  }
  progressSheet.setFrozenRows(1);

  ss.toast(out.length + '件を転記しました（重複 ' + (values.length - 1 - out.length) + '件は最新のみ）', '進捗確認シート更新 完了', 10);
}

// ==================== 3. 共有用ファイル出力 ====================

/**
 * CONFIG.SHARE_SHEETS のシートだけを別スプレッドシートに書き出す。
 *
 * Googleスプレッドシートには「シート単位のパスワード保護(閲覧制限)」機能が無く、
 * シートの保護は編集を防ぐだけ・非表示はIMPORTRANGE等で閲覧可能なため、
 * 見せたくないシート(従業員リスト等)がある場合は、見せたいシートだけを
 * 別ファイルに出力してそちらを共有するのが安全な方法。
 *
 * - 初回実行時に共有用ファイルを自動作成(このファイルと同じフォルダ)
 * - 2回目以降は同じファイルの中身を最新の集計で上書き(共有リンクは変わらない)
 * - 出力は値のみ(数式や他シートへの参照は含まれない)
 */
function exportShareFile() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var props = PropertiesService.getDocumentProperties();

  // 共有用ファイルを取得(無ければ作成)
  var shareId = props.getProperty('SHARE_FILE_ID');
  var shareSs = null;
  if (shareId) {
    try { shareSs = SpreadsheetApp.openById(shareId); } catch (e) { shareSs = null; }
  }
  if (!shareSs) {
    shareSs = SpreadsheetApp.create(CONFIG.SHARE_FILE_NAME);
    props.setProperty('SHARE_FILE_ID', shareSs.getId());
    // 本体と同じフォルダに移動
    var thisFile = DriveApp.getFileById(ss.getId());
    var parents = thisFile.getParents();
    if (parents.hasNext()) DriveApp.getFileById(shareSs.getId()).moveTo(parents.next());
  }

  // 既存シートを一旦リネーム(全削除はできないため)して新しいコピーを配置
  var oldSheets = shareSs.getSheets();
  oldSheets.forEach(function (sh, idx) { sh.setName('_削除予定_' + idx); });

  CONFIG.SHARE_SHEETS.forEach(function (name) {
    var src = ss.getSheetByName(name);
    if (!src) return;
    var copied = src.copyTo(shareSs).setName(name);
    // 値のみに変換(本体への参照や数式を残さない)
    var range = copied.getDataRange();
    range.setValues(range.getValues());
  });

  // 古いシートを削除
  shareSs.getSheets().forEach(function (sh) {
    if (sh.getName().indexOf('_削除予定_') === 0) shareSs.deleteSheet(sh);
  });

  var url = shareSs.getUrl();
  var ui = SpreadsheetApp.getUi();
  ui.alert('共有用ファイルを出力しました',
    '以下のファイルに「' + CONFIG.SHARE_SHEETS.join('」「') + '」のみを書き出しました。\n' +
    '共有相手にはこちらのファイルだけを共有してください。\n\n' + url,
    ui.ButtonSet.OK);
}

// ==================== 4. 初期セットアップ ====================

function setupSheets() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 除外リスト
  if (!ss.getSheetByName(CONFIG.SHEET_EXCLUDE)) {
    var ex = ss.insertSheet(CONFIG.SHEET_EXCLUDE);
    ex.getRange(1, 1, 1, 3).setValues([['除外する社員No', '名前', '備考']]).setFontWeight('bold');
    ex.getRange('A2:A100').setBackground('#fff2cc');
    ex.getRange('E2').setValue('← A列の黄色い部分に「社員番号」を入れてください');
    ex.getRange('E3').setValue('※ここに番号がある人は「未提出者」に出なくなります');
  }

  // 従業員リスト（貼り付け用の空シート）
  if (!ss.getSheetByName(CONFIG.SHEET_EMPLOYEE)) {
    var emp = ss.insertSheet(CONFIG.SHEET_EMPLOYEE);
    emp.getRange(1, 1, 1, 7).setValues([['社員No', '氏名', '所属No', '所属名', '社員区分名', '退職年月日', '年齢']])
      .setFontWeight('bold').setBackground('#d9d9d9');
    emp.getRange('A2').setNote('給与システムから出力した従業員データをここに貼り付けてください。\n列名（社員No/氏名/所属No/所属名/社員区分名/退職年月日/年齢）が1行目にあれば列の並びは自由です。');
  }

  // 店長・営業部長（店舗マスター）
  if (!ss.getSheetByName(CONFIG.SHEET_STORE_MASTER)) {
    var st = ss.insertSheet(CONFIG.SHEET_STORE_MASTER);
    st.getRange(1, 1, 1, 9).setValues([['営業部', '都道府県', '店番', '店名', '店長(数)', '営業部長/IST', 'メールアドレス', '店長', 'メールアドレス']])
      .setFontWeight('bold').setBackground('#d9d9d9');
  }

  // テンプレ
  if (!ss.getSheetByName(CONFIG.SHEET_TEMPLATE)) {
    var tp = ss.insertSheet(CONFIG.SHEET_TEMPLATE);
    var lines = [
      ['', ''],
      ['店長への連絡先回収依頼テンプレ', ''],
      ['○○さん', ''],
      ['', ''],
      ['お疲れ様です。', ''],
      ['人事採用課の〇〇です。', ''],
      ['以前実施させていただいた、内部昇格のアンケートで「興味がある」と回答', ''],
      ['していただいた方の連絡先(電話番号)をご教示いただきたいです。', ''],
      ['', ''],
      ['', ''],
      ['お忙しいところ恐縮ですが、よろしくお願いいたします。', ''],
      ['', ''],
      ['候補者招待ショートメッセージテンプレ', ''],
      ['〇〇店', ''],
      ['〇〇様', ''],
      ['', ''],
      ['はじめまして。', ''],
      ['株式会社資さん人事採用課の○○と申します。', ''],
      ['以前、実施させていただいた社員登用アンケートで『興味あり』の回答を頂き', ''],
      ['ありがとうございます。', ''],
      ['ぜひ1度、webにて会社説明をさせていただきたいと考えています。', ''],
      ['（スマホから参加可能）', ''],
      ['平日でご都合の良い日を教えて頂ければ助かります！', ''],
      ['よろしくお願いいたします。', '']
    ];
    tp.getRange(1, 2, lines.length, 1).setValues(lines.map(function (l) { return [l[0]]; }));
    tp.getRange('B2').setFontWeight('bold');
    tp.getRange('B13').setFontWeight('bold');
  }

  // 操作マニュアル
  if (!ss.getSheetByName(CONFIG.SHEET_MANUAL)) {
    var mn = ss.insertSheet(CONFIG.SHEET_MANUAL);
    var manual = [
      [CONFIG.TOOL_TITLE + '提出確認ツール 操作マニュアル', ''],
      ['', ''],
      ['1. 概要', 'パート・アルバイトのうち、アンケート未回答者を自動抽出します。'],
      ['', ''],
      ['2. 各シートの役割', ''],
      ['   従業員リスト', '全スタッフの基本データ(「所属No」を店番として使用)'],
      ['   ' + CONFIG.SHEET_FORM, 'アンケート回答が届くシート(従業員番号で照合)'],
      ['   店長・営業部長', '店舗と営業部の紐付けマスター(C列「店番」で照合)'],
      ['   未提出者', '【自動更新】未提出者リスト+全体集計サマリー'],
      ['   回答率_営業部別', '【自動更新】営業部ごとの回答率'],
      ['   回答率_店舗別', '【自動更新】店舗ごとの回答率'],
      ['   外国人リスト', '【自動更新】氏名がカタカナのみの従業員一覧'],
      ['   除外リスト', '【手動入力】対象外のスタッフを社員Noで登録'],
      ['   進捗確認', '【自動更新】回答者の架電・選考進捗の管理(進捗状況・架電は手入力)'],
      ['', ''],
      ['3. 抽出条件', ''],
      ['   雇用形態', '「パート」または「アルバイト」を含む区分'],
      ['   年齢', '22歳以上'],
      ['   在籍状況', '退職年月日が空欄の人のみ対象'],
      ['   名前', '氏名がカタカナのみの場合は外国籍として自動除外'],
      ['   所属', '従業員リスト「所属No」が店長・営業部長シートC列「店番」と一致する店舗所属者のみ'],
      ['', ''],
      ['4. 実行手順', ''],
      ['   STEP1', 'メニュー「📝 ' + CONFIG.TOOL_TITLE + '」をクリック'],
      ['   STEP2', '「リストを更新する（未提出者抽出）」をクリック'],
      ['   STEP3', '「進捗確認シートを更新」をクリック(回答者の管理表を最新化)'],
      ['   STEP4', '完了後、各シートで結果を確認'],
      ['', ''],
      ['5. 集計結果の共有', ''],
      ['   共有用ファイル出力', 'メニュー「共有用ファイルを出力」で未提出者・回答率シートだけの別ファイルを作成。個人情報を含むシートを見せずに共有したい場合はこのファイルを共有する(シート単位のパスワード保護はスプレッドシートには無いため)']
    ];
    mn.getRange(1, 1, manual.length, 2).setValues(manual);
    mn.getRange('A1').setFontWeight('bold').setFontSize(14);
    mn.setColumnWidth(1, 220);
    mn.setColumnWidth(2, 640);
  }

  // 自動更新系シート
  [CONFIG.SHEET_PROGRESS, CONFIG.SHEET_PENDING, CONFIG.SHEET_RATE_STORE, CONFIG.SHEET_RATE_DIVISION, CONFIG.SHEET_FOREIGN]
    .forEach(function (name) { getOrCreateSheet_(ss, name); });

  ss.toast('セットアップが完了しました。「従業員リスト」と「店長・営業部長」にマスターデータを貼り付けてください。', '初期セットアップ', 10);
}

// ========================= ユーティリティ =========================

function mustGetSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('シート「' + name + '」が見つかりません。メニューの「初期セットアップ」を実行し、マスターデータを貼り付けてください。');
  return sheet;
}

function getOrCreateSheet_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

/** ヘッダー行から候補名に一致(前方一致)する列番号を探す */
function findColumns_(headerRow, spec) {
  var result = {};
  Object.keys(spec).forEach(function (key) {
    var idx = -1;
    for (var c = 0; c < headerRow.length && idx === -1; c++) {
      var h = String(headerRow[c] || '').replace(/\s+/g, '');
      for (var i = 0; i < spec[key].length; i++) {
        var cand = spec[key][i].replace(/\s+/g, '');
        if (h === cand || h.indexOf(cand) === 0) { idx = c; break; }
      }
    }
    if (idx === -1) throw new Error('列「' + spec[key][0] + '」が見つかりません。ヘッダー行を確認してください。');
    result[key] = idx;
  });
  return result;
}

function findFormColumn_(header, candidates) {
  var idx = findFormColumnOptional_(header, candidates);
  if (idx === null) throw new Error('フォームの回答に列「' + candidates[0] + '」が見つかりません。');
  return idx;
}

function findFormColumnOptional_(header, candidates) {
  for (var i = 0; i < candidates.length; i++) {
    var cand = candidates[i].replace(/\s+/g, '');
    for (var c = 0; c < header.length; c++) {
      var h = String(header[c] || '').replace(/\s+/g, '');
      if (h === cand || h.indexOf(cand) === 0) return c;
    }
  }
  return null;
}

/** 社員番号を6桁ゼロ埋め文字列に正規化('27832'/27832/'027832' → '027832') */
function normalizeEmployeeNo_(v) {
  if (v == null || v === '') return '';
  var digits = String(v).replace(/[^0-9]/g, '');
  if (!digits) return '';
  digits = digits.replace(/^0+/, '') || '0';
  while (digits.length < 6) digits = '0' + digits;
  return digits;
}

/** 店番・所属Noを正規化('0004'/4/'126'/126.0 → '4'/'126')。ゼロ埋め差を吸収して照合する */
function normalizeStoreNo_(v) {
  if (v == null || v === '') return '';
  var digits = String(v).replace(/\.0+$/, '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  return String(Number(digits)); // 先頭ゼロを除去
}

/** 電話番号からハイフン・空白等を除去 */
function normalizePhone_(v) {
  if (v == null || v === '') return '';
  return String(v).replace(/[^0-9]/g, '');
}

/** 氏名がカタカナ(全角・半角)/中点/長音/空白のみか */
function isKatakanaOnly_(name) {
  if (!name) return false;
  return /^[ァ-ヶーｦ-ﾟ・･\s　]+$/.test(name);
}

function percent_(num, denom) {
  if (!denom) return '0.0%';
  return (Math.round(num / denom * 1000) / 10).toFixed(1) + '%';
}

function formatDate_(d) {
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy年MM月dd日 HH:mm');
}
