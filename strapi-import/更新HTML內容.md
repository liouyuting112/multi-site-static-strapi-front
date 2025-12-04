# 更新 Strapi 文章的 HTML 內容

這個腳本會從本地 HTML 檔案提取文章內容，並更新到 Strapi 中已有文章的 `html` 欄位。

## 📋 使用步驟

### 1. 設定 API Token

在 `update-html.js` 檔案中，找到這一行：
```javascript
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || ''; // 填入你的 Full Access API Token
```

將 `''` 改為你的 Strapi Full Access API Token，例如：
```javascript
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '你的token在這裡';
```

### 2. 確認 Strapi 正在運行

確保 Strapi 在 `http://localhost:1337` 運行。

### 3. 執行腳本

在 `strapi-import` 目錄下執行：

```bash
node update-html.js
```

或使用環境變數：

```bash
STRAPI_TOKEN=你的token node update-html.js
```

## 📊 腳本功能

- ✅ 自動讀取 `site1` 到 `site5` 的所有 HTML 文章檔案
- ✅ 根據 `slug` 和 `site` 匹配 Strapi 中的文章
- ✅ 提取 `<article class="article-content">` 內的 HTML 內容
- ✅ 自動移除 `<h1>` 標題（因為會從 `title` 欄位載入）
- ✅ 更新 Strapi 中對應文章的 `html` 欄位

## ⚠️ 注意事項

1. **備份重要**：建議先備份 Strapi 資料庫
2. **Token 權限**：確保 API Token 有 `update` 權限
3. **HTML 格式**：腳本會自動提取文章內容，但會保留 HTML 標籤和格式

## 🔍 輸出說明

腳本執行時會顯示：
- `📊 找到 X 篇文章` - 從 Strapi 獲取的文章數量
- `✅ 已更新: siteX - slug` - 成功更新的文章
- `❌ 更新失敗: siteX - slug` - 更新失敗的文章
- `⚠️ 找不到 Strapi 文章` - 本地有檔案但 Strapi 中沒有對應文章
- `⚠️ 無法提取 HTML 內容` - 無法從 HTML 檔案提取內容

## 🎯 完成後

執行完成後：
1. 登入 Strapi 後台檢查 `html` 欄位是否有內容
2. 刷新前端網站頁面，確認內容正確顯示




