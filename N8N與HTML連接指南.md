# N8N 與 HTML 介面連接指南

## 📋 完整連接步驟

### 步驟 1：確認 N8N Workflow 已啟動

1. 開啟 N8N（`http://localhost:5678`）
2. 確認你的 Workflow「AI 自動生成文章完整流程（N8N 原生）」已匯入
3. 確認 Workflow 已保存（右上角顯示 "Saved"）
4. **重要：** 點擊第一個節點「Webhook」，在右側面板找到「Webhook URL」
5. 複製這個 URL，格式類似：
   ```
   http://localhost:5678/webhook/generate-articles
   ```

### 步驟 2：在 HTML 介面中設定 Webhook URL

1. 開啟 HTML 管理介面（`http://localhost:3000`）
2. 找到「執行方式」下拉選單，選擇「透過 N8N 執行」
3. 在「N8N Webhook URL」欄位中，貼上剛才複製的 URL
4. 確認 URL 正確（應該類似：`http://localhost:5678/webhook/generate-articles`）

### 步驟 3：測試連接

1. 在 HTML 介面中：
   - 選擇網站（例如：sce010）
   - 設定文章數量（例如：1 篇）
   - 選擇日期（預設今天）
   - 點擊「開始生成文章」

2. 查看結果：
   - 如果成功，會顯示「✅ 文章生成完成！」並列出生成的文章
   - 如果失敗，會顯示錯誤訊息

3. 在 N8N 中查看執行記錄：
   - 點擊 N8N 的「Executions」標籤
   - 查看最新的執行記錄，確認每個節點是否正常執行

## 🔍 連接檢查清單

- [ ] N8N 正在運行（`http://localhost:5678`）
- [ ] Workflow 已匯入並保存
- [ ] 已複製 Webhook URL
- [ ] HTML 介面中的 Webhook URL 已設定
- [ ] 「執行方式」選擇「透過 N8N 執行」
- [ ] server.js 正在運行（`http://localhost:3000`）

## 🎯 完整流程說明

當你點擊「開始生成文章」時：

1. **HTML 介面** → 發送 POST 請求到 N8N Webhook
2. **N8N Webhook** → 接收請求並開始處理
3. **N8N 流程**：
   - 處理參數（站點、數量、日期等）
   - 從 Strapi 取得現有文章
   - 調用 Gemini API 生成文章
   - 上傳到 Strapi
   - 生成 HTML 檔案
   - 推送到 GitHub
4. **N8N Webhook Response** → 返回結果給 HTML 介面
5. **HTML 介面** → 顯示生成結果（成功/失敗、文章列表等）

## 💡 常見問題

### 問題 1：無法連接到 N8N
- **檢查：** N8N 是否正在運行
- **檢查：** Webhook URL 是否正確
- **檢查：** 瀏覽器控制台（F12）是否有錯誤訊息

### 問題 2：N8N 顯示錯誤
- **檢查：** 每個節點的設定是否正確
- **檢查：** API Key 和 Token 是否正確
- **檢查：** N8N 的執行記錄（Executions 標籤）

### 問題 3：HTML 介面沒有收到回應
- **檢查：** N8N Workflow 是否完整執行
- **檢查：** Webhook Response 節點是否在流程最後
- **檢查：** N8N 執行記錄中的錯誤訊息

## 🚀 快速測試

1. 在 HTML 介面選擇一個網站（例如：sce010）
2. 設定生成 1 篇文章
3. 點擊「開始生成文章」
4. 等待完成（可能需要 30 秒到 1 分鐘）
5. 查看結果

如果一切正常，你應該會看到：
- ✅ 成功生成 X 篇文章
- 📝 生成的文章列表（站點名稱和標題）
- 詳細資訊（可展開查看）


