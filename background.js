// タブ間の通信を仲介するサービスワーカー
// グルメキャリー管理画面 ⇄ Gemini の橋渡し

// 依頼内容はメモリだけに置かない。
// サービスワーカーは無通信が続くと休止し、復帰時にメモリが空になるため、
// 依頼を見失って「Geminiが答えたのに何も起きない」状態になっていた。
// chrome.storage.session に控えを置き、復帰後も続きを処理できるようにする
let pendingRequest = null;
let promptSent = false;

function saveState() {
  try {
    chrome.storage.session.set({ pendingRequest, promptSent });
  } catch (e) { /* 古いChromeではsessionが無い。その場合はメモリのみ */ }
}

async function loadState() {
  if (pendingRequest) return;
  try {
    const d = await chrome.storage.session.get(['pendingRequest', 'promptSent']);
    if (d && d.pendingRequest) {
      pendingRequest = d.pendingRequest;
      promptSent = !!d.promptSent;
    }
  } catch (e) { /* 無視 */ }
}

function clearState() {
  pendingRequest = null;
  promptSent = false;
  try { chrome.storage.session.remove(['pendingRequest', 'promptSent']); } catch (e) { /* 無視 */ }
}

function sendToGourmet(sourceTabId, message) {
  chrome.tabs.sendMessage(sourceTabId, message, () => {
    if (chrome.runtime.lastError) {
      console.warn('グルメキャリーへの送信失敗:', chrome.runtime.lastError.message);
    }
  });
}

function sendFillPrompt(geminiTabId) {
  if (!pendingRequest) return;
  chrome.tabs.sendMessage(geminiTabId, {
    action: 'fillPrompt',
    prompt: pendingRequest.prompt
  }, () => {
    if (chrome.runtime.lastError) {
      console.warn('fillPrompt送信失敗:', chrome.runtime.lastError.message);
    }
  });
}

// ── Geminiタブのロード完了を監視 ──────────────────────────
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!tab.url?.includes('gemini.google.com')) return;
  await loadState(); // 休止から復帰した場合は控えから読み直す
  if (!pendingRequest || promptSent) return;

  setTimeout(() => {
    if (!pendingRequest || promptSent) return;
    promptSent = true;
    saveState();
    sendFillPrompt(tabId);
  }, 2500);
});

// ── Geminiタブを開く or 再利用する ────────────────────────
// グルメキャリーのタブと同じウインドウ内で開く（別ウインドウのGeminiタブは使わない）
function openOrReuseGemini(sourceWindowId) {
  chrome.tabs.query({ url: 'https://gemini.google.com/*', windowId: sourceWindowId }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error('タブ検索失敗:', chrome.runtime.lastError.message);
      createNewGeminiTab(sourceWindowId);
      return;
    }

    if (tabs && tabs.length > 0) {
      const existingTab = tabs[0];
      console.log('同一ウインドウの既存Geminiタブを再利用:', existingTab.id);
      chrome.tabs.update(existingTab.id, {
        url: 'https://gemini.google.com/app',
        active: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('タブ更新失敗:', chrome.runtime.lastError.message);
          createNewGeminiTab(sourceWindowId);
        }
      });
    } else {
      console.log('同一ウインドウにGeminiタブが無いため新規作成');
      createNewGeminiTab(sourceWindowId);
    }
  });
}

function createNewGeminiTab(sourceWindowId) {
  const createProps = { url: 'https://gemini.google.com/app' };
  if (sourceWindowId !== undefined) createProps.windowId = sourceWindowId;
  chrome.tabs.create(createProps, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Geminiタブ作成失敗:', chrome.runtime.lastError.message);
      if (pendingRequest) {
        sendToGourmet(pendingRequest.sourceTabId, {
          action: 'showError',
          error: 'Geminiタブを開けませんでした: ' + chrome.runtime.lastError.message
        });
        clearState();
      }
    } else {
      console.log('Geminiタブ作成成功:', tab.id);
    }
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  // ─── グルメキャリーからの生成リクエスト ───
  if (message.action === 'openGemini') {
    console.log('openGeminiリクエスト受信');
    pendingRequest = { sourceTabId: sender.tab.id, prompt: message.prompt, mode: message.mode };
    promptSent = false;
    saveState();
    openOrReuseGemini(sender.tab.windowId);
    sendResponse({ status: 'ok' });
    return true;
  }

  // ─── Gemini content scriptのロード完了通知 ───
  if (message.action === 'geminiReady') {
    console.log('geminiReady受信, tabId:', sender.tab.id);
    const tabId = sender.tab.id;
    (async () => {
      await loadState();
      if (pendingRequest && !promptSent) {
        promptSent = true;
        saveState();
        sendFillPrompt(tabId);
      }
    })();
    return true;
  }

  // ─── Geminiからの回答受信 ───
  if (message.action === 'geminiResponse') {
    (async () => {
      await loadState();
      if (!pendingRequest) return;
      const { sourceTabId, mode } = pendingRequest;
      clearState();
      sendToGourmet(sourceTabId, {
        action: 'showResult',
        subject: message.subject,
        body: message.body,
        rawText: message.rawText,
        mode: mode
      });
      chrome.tabs.update(sourceTabId, { active: true });
    })();
    return true;
  }

  // ─── Gemini側のエラーからのやり直し ───
  // Geminiのタブが新しいチャットを開き直すので、
  // 読み込み完了を待って同じプロンプトを送り直せるようにする
  if (message.action === 'geminiRetry') {
    console.log('geminiRetry受信:', message.reason);
    (async () => {
      await loadState();
      if (!pendingRequest) return;
      promptSent = false;
      saveState();
      sendToGourmet(pendingRequest.sourceTabId, {
        action: 'geminiProgress',
        text: `⚠️ Gemini側のエラー（${message.reason}）。やり直しています...`
      });
    })();
    return true;
  }

  // ─── Geminiエラー ───
  if (message.action === 'geminiError') {
    (async () => {
      await loadState();
      if (!pendingRequest) return;
      const { sourceTabId, mode } = pendingRequest;
      clearState();
      sendToGourmet(sourceTabId, { action: 'showError', error: message.error, mode: mode });
    })();
    return true;
  }

  // ─── 生存確認(生成中の無通信でサービスワーカーが休止するのを防ぐ) ───
  if (message.action === 'geminiHeartbeat') {
    loadState();
    return true;
  }

  // ─── 進捗通知の中継 ───
  if (message.action === 'geminiProgress') {
    (async () => {
      await loadState();
      if (pendingRequest) sendToGourmet(pendingRequest.sourceTabId, message);
    })();
    return true;
  }
});
