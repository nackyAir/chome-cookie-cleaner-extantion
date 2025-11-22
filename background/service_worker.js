// service_worker.js - Origin Auth Reset Background Service Worker

// 拡張機能インストール時の処理
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Origin Auth Reset extension installed');
  } else if (details.reason === 'update') {
    console.log('Origin Auth Reset extension updated');
  }
});

// 将来的な機能拡張のためのプレースホルダー
// - コンテキストメニューの追加
// - キーボードショートカットの処理
// - バッジの更新など
