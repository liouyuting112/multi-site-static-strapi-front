# CMS 腳本自動添加功能說明

## ✅ 已完成的更新

### 1. 新增 `ensure-cms-scripts.js` 模組
這個模組會自動檢查並更新 HTML 檔案，確保它們包含正確的 CMS 腳本引用：

- **`index.html`**: 自動添加 `<script src="../home-cms.js" data-site="siteX"></script>`
- **`all-daily-articles.html`**: 自動添加 `<script src="../all-daily-articles-cms.js"></script>`
- **文章頁面**: 自動添加 `<script src="../../article-cms.js"></script>`

### 2. 更新 `upload-site-to-strapi.js`
現在這個腳本會在上傳到 Strapi 之前，自動確保所有 HTML 檔案都有正確的腳本引用。

## 📋 使用方式

### 批量上傳腳本（已自動整合）
執行 `批量上傳-修正版.bat` 時，會自動：
1. ✅ 檢查並更新每個網站的 HTML 檔案腳本引用
2. ✅ 上傳到 Strapi
3. ✅ 推送到 GitHub

### 單網站上傳腳本（已自動整合）
執行 `上傳網站.bat` 時，會自動：
1. ✅ 檢查並更新 HTML 檔案的腳本引用
2. ✅ 上傳到 Strapi
3. ✅ 推送到 GitHub

## 🔍 腳本會自動處理的內容

### index.html
- 檢查是否有 `home-cms.js` 引用
- 如果沒有，自動添加
- 如果有，確保 `data-site` 屬性正確
- 自動標記每日精選區塊（`<!-- <auto-update> -->`）
- 自動標記固定文章區塊（`<!-- <manual-update> -->`）

### all-daily-articles.html
- 檢查是否有 `all-daily-articles-cms.js` 引用
- 如果沒有，自動添加

### 文章頁面（articles/*.html）
- 檢查是否有 `article-cms.js` 引用
- 如果沒有，自動添加

## 📝 注意事項

1. **腳本會自動檢測**：如果 HTML 檔案已經有正確的腳本引用，不會重複添加
2. **保留原有結構**：腳本會盡量保留原有的 HTML 結構和格式
3. **智能插入**：如果已經有 `js/main.js`，會在它後面添加 CMS 腳本；如果沒有，會一起添加

## 🚀 未來使用

以後使用批量上傳或單網站上傳腳本時，**不需要手動添加腳本引用**，腳本會自動處理！



