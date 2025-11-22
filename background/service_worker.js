// service_worker.js - Origin Auth Reset Background Service Worker

const DEBUG = true;

function log(...args) {
  if (DEBUG) {
    console.log('[Service Worker]', ...args);
  }
}

function logError(...args) {
  console.error('[Service Worker]', ...args);
}

// 拡張機能インストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    log('Extension installed');
  } else if (details.reason === 'update') {
    log('Extension updated to version', chrome.runtime.getManifest().version);
  }
});

// Service Worker起動時のログ
log('Service Worker started');

// メッセージハンドラ
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  log('Received message:', message.type, message);

  handleMessage(message, sender)
    .then(response => {
      log('Sending response:', response);
      sendResponse(response);
    })
    .catch(error => {
      logError('Error handling message:', error);
      sendResponse({ success: false, error: error.message });
    });

  // 非同期レスポンスのためにtrueを返す
  return true;
});

// メッセージ処理の本体
async function handleMessage(message, sender) {
  switch (message.type) {
    case 'CLEAR_ORIGIN_DATA':
      return await clearOriginData(message.origin, message.options);

    case 'PING':
      return { success: true, message: 'pong' };

    case 'GET_STATUS':
      return { success: true, status: 'active' };

    default:
      throw new Error(`Unknown message type: ${message.type}`);
  }
}

// オリジンデータのクリア処理
async function clearOriginData(origin, options = {}) {
  if (!origin) {
    throw new Error('Origin is required');
  }

  log('Clearing data for origin:', origin);

  const dataTypes = {
    cookies: options.cookies !== false,
    cache: options.cache !== false,
    localStorage: options.localStorage !== false,
    sessionStorage: options.sessionStorage !== false
  };

  try {
    await chrome.browsingData.remove(
      { origins: [origin] },
      dataTypes
    );

    log('Successfully cleared data for:', origin);
    return { success: true, origin, clearedTypes: dataTypes };
  } catch (error) {
    logError('Failed to clear data:', error);
    throw error;
  }
}
