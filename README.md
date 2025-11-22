# Origin Auth Reset

現在のオリジンに関連するCookie、キャッシュ、認証情報をワンクリックでクリアするChrome拡張機能です。

## 機能

- 現在閲覧中のサイトのオリジンを自動検出
- ワンクリックで以下のデータをクリア:
  - Cookie
  - キャッシュ
  - ローカルストレージ
  - セッションストレージ

## インストール方法

### 開発版（ローカルインストール）

1. このリポジトリをクローン
   ```bash
   git clone https://github.com/nackyAir/chome-cookie-cleaner-extantion.git
   ```

2. Chromeで `chrome://extensions` を開く

3. 右上の「デベロッパーモード」を有効化

4. 「パッケージ化されていない拡張機能を読み込む」をクリック

5. クローンしたフォルダを選択

## 使い方

1. 認証情報をクリアしたいWebサイトを開く
2. ツールバーの拡張機能アイコンをクリック
3. 「認証情報をクリア」ボタンをクリック
4. 完了メッセージが表示されたら、ページをリロード

## プロジェクト構成

```
├── manifest.json          # Chrome拡張機能の設定ファイル（Manifest V3）
├── background/
│   └── service_worker.js  # バックグラウンド処理
├── popup/
│   ├── popup.html         # ポップアップUI
│   ├── popup.js           # ポップアップのロジック
│   └── popup.css          # ポップアップのスタイル
└── assets/
    └── icon*.png          # 拡張機能アイコン（16, 32, 48, 128px）
```

## 必要な権限

- `tabs` - 現在のタブのURL取得
- `browsingData` - ブラウジングデータのクリア
- `storage` - 設定の保存（将来の機能拡張用）

## ライセンス

MIT
