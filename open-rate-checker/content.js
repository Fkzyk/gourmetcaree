// ============================================================
// スカウトメール開封率チェッカー - グルメキャリー
// ------------------------------------------------------------
// スカウトメール一覧ページ（メールBOX > スカウトメール > 送信）に
// 「📊 開封率チェッカー」ボタンを表示。クリックすると全ページ
// (/shop-pc/scoutMail/list/changePage/N) を自動で巡回取得し、
// 開封状況を多角的に分析するダッシュボードを表示する。
//
//  分析内容:
//   - 全体の送信数／開封数／開封率
//   - 期間フィルタ（送信日で絞り込み、プリセットあり）
//   - 開封が多い時間帯・曜日（いつ読まれているか）
//   - 送信時間帯別・送信曜日別の開封率（いつ送ると読まれやすいか）
//   - 送信から開封までの経過時間（平均・中央値・分布）
//   - 件名別・送信日別の開封率
//   - 自動インサイト（おすすめ送信時間などの気づきを文章で提示）
//   - 明細のTSVコピー / CSVダウンロード（Excel・スプレッドシート用）
//
//  注意:
//   - 「送信」タブを表示した状態で実行すること（タブ状態はサーバー側の
//     セッションで保持されるため、fetchでも同じタブの内容が返る）
//   - サイトのHTML構造に依存しすぎないよう、行の判定は
//     「既読／未読」テキストと日付パターンのヒューリスティックで行う
// ============================================================

(() => {
  'use strict';

  if (window.__gcOpenRateCheckerLoaded) return;
  window.__gcOpenRateCheckerLoaded = true;

  // メールBOXの一覧ページ以外では何もしない
  // （スカウトメール /scoutMail/list のほか、応募メール等の各タブも
  //   URLが「〜Mail/list」の形なら同じ仕組みで集計できる）
  if (!/Mail\/list/.test(location.pathname)) return;

  // ── 設定 ──────────────────────────────────────────────
  const MAX_PAGES = 300;        // 暴走防止の上限ページ数
  const FETCH_DELAY_MS = 300;   // サーバー負荷軽減のためのページ間ウェイト
  // いま表示中のタブ（スカウト/応募など）の一覧をそのまま巡回する
  const LIST_BASE = location.pathname.replace(/\/changePage\/\d+.*$/, '');
  const PAGE_URL = (n) => `${location.origin}${LIST_BASE}/changePage/${n}`;
  const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

  // ============================================================
  // 1. データ取得（ページ巡回 + 行抽出）
  // ============================================================

  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

  // 開封日時: 「2026/07/09 14:35」形式（4桁年あり）
  const OPENED_RE = /^(\d{4})\/(\d{1,2})\/(\d{1,2})(?:\s+(\d{1,2}):(\d{2}))?$/;
  // 送信日時: 「07/09 14:23」形式（年なし）
  const SENT_RE = /^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{2})$/;

  // 1ページ分のHTMLから行データを抽出
  function parseRows(doc) {
    const rows = [];
    for (const tr of doc.querySelectorAll('table tr')) {
      // 入れ子テーブルの外側行を除外（二重カウント防止）
      if (tr.querySelector('table')) continue;

      const cells = Array.from(tr.querySelectorAll('th, td'));
      if (!cells.length) continue;

      // 状態セル: テキストが「既読」または「未読」だけのセル
      const statusCell = cells.find((c) => {
        const t = norm(c.textContent);
        return t === '既読' || t === '未読';
      });
      if (!statusCell) continue;

      const row = {
        status: norm(statusCell.textContent),
        openedRaw: '',
        sentRaw: '',
        subject: '',
        dest: '',
      };

      let longest = '';
      for (const c of cells) {
        if (c === statusCell) continue;
        const t = norm(c.textContent);
        if (!t) continue;
        if (OPENED_RE.test(t)) { row.openedRaw = t; continue; }
        if (SENT_RE.test(t))   { row.sentRaw = t; continue; }
        if (/^\d+$/.test(t))   { row.dest = t; continue; }
        if (t.length > longest.length) longest = t; // 残りの最長テキスト＝件名とみなす
      }
      row.subject = longest;
      rows.push(row);
    }
    return rows;
  }

  // ページ内から最大ページ番号を検出（href / onclick / HTML全体の順）
  function maxPageIn(doc) {
    let max = 1;
    const scan = (s) => {
      if (!s) return;
      for (const m of s.matchAll(/changePage\/(\d+)/g)) {
        max = Math.max(max, parseInt(m[1], 10));
      }
    };
    doc.querySelectorAll('a').forEach((a) => {
      scan(a.getAttribute('href'));
      scan(a.getAttribute('onclick'));
    });
    if (max === 1) scan(doc.documentElement.innerHTML);
    return max;
  }

  async function fetchPage(n) {
    const res = await fetch(PAGE_URL(n), { credentials: 'same-origin' });
    if (!res.ok) throw new Error(`ページ${n}の取得に失敗しました (HTTP ${res.status})`);
    const html = await res.text();
    return new DOMParser().parseFromString(html, 'text/html');
  }

  async function collectAll(onProgress) {
    const currentPageMatch = location.pathname.match(/changePage\/(\d+)/);
    const currentPage = currentPageMatch ? parseInt(currentPageMatch[1], 10) : 1;

    let knownMax = maxPageIn(document);
    const allRows = [];
    let fetched = 0;

    for (let n = 1; n <= knownMax && n <= MAX_PAGES; n++) {
      onProgress(n, Math.min(knownMax, MAX_PAGES));
      let doc;
      if (n === currentPage) {
        doc = document;
      } else {
        if (fetched > 0) await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
        doc = await fetchPage(n);
        fetched++;
      }
      allRows.push(...parseRows(doc));
      knownMax = Math.max(knownMax, maxPageIn(doc)); // ページ送りが10件区切りでも追従
    }
    return { rows: allRows.map(enrich), pages: Math.min(knownMax, MAX_PAGES) };
  }

  // ============================================================
  // 2. 日時の解釈（送信日時には年がないため推定する）
  // ============================================================

  function parseOpened(s) {
    const m = (s || '').match(OPENED_RE);
    if (!m) return null;
    return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0));
  }

  // 送信日時「07/09 14:23」の年を推定:
  //  - 開封日時がある行: 送信は開封以前のはずなので、開封と同年で
  //    未来になる場合のみ前年とみなす
  //  - ない行: 現在時刻を基準に同じ推定を行う
  function parseSent(s, openedDate) {
    const m = (s || '').match(SENT_RE);
    if (!m) return null;
    const [, MM, DD, hh, mm] = m.map(Number);
    const anchor = openedDate || new Date();
    let year = anchor.getFullYear();
    let d = new Date(year, MM - 1, DD, hh, mm);
    if (d > anchor) d = new Date(year - 1, MM - 1, DD, hh, mm);
    return d;
  }

  function enrich(row) {
    const openedDate = parseOpened(row.openedRaw);
    const sentDate = parseSent(row.sentRaw, openedDate);
    let elapsedMin = null;
    if (openedDate && sentDate) {
      const diff = Math.round((openedDate - sentDate) / 60000);
      if (diff >= 0) elapsedMin = diff;
    }
    return { ...row, openedDate, sentDate, elapsedMin };
  }

  // ============================================================
  // 3. 集計
  // ============================================================

  const pct = (a, b) => (b ? ((a / b) * 100).toFixed(1) + '%' : '-');
  const isOpened = (r) => r.status === '既読';

  function median(nums) {
    if (!nums.length) return null;
    const s = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
  }

  function fmtDuration(min) {
    if (min == null) return '-';
    if (min < 60) return `${min}分`;
    if (min < 1440) {
      const h = Math.floor(min / 60);
      const m = min % 60;
      return m ? `${h}時間${m}分` : `${h}時間`;
    }
    const d = Math.floor(min / 1440);
    const h = Math.floor((min % 1440) / 60);
    return h ? `${d}日${h}時間` : `${d}日`;
  }

  const fmtDate = (d) =>
    d ? `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}` : '';
  const fmtDateTime = (d) =>
    d ? `${fmtDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : '';

  // 経過時間の分布バケット
  const ELAPSED_BUCKETS = [
    { label: '30分以内', max: 30 },
    { label: '30分〜1時間', max: 60 },
    { label: '1〜3時間', max: 180 },
    { label: '3〜6時間', max: 360 },
    { label: '6〜12時間', max: 720 },
    { label: '12〜24時間', max: 1440 },
    { label: '1〜3日', max: 4320 },
    { label: '3日以上', max: Infinity },
  ];

  function computeStats(rows, now) {
    const total = rows.length;
    const opened = rows.filter(isOpened).length;

    // ── 開封の時間帯・曜日分布（いつ読まれているか）──
    const openedByHour = Array.from({ length: 24 }, () => 0);
    const openedByWeekday = Array.from({ length: 7 }, () => 0);
    for (const r of rows) {
      if (r.openedDate) {
        openedByHour[r.openedDate.getHours()]++;
        openedByWeekday[r.openedDate.getDay()]++;
      }
    }

    // ── 送信時間帯・曜日ごとの開封率（いつ送ると読まれやすいか）──
    const sentByHour = Array.from({ length: 24 }, () => ({ total: 0, opened: 0 }));
    const sentByWeekday = Array.from({ length: 7 }, () => ({ total: 0, opened: 0 }));
    for (const r of rows) {
      if (r.sentDate) {
        const g1 = sentByHour[r.sentDate.getHours()];
        const g2 = sentByWeekday[r.sentDate.getDay()];
        g1.total++; g2.total++;
        if (isOpened(r)) { g1.opened++; g2.opened++; }
      }
    }

    // ── 送信→開封の経過時間 ──
    const elapsedList = rows.map((r) => r.elapsedMin).filter((v) => v != null);
    const elapsedAvg = elapsedList.length
      ? Math.round(elapsedList.reduce((a, b) => a + b, 0) / elapsedList.length)
      : null;
    const elapsedMedian = median(elapsedList);
    const elapsedDist = ELAPSED_BUCKETS.map((b) => ({ label: b.label, count: 0 }));
    for (const v of elapsedList) {
      const i = ELAPSED_BUCKETS.findIndex((b) => v < b.max);
      elapsedDist[i === -1 ? elapsedDist.length - 1 : i].count++;
    }
    const within1h = elapsedList.filter((v) => v <= 60).length;
    const within24h = elapsedList.filter((v) => v <= 1440).length;

    // ── 件名別・送信日別 ──
    const groupBy = (keyFn) => {
      const map = new Map();
      for (const r of rows) {
        const k = keyFn(r) || '(不明)';
        if (!map.has(k)) map.set(k, { total: 0, opened: 0 });
        const g = map.get(k);
        g.total++;
        if (isOpened(r)) g.opened++;
      }
      return map;
    };
    const bySubject = [...groupBy((r) => r.subject).entries()]
      .sort((a, b) => b[1].total - a[1].total);
    const byDate = [...groupBy((r) => fmtDate(r.sentDate)).entries()]
      .sort((a, b) => b[0].localeCompare(a[0]));

    // ── 3日以上未読のまま（追いスカウト候補）──
    const staleUnread = rows.filter(
      (r) => !isOpened(r) && r.sentDate && (now - r.sentDate) / 60000 >= 4320
    ).length;

    return {
      total, opened, unread: total - opened,
      openedByHour, openedByWeekday, sentByHour, sentByWeekday,
      elapsedCount: elapsedList.length, elapsedAvg, elapsedMedian, elapsedDist,
      within1h, within24h,
      bySubject, byDate, staleUnread,
    };
  }

  // ── 自動インサイト生成 ──
  function buildInsights(st) {
    const out = [];
    if (!st.total) return out;

    // 開封が集中する時間帯
    const peakHour = st.openedByHour.indexOf(Math.max(...st.openedByHour));
    if (st.openedByHour[peakHour] > 0) {
      out.push(`👀 開封が最も多いのは <b>${peakHour}時台</b>（${st.openedByHour[peakHour]}件）。この時間の少し前に送ると読まれやすい可能性があります。`);
    }

    // 開封が集中する曜日
    const peakWd = st.openedByWeekday.indexOf(Math.max(...st.openedByWeekday));
    if (st.openedByWeekday[peakWd] > 0) {
      out.push(`📅 開封が最も多い曜日は <b>${WEEKDAYS[peakWd]}曜日</b>（${st.openedByWeekday[peakWd]}件）です。`);
    }

    // 開封率が高い送信時間帯（サンプル5件以上）
    const hourCands = st.sentByHour
      .map((g, h) => ({ h, ...g, rate: g.total ? g.opened / g.total : 0 }))
      .filter((g) => g.total >= 5);
    if (hourCands.length >= 2) {
      const best = hourCands.reduce((a, b) => (b.rate > a.rate ? b : a));
      const worst = hourCands.reduce((a, b) => (b.rate < a.rate ? b : a));
      out.push(`🎯 <b>${best.h}時台</b>に送信したメールの開封率が最も高く <b>${pct(best.opened, best.total)}</b>（${best.total}件中${best.opened}件）。` +
        (worst.h !== best.h ? ` 逆に${worst.h}時台は${pct(worst.opened, worst.total)}と低めです。` : ''));
    }

    // 開封率が高い送信曜日（サンプル5件以上）
    const wdCands = st.sentByWeekday
      .map((g, w) => ({ w, ...g, rate: g.total ? g.opened / g.total : 0 }))
      .filter((g) => g.total >= 5);
    if (wdCands.length >= 2) {
      const best = wdCands.reduce((a, b) => (b.rate > a.rate ? b : a));
      out.push(`📆 送信曜日別では <b>${WEEKDAYS[best.w]}曜日</b>の開封率が最も高く <b>${pct(best.opened, best.total)}</b> です。`);
    }

    // 開封スピード
    if (st.elapsedCount) {
      out.push(`⏱ 開封までの時間は 中央値 <b>${fmtDuration(st.elapsedMedian)}</b>／平均 ${fmtDuration(st.elapsedAvg)}。` +
        ` 開封されたメールの ${pct(st.within24h, st.elapsedCount)} は24時間以内、${pct(st.within1h, st.elapsedCount)} は1時間以内に読まれています。`);
      if (st.within24h / st.elapsedCount > 0.7) {
        out.push(`💡 開封の大半が24時間以内に発生 → <b>送信翌日になっても未読なら、その後開封される確率は低め</b>です。別の候補者への送付や件名の見直しを検討してください。`);
      }
    }

    // 件名の比較（2種類以上・各5件以上）
    const subjCands = st.bySubject.filter(([, g]) => g.total >= 5);
    if (subjCands.length >= 2) {
      const best = subjCands.reduce((a, b) => (b[1].opened / b[1].total > a[1].opened / a[1].total ? b : a));
      const short = best[0].length > 30 ? best[0].slice(0, 30) + '…' : best[0];
      out.push(`✉️ 開封率が最も高い件名は「<b>${esc(short)}</b>」（${pct(best[1].opened, best[1].total)}・${best[1].total}件送信）。件名A/Bテストの参考にどうぞ。`);
    }

    // 追いスカウト候補
    if (st.staleUnread > 0) {
      out.push(`🔁 送信から3日以上経っても未読のメールが <b>${st.staleUnread}件</b> あります。件名を変えた再アプローチの検討対象です。`);
    }

    return out;
  }

  // ============================================================
  // 4. エクスポート
  // ============================================================

  function toTsv(rows) {
    const header = ['状態', '送信日時', '開封日時', '開封までの時間(分)', '件名', '宛先'].join('\t');
    const lines = rows.map((r) =>
      [
        r.status,
        r.sentDate ? fmtDateTime(r.sentDate) : r.sentRaw,
        r.openedDate ? fmtDateTime(r.openedDate) : '',
        r.elapsedMin != null ? r.elapsedMin : '',
        r.subject,
        r.dest,
      ].join('\t')
    );
    return [header, ...lines].join('\n');
  }

  function downloadCsv(rows) {
    const csv = toTsv(rows)
      .split('\n')
      .map((line) => line.split('\t').map((c) => `"${c.replace(/"/g, '""')}"`).join(','))
      .join('\r\n');
    // Excelで文字化けしないようBOM付きUTF-8
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const now = new Date();
    a.download = `scoutmail_openrate_${fmtDate(now).replace(/\//g, '')}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  // ============================================================
  // 5. UI
  // ============================================================

  function esc(s) {
    return (s || '').replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // 縦棒グラフ（外部ライブラリなし・divの高さで表現）
  // items: [{label, value, sub(ツールチップ), dim(薄く表示)}]
  function barChart(items, { unit = '件', showEvery = 1 } = {}) {
    const max = Math.max(...items.map((i) => i.value), 1);
    const bars = items
      .map((it, idx) => {
        const h = Math.round((it.value / max) * 100);
        const label = idx % showEvery === 0 ? esc(it.label) : '';
        const title = esc(`${it.label}: ${it.sub != null ? it.sub : it.value + unit}`);
        return `<div class="orc-bar-col" title="${title}">
            <div class="orc-bar-val">${it.value > 0 && h >= 25 ? (it.dispVal != null ? it.dispVal : it.value) : ''}</div>
            <div class="orc-bar ${it.dim ? 'orc-bar-dim' : ''}" style="height:${Math.max(h, it.value > 0 ? 3 : 0)}%"></div>
            <div class="orc-bar-label">${label}</div>
          </div>`;
      })
      .join('');
    return `<div class="orc-chart">${bars}</div>`;
  }

  // 横棒（分布）
  function distChart(items) {
    const max = Math.max(...items.map((i) => i.count), 1);
    return items
      .map((it) => `<div class="orc-dist-row">
          <div class="orc-dist-label">${esc(it.label)}</div>
          <div class="orc-dist-track"><div class="orc-dist-fill" style="width:${Math.round((it.count / max) * 100)}%"></div></div>
          <div class="orc-dist-count">${it.count}件</div>
        </div>`)
      .join('');
  }

  // ── DOM構築 ──
  const launchBtn = document.createElement('button');
  launchBtn.id = 'orc-launch';
  launchBtn.textContent = '📊 開封率チェッカー';
  document.documentElement.appendChild(launchBtn);

  const overlay = document.createElement('div');
  overlay.id = 'orc-overlay';
  overlay.style.display = 'none';
  overlay.innerHTML = `
    <div id="orc-modal">
      <div class="orc-head">
        <span class="orc-title">📊 スカウトメール開封率チェッカー</span>
        <span class="orc-head-btns">
          <button id="orc-refresh" title="データを取り直す">🔄 再取得</button>
          <button id="orc-close" title="閉じる">✕</button>
        </span>
      </div>
      <div id="orc-filter"></div>
      <div id="orc-body"></div>
    </div>`;
  document.documentElement.appendChild(overlay);

  const modalBody = overlay.querySelector('#orc-body');
  const filterBox = overlay.querySelector('#orc-filter');

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.style.display = 'none';
  });
  overlay.querySelector('#orc-close').addEventListener('click', () => {
    overlay.style.display = 'none';
  });

  // ── 状態 ──
  let cache = null;     // { rows, pages }
  let loading = false;
  let filterFrom = '';  // 'YYYY-MM-DD'
  let filterTo = '';

  function applyFilter(rows) {
    if (!filterFrom && !filterTo) return rows;
    const from = filterFrom ? new Date(filterFrom + 'T00:00:00') : null;
    const to = filterTo ? new Date(filterTo + 'T23:59:59') : null;
    return rows.filter((r) => {
      if (!r.sentDate) return false;
      if (from && r.sentDate < from) return false;
      if (to && r.sentDate > to) return false;
      return true;
    });
  }

  function toInputDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function renderFilter() {
    filterBox.innerHTML = `
      <span class="orc-filter-label">期間（送信日）:</span>
      <input type="date" id="orc-from" value="${filterFrom}">
      <span>〜</span>
      <input type="date" id="orc-to" value="${filterTo}">
      <span class="orc-presets">
        <button data-days="all">全期間</button>
        <button data-days="7">過去7日</button>
        <button data-days="30">過去30日</button>
        <button data-days="month">今月</button>
      </span>`;

    filterBox.querySelector('#orc-from').addEventListener('change', (e) => {
      filterFrom = e.target.value; renderBody();
    });
    filterBox.querySelector('#orc-to').addEventListener('change', (e) => {
      filterTo = e.target.value; renderBody();
    });
    filterBox.querySelectorAll('.orc-presets button').forEach((b) => {
      b.addEventListener('click', () => {
        const now = new Date();
        const v = b.dataset.days;
        if (v === 'all') { filterFrom = ''; filterTo = ''; }
        else if (v === 'month') {
          filterFrom = toInputDate(new Date(now.getFullYear(), now.getMonth(), 1));
          filterTo = toInputDate(now);
        } else {
          const from = new Date(now);
          from.setDate(from.getDate() - (parseInt(v, 10) - 1));
          filterFrom = toInputDate(from);
          filterTo = toInputDate(now);
        }
        renderFilter();
        renderBody();
      });
    });
  }

  function renderBody() {
    if (!cache) return;
    const rows = applyFilter(cache.rows);
    const st = computeStats(rows, new Date());
    const insights = buildInsights(st);

    if (!rows.length) {
      modalBody.innerHTML = `<div class="orc-empty">該当期間にメールがありません。期間を変更してください。</div>`;
      return;
    }

    const subjectRows = st.bySubject
      .map(([subj, g]) => {
        const short = subj.length > 48 ? subj.slice(0, 48) + '…' : subj;
        return `<tr><td title="${esc(subj)}">${esc(short)}</td>
          <td>${g.total}</td><td>${g.opened}</td><td>${pct(g.opened, g.total)}</td></tr>`;
      })
      .join('');

    const dateRows = st.byDate
      .map(([d, g]) =>
        `<tr><td>${esc(d)}</td><td>${g.total}</td><td>${g.opened}</td><td>${pct(g.opened, g.total)}</td></tr>`)
      .join('');

    modalBody.innerHTML = `
      <div class="orc-cards">
        <div class="orc-card"><div class="orc-card-num">${st.total}</div><div class="orc-card-label">送信数</div></div>
        <div class="orc-card"><div class="orc-card-num">${st.opened}</div><div class="orc-card-label">開封数（既読）</div></div>
        <div class="orc-card orc-card-main"><div class="orc-card-num">${pct(st.opened, st.total)}</div><div class="orc-card-label">開封率</div></div>
        <div class="orc-card"><div class="orc-card-num">${fmtDuration(st.elapsedMedian)}</div><div class="orc-card-label">開封までの時間（中央値）</div></div>
      </div>

      ${insights.length ? `<div class="orc-insights"><div class="orc-section">💡 インサイト</div>
        <ul>${insights.map((i) => `<li>${i}</li>`).join('')}</ul></div>` : ''}

      <div class="orc-grid">
        <div>
          <div class="orc-section">開封が多い時間帯（開封日時ベース）</div>
          ${barChart(st.openedByHour.map((v, h) => ({ label: `${h}`, value: v, sub: `${v}件` })), { showEvery: 3 })}
          <div class="orc-axis-note">横軸: 時刻（0〜23時）</div>
        </div>
        <div>
          <div class="orc-section">開封が多い曜日</div>
          ${barChart(st.openedByWeekday.map((v, w) => ({ label: WEEKDAYS[w], value: v, sub: `${v}件` })))}
        </div>
        <div>
          <div class="orc-section">送信時間帯別の開封率</div>
          ${barChart(
            st.sentByHour.map((g, h) => ({
              label: `${h}`,
              value: g.total ? Math.round((g.opened / g.total) * 100) : 0,
              dispVal: g.total ? Math.round((g.opened / g.total) * 100) + '%' : '',
              sub: g.total ? `開封率${pct(g.opened, g.total)}（${g.total}件送信）` : '送信なし',
              dim: g.total < 3,
            })),
            { unit: '%', showEvery: 3 }
          )}
          <div class="orc-axis-note">横軸: 送信時刻。薄い棒は送信3件未満（参考値）</div>
        </div>
        <div>
          <div class="orc-section">送信曜日別の開封率</div>
          ${barChart(
            st.sentByWeekday.map((g, w) => ({
              label: WEEKDAYS[w],
              value: g.total ? Math.round((g.opened / g.total) * 100) : 0,
              dispVal: g.total ? Math.round((g.opened / g.total) * 100) + '%' : '',
              sub: g.total ? `開封率${pct(g.opened, g.total)}（${g.total}件送信）` : '送信なし',
              dim: g.total < 3,
            })),
            { unit: '%' }
          )}
          <div class="orc-axis-note">薄い棒は送信3件未満（参考値）</div>
        </div>
      </div>

      <div class="orc-section">送信から開封までの経過時間の分布
        <span class="orc-section-sub">（平均 ${fmtDuration(st.elapsedAvg)}／中央値 ${fmtDuration(st.elapsedMedian)}・対象${st.elapsedCount}件）</span>
      </div>
      <div class="orc-dist">${distChart(st.elapsedDist)}</div>

      <div class="orc-section">件名別の開封率</div>
      <table class="orc-table">
        <tr><th>件名</th><th>送信</th><th>既読</th><th>開封率</th></tr>
        ${subjectRows}
      </table>

      <div class="orc-section">送信日別の開封率</div>
      <table class="orc-table">
        <tr><th>送信日</th><th>送信</th><th>既読</th><th>開封率</th></tr>
        ${dateRows}
      </table>

      <div class="orc-note">※「送信」タブを表示した状態で実行してください（受信タブのままだと受信メールを数えます）。<br>
      ※送信日時に年の表示がないため、年は開封日時・現在日時から推定しています。集計 ${cache.pages}ページ・${cache.rows.length}件中 ${rows.length}件を表示。</div>

      <div class="orc-export">
        <button id="orc-copy">📋 明細をコピー（Excel貼り付け用）</button>
        <button id="orc-csv">⬇ CSVダウンロード</button>
      </div>`;

    modalBody.querySelector('#orc-copy').addEventListener('click', async (e) => {
      try {
        await navigator.clipboard.writeText(toTsv(rows));
        e.target.textContent = '✓ コピーしました';
      } catch {
        e.target.textContent = 'コピーに失敗しました';
      }
      setTimeout(() => { e.target.textContent = '📋 明細をコピー（Excel貼り付け用）'; }, 2000);
    });
    modalBody.querySelector('#orc-csv').addEventListener('click', () => downloadCsv(rows));
  }

  async function load() {
    if (loading) return;
    loading = true;
    modalBody.innerHTML = `<div class="orc-loading">集計中…</div>`;
    try {
      cache = await collectAll((n, max) => {
        modalBody.innerHTML = `<div class="orc-loading">集計中… ${n}/${max}ページを読み取っています</div>`;
      });
      if (!cache.rows.length) {
        modalBody.innerHTML = `<div class="orc-empty">メールの行が見つかりませんでした。<br>
          スカウトメール一覧（送信タブ）を表示した状態で実行してください。</div>`;
      } else {
        renderFilter();
        renderBody();
      }
    } catch (err) {
      modalBody.innerHTML = `<div class="orc-empty">エラー: ${esc(err.message)}</div>`;
    } finally {
      loading = false;
    }
  }

  overlay.querySelector('#orc-refresh').addEventListener('click', () => {
    cache = null;
    load();
  });

  launchBtn.addEventListener('click', () => {
    overlay.style.display = 'flex';
    if (!cache && !loading) load();
  });
})();
