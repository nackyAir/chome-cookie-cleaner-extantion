// popup.js - Origin Auth Reset Popup Script

const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Popup]', ...args);
  }
}

function logError(...args) {
  console.error('[Popup]', ...args);
}

// Service Workerにメッセージを送信
async function sendMessage(message) {
  log('Sending message:', message);
  try {
    const response = await chrome.runtime.sendMessage(message);
    log('Received response:', response);
    return response;
  } catch (error) {
    logError('Failed to send message:', error);
    throw error;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  log('Popup loaded');

  const originUrlElement = document.getElementById('origin-url');
  const clearButton = document.getElementById('clear-btn');
  const statusElement = document.getElementById('status');

  let currentOrigin = null;

  // 現在のタブのオリジンを取得
  async function getCurrentTabOrigin() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        // chrome:// や chrome-extension:// などの特殊なURLは除外
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return url.origin;
        }
      }
    } catch (error) {
      logError('Failed to get current tab:', error);
    }
    return null;
  }

  // ステータスメッセージを表示
  function showStatus(message, type) {
    statusElement.textContent = message;
    statusElement.className = `status ${type}`;

    // 3秒後に非表示
    setTimeout(() => {
      statusElement.className = 'status';
    }, 3000);
  }

  // Service Workerの接続確認
  async function checkServiceWorkerConnection() {
    try {
      const response = await sendMessage({ type: 'PING' });
      if (response && response.success) {
        log('Service Worker connection verified');
        return true;
      }
    } catch (error) {
      logError('Service Worker not responding:', error);
    }
    return false;
  }

  // 初期化
  currentOrigin = await getCurrentTabOrigin();

  if (currentOrigin) {
    originUrlElement.textContent = currentOrigin;
    clearButton.disabled = false;
    log('Current origin:', currentOrigin);
  } else {
    originUrlElement.textContent = '対応していないページです';
    clearButton.disabled = true;
    log('No valid origin found');
  }

  // Service Worker接続確認（デバッグ用）
  await checkServiceWorkerConnection();

  // クリアボタンのクリックイベント
  clearButton.addEventListener('click', async () => {
    if (!currentOrigin) return;

    clearButton.disabled = true;
    clearButton.textContent = 'クリア中...';
    log('Clear button clicked for origin:', currentOrigin);

    try {
      // Service Workerにクリア要求を送信
      const response = await sendMessage({
        type: 'CLEAR_ORIGIN_DATA',
        origin: currentOrigin,
        options: {
          cookies: true,
          cache: true,
          localStorage: true,
          sessionStorage: true
        }
      });

      if (response && response.success) {
        log('Data cleared successfully:', response);
        showStatus('認証情報をクリアしました', 'success');
      } else {
        throw new Error(response?.error || 'Unknown error');
      }
    } catch (error) {
      logError('Failed to clear data:', error);
      showStatus('クリアに失敗しました', 'error');
    } finally {
      clearButton.disabled = false;
      clearButton.textContent = '認証情報をクリア';
    }
  });
});
