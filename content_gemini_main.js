// MAIN world で動作するスクリプト
// 役割: Quill インスタンスへのアクセスのみ（chrome.runtime は使えない）
// isolated world の content_gemini.js と window.postMessage で通信する

window.addEventListener('message', (e) => {
  if (e.source !== window || e.data?.type !== 'scout_insert_text') return;

  (async () => {
    const qlContainer = document.querySelector('.ql-container');
    const quill = qlContainer?.__quill;
    const el = document.querySelector('rich-textarea .ql-editor');

    if (!quill || !el) {
      window.postMessage({ type: 'scout_text_inserted', success: false }, '*');
      return;
    }

    // ① Quill に全文をセット（改行含む全行が正確に入る）
    quill.setText(e.data.text);
    await new Promise(r => setTimeout(r, 200));

    // ② カーソルを末尾へ移動
    quill.setSelection(quill.getLength(), 0);

    // ③ ダミー文字を入力してAngularの変更検知を起動 → 即削除
    document.execCommand('insertText', false, 'X');
    await new Promise(r => setTimeout(r, 100));
    document.execCommand('delete', false, null);

    window.postMessage({ type: 'scout_text_inserted', success: true }, '*');
  })();
});
