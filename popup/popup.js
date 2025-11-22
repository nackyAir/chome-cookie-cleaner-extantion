// popup.js - Origin Auth Reset Popup Script

document.addEventListener('DOMContentLoaded', async () => {
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
      console.error('Failed to get current tab:', error);
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

  // 初期化
  currentOrigin = await getCurrentTabOrigin();

  if (currentOrigin) {
    originUrlElement.textContent = currentOrigin;
    clearButton.disabled = false;
  } else {
    originUrlElement.textContent = '対応していないページです';
    clearButton.disabled = true;
  }

  // クリアボタンのクリックイベント
  clearButton.addEventListener('click', async () => {
    if (!currentOrigin) return;

    clearButton.disabled = true;
    clearButton.textContent = 'クリア中...';

    try {
      // browsingDataを使用してオリジンのデータをクリア
      await chrome.browsingData.remove(
        {
          origins: [currentOrigin]
        },
        {
          cookies: true,
          cache: true,
          localStorage: true,
          sessionStorage: true
        }
      );

      showStatus('認証情報をクリアしました', 'success');
    } catch (error) {
      console.error('Failed to clear data:', error);
      showStatus('クリアに失敗しました', 'error');
    } finally {
      clearButton.disabled = false;
      clearButton.textContent = '認証情報をクリア';
    }
  });
});
