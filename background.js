// タブ間の通信を仲介するサービスワーカー
// グルメキャリー管理画面 ⇄ Gemini の橋渡し

let pendingRequest = null;
let promptSent = false;

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
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== 'complete') return;
  if (!pendingRequest || promptSent) return;
  if (!tab.url?.includes('gemini.google.com')) return;

  setTimeout(() => {
    if (!pendingRequest || promptSent) return;
    promptSent = true;
    sendFillPrompt(tabId);
  }, 2500);
});

// ── Geminiタブを開く or 再利用する ────────────────────────
function openOrReuseGemini() {
  chrome.tabs.query({ url: 'https://gemini.google.com/*' }, (tabs) => {
    if (chrome.runtime.lastError) {
      console.error('タブ検索失敗:', chrome.runtime.lastError.message);
      createNewGeminiTab();
      return;
    }

    if (tabs && tabs.length > 0) {
      const existingTab = tabs[0];
      console.log('既存Geminiタブを再利用:', existingTab.id);
      chrome.tabs.update(existingTab.id, {
        url: 'https://gemini.google.com/app',
        active: true
      }, () => {
        if (chrome.runtime.lastError) {
          console.error('タブ更新失敗:', chrome.runtime.lastError.message);
          createNewGeminiTab();
        }
      });
    } else {
      console.log('Geminiタブが無いため新規作成');
      createNewGeminiTab();
    }
  });
}

function createNewGeminiTab() {
  chrome.tabs.create({ url: 'https://gemini.google.com/app' }, (tab) => {
    if (chrome.runtime.lastError) {
      console.error('Geminiタブ作成失敗:', chrome.runtime.lastError.message);
      if (pendingRequest) {
        sendToGourmet(pendingRequest.sourceTabId, {
          action: 'showError',
          error: 'Geminiタブを開けませんでした: ' + chrome.runtime.lastError.message
        });
        pendingRequest = null;
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
    pendingRequest = { sourceTabId: sender.tab.id, prompt: message.prompt };
    promptSent = false;
    openOrReuseGemini();
    sendResponse({ status: 'ok' });
    return true;
  }

  // ─── Gemini content scriptのロード完了通知 ───
  if (message.action === 'geminiReady') {
    console.log('geminiReady受信, tabId:', sender.tab.id);
    if (pendingRequest && !promptSent) {
      promptSent = true;
      sendFillPrompt(sender.tab.id);
    }
    return true;
  }

  // ─── Geminiからの回答受信 ───
  if (message.action === 'geminiResponse') {
    if (pendingRequest) {
      const { sourceTabId } = pendingRequest;
      pendingRequest = null;
      sendToGourmet(sourceTabId, {
        action: 'showResult',
        subject: message.subject,
        body: message.body,
        rawText: message.rawText
      });
      chrome.tabs.update(sourceTabId, { active: true });
    }
    return true;
  }

  // ─── Geminiエラー ───
  if (message.action === 'geminiError') {
    if (pendingRequest) {
      const { sourceTabId } = pendingRequest;
      pendingRequest = null;
      sendToGourmet(sourceTabId, { action: 'showError', error: message.error });
    }
    return true;
  }

  // ─── 進捗通知の中継 ───
  if (message.action === 'geminiProgress') {
    if (pendingRequest) sendToGourmet(pendingRequest.sourceTabId, message);
    return true;
  }
});
