// popup.js - Origin Auth Reset Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // DOM要素の取得
  const siteFavicon = document.getElementById('site-favicon');
  const siteTitle = document.getElementById('site-title');
  const siteOrigin = document.getElementById('site-origin');
  const clearButton = document.getElementById('clear-btn');
  const statusElement = document.getElementById('status');
  const lastClearedElement = document.getElementById('last-cleared');

  // オプションチェックボックス
  const optCookies = document.getElementById('opt-cookies');
  const optCache = document.getElementById('opt-cache');
  const optLocalStorage = document.getElementById('opt-localstorage');
  const optSessionStorage = document.getElementById('opt-sessionstorage');

  let currentOrigin = null;
  let currentTab = null;

  // 現在のタブの情報を取得
  async function getCurrentTabInfo() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        const url = new URL(tab.url);
        // chrome:// や chrome-extension:// などの特殊なURLは除外
        if (url.protocol === 'http:' || url.protocol === 'https:') {
          return {
            origin: url.origin,
            title: tab.title || url.hostname,
            favIconUrl: tab.favIconUrl || ''
          };
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

    // 5秒後に非表示
    setTimeout(() => {
      statusElement.className = 'status';
    }, 5000);
  }

  // 前回実行時刻を表示
  async function loadLastCleared() {
    try {
      const result = await chrome.storage.local.get(['lastCleared']);
      if (result.lastCleared && result.lastCleared[currentOrigin]) {
        const date = new Date(result.lastCleared[currentOrigin]);
        lastClearedElement.textContent = `前回実行: ${formatDate(date)}`;
      }
    } catch (error) {
      console.error('Failed to load last cleared:', error);
    }
  }

  // 前回実行時刻を保存
  async function saveLastCleared() {
    try {
      const result = await chrome.storage.local.get(['lastCleared']);
      const lastCleared = result.lastCleared || {};
      lastCleared[currentOrigin] = Date.now();
      await chrome.storage.local.set({ lastCleared });
      lastClearedElement.textContent = `前回実行: ${formatDate(new Date())}`;
    } catch (error) {
      console.error('Failed to save last cleared:', error);
    }
  }

  // 日付フォーマット
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

  // 初期化
  const tabInfo = await getCurrentTabInfo();

  if (tabInfo) {
    currentOrigin = tabInfo.origin;
    siteTitle.textContent = tabInfo.title;
    siteOrigin.textContent = tabInfo.origin;

    if (tabInfo.favIconUrl) {
      siteFavicon.src = tabInfo.favIconUrl;
      siteFavicon.onerror = () => {
        siteFavicon.style.display = 'none';
      };
    } else {
      siteFavicon.style.display = 'none';
    }

    clearButton.disabled = false;
    await loadLastCleared();
  } else {
    siteTitle.textContent = '対応していないページです';
    siteOrigin.textContent = 'http/https ページでのみ動作します';
    siteFavicon.style.display = 'none';
    clearButton.disabled = true;
  }

  // クリアボタンのクリックイベント
  clearButton.addEventListener('click', async () => {
    if (!currentOrigin) return;

    // オプションを取得
    const options = {
      cookies: optCookies.checked,
      cache: optCache.checked,
      localStorage: optLocalStorage.checked,
      sessionStorage: optSessionStorage.checked
    };

    // 少なくとも1つはチェックされているか確認
    if (!Object.values(options).some(v => v)) {
      showStatus('クリアする項目を選択してください', 'error');
      return;
    }

    clearButton.disabled = true;
    clearButton.textContent = 'クリア中...';

    try {
      // browsingDataを使用してオリジンのデータをクリア
      await chrome.browsingData.remove(
        {
          origins: [currentOrigin]
        },
        options
      );

      await saveLastCleared();

      const clearedItems = [];
      if (options.cookies) clearedItems.push('Cookie');
      if (options.cache) clearedItems.push('キャッシュ');
      if (options.localStorage) clearedItems.push('ローカルストレージ');
      if (options.sessionStorage) clearedItems.push('セッションストレージ');

      showStatus(`${clearedItems.join('、')}をクリアしました`, 'success');
    } catch (error) {
      console.error('Failed to clear data:', error);
      showStatus('クリアに失敗しました', 'error');
    } finally {
      clearButton.disabled = false;
      clearButton.textContent = '認証情報をクリア';
    }
  });
});
