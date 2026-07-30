// 拡張機能アイコンのポップアップ
// どのタブを見ていても（Geminiタブからでも）自動スカウトを停止できるようにする

const statusEl = document.getElementById('batchStatus');
const stopBtn = document.getElementById('popupStopBtn');

function countResults(log) {
  const counts = { sent: 0, ready: 0, skip: 0, error: 0 };
  (log || []).forEach(e => { if (counts[e.result] !== undefined) counts[e.result]++; });
  return counts;
}

// 本日の送信数(バッチをやり直しても消えない累計)
function getTodayCount(cb) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  chrome.storage.local.get(['scoutCount', 'scoutCountDate'], (d) => {
    cb(d.scoutCountDate === today ? (d.scoutCount || 0) : 0);
  });
}

function refresh() {
  chrome.storage.local.get(['autoBatch'], (d) => {
    const b = d.autoBatch;
    getTodayCount((today) => {
      const todayLine = `本日の送信 <b>${today}</b>件`;
      if (b && b.active) {
        const c = countResults(b.log);
        const main = b.dryRun ? `準備OK ${c.ready}件` : `送信 ${c.sent}件`;
        statusEl.className = 'status running';
        statusEl.innerHTML =
          `<b>自動スカウト稼働中${b.dryRun ? '（ドライラン）' : ''}</b><br>` +
          `今回 ${main} ／ 処理済み ${(b.log || []).length}件<br>${todayLine}`;
        stopBtn.style.display = 'block';
      } else {
        statusEl.className = 'status idle';
        statusEl.innerHTML = `自動スカウトは動いていません<br>${todayLine}`;
        stopBtn.style.display = 'none';
      }
    });
  });
}

stopBtn.addEventListener('click', () => {
  chrome.storage.local.get(['autoBatch'], (d) => {
    const b = d.autoBatch;
    if (!b) return;
    b.stopped = true;
    b.active = false;
    // レポートも保存しておき、一覧ページの「報」ボタンで確認できるようにする
    chrome.storage.local.set({ autoBatch: b, autoLastReport: b }, () => {
      statusEl.className = 'status idle';
      statusEl.innerHTML =
        '<b>停止しました</b><br>結果は検索一覧ページの「報」ボタンで確認できます';
      stopBtn.style.display = 'none';
    });
  });
});

refresh();
