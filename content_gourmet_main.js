// MAIN world で動作するスクリプト（グルメキャリー管理画面用）
// isolated world から postMessage を受け取り、フレームワーク管理のフォームに値をセットする
// （React/Vue等のSPAでも内部stateが正しく更新されるようネイティブsetterを使用）

window.addEventListener('message', (e) => {
  if (e.source !== window) return;

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
