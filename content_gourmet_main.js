// MAIN world で動作するスクリプト（グルメキャリー管理画面用）
// isolated world から postMessage を受け取り、フレームワーク管理のフォームに値をセットする
// （React/Vue等のSPAでも内部stateが正しく更新されるようネイティブsetterを使用）

// ページ送りの一時的なアラート抑止用
let scoutAlertRestore = null;
let scoutAlertTimer = null;

window.addEventListener('message', (e) => {
  if (e.source !== window) return;

  // ── ページ送りの間だけ alert を止める ──
  // このサイトの「次へ」は検索フォームを再送信する作りで、条件が欠けていると
  // alert が出て処理全体が固まる。抑止して「進めなかった」と検知できるようにする
  if (e.data?.type === 'scout_suppress_alert') {
    const ms = Math.min(30000, Math.max(1000, e.data.ms || 8000));
    if (!scoutAlertRestore) {
      const orig = window.alert;
      window.alert = function (msg) {
        window.postMessage({ type: 'scout_alert_suppressed', message: String(msg == null ? '' : msg) }, '*');
      };
      scoutAlertRestore = () => { window.alert = orig; scoutAlertRestore = null; };
    }
    clearTimeout(scoutAlertTimer);
    scoutAlertTimer = setTimeout(() => { if (scoutAlertRestore) scoutAlertRestore(); }, ms);
    // 有効になったことを伝える(これを待ってからクリックさせる)
    window.postMessage({ type: 'scout_alert_suppress_ready' }, '*');
    return;
  }

  // ── 抑止をすぐ解除する ──
  if (e.data?.type === 'scout_restore_alert') {
    clearTimeout(scoutAlertTimer);
    if (scoutAlertRestore) scoutAlertRestore();
    return;
  }

  // ── input / textarea に値をセット ──
  if (e.data?.type === 'scout_set_field') {
    const { selector, value } = e.data;
    const el = document.querySelector(selector);
    if (!el) {
      window.postMessage({ type: 'scout_field_set', success: false, selector }, '*');
      return;
    }

    // フレームワークの内部 setter を呼んで state を更新
    const proto = el.tagName === 'TEXTAREA'
      ? window.HTMLTextAreaElement.prototype
      : window.HTMLInputElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;

    if (nativeSetter) {
      nativeSetter.call(el, value);
    } else {
      el.value = value;
    }

    // 変更検知イベントを発火（文字数カウンタ等も更新させる）
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('keyup', { bubbles: true }));
    el.dispatchEvent(new Event('blur', { bubbles: true }));

    window.postMessage({ type: 'scout_field_set', success: true, selector }, '*');
  }
});
