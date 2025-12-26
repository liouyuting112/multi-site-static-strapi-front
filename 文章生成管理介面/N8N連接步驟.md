# 🔗 HTML 管理介面連接 N8N 步驟

## 📋 完整連接流程

### 步驟 1：啟動 N8N

1. **開啟終端，執行：**
   ```bash
   n8n start
   ```

2. **確認 N8N 正在運行**
   - 瀏覽器開啟：`http://localhost:5678`
   - 如果看到 N8N 登入頁面，表示啟動成功

3. **匯入 Workflow**
   - 在 N8N 中點擊「Workflows」
   - 點擊「Import from File」
   - 選擇 `n8n-workflow-complete.json` 檔案
   - 點擊「Import」

4. **啟動 Workflow**
   - 打開匯入的 Workflow
   - 點擊右上角的「Active」開關（切換為綠色）

5. **複製 Webhook URL**
   - 點擊第一個「Webhook」節點
   - 在右側面板找到「Webhook URL」
   - 複製這個 URL，格式應該是：
     ```
     http://localhost:5678/webhook/generate-articles
     ```

### 步驟 2：啟動 HTML 管理介面

1. **開啟終端，切換到管理介面目錄：**
   ```bash
   cd "C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)\文章生成管理介面"
   ```

2. **啟動伺服器：**
   ```bash
   node server.js
   ```
   或
   ```bash
   npm start
   ```

3. **確認伺服器正在運行**
   - 應該會看到類似這樣的訊息：
     ```
     🚀 伺服器運行在 http://localhost:3000
     ```

### 步驟 3：在 HTML 介面中設定 N8N 連接

1. **開啟瀏覽器**
   - 訪問：`http://localhost:3000`

2. **設定執行方式**
   - 在「執行方式」下拉選單中，選擇「透過 N8N 執行」
   - 這會顯示「N8N Webhook URL」輸入框

3. **輸入 N8N Webhook URL**
   - 在「N8N Webhook URL」欄位中，貼上剛才從 N8N 複製的 URL
   - 預設值應該是：`http://localhost:5678/webhook/generate-articles`
   - 如果您的 N8N 運行在不同的端口或主機，請修改為實際的 URL

4. **確認設定**
   - 確認「執行方式」選擇「透過 N8N 執行」
   - 確認 Webhook URL 正確

### 步驟 4：測試連接

1. **在 HTML 介面中設定參數**
   - 選擇要生成文章的網站（可多選）
   - 設定文章數量（例如：2-3 篇）
   - 選擇文章類別（daily 或 fixed）
   - 選擇日期（預設今天）

2. **點擊「開始生成文章」**
   - 系統會發送請求到 N8N Webhook
   - 等待生成完成（可能需要 30 秒到 1 分鐘）

3. **查看結果**
   - 如果成功，會顯示「✅ 文章生成完成！」並列出生成的文章
   - 如果失敗，會顯示錯誤訊息

4. **在 N8N 中查看執行記錄**
   - 回到 N8N 介面（`http://localhost:5678`）
   - 點擊「Executions」標籤
   - 查看最新的執行記錄，確認每個節點是否正常執行

## 🔍 連接檢查清單

- [ ] **N8N 正在運行**
  - 確認 `http://localhost:5678` 可以開啟
  - 確認 N8N 沒有錯誤訊息

- [ ] **Workflow 已匯入並啟動**
  - 確認 Workflow 名稱是「AI 自動生成文章完整流程（N8N 原生）」
  - 確認 Workflow 已啟動（Active 開關是綠色）

- [ ] **Webhook URL 已複製**
  - 從 N8N 的 Webhook 節點複製 URL
  - 確認 URL 格式正確

- [ ] **HTML 管理介面正在運行**
  - 確認 `http://localhost:3000` 可以開啟
  - 確認「執行方式」選擇「透過 N8N 執行」
  - 確認「N8N Webhook URL」欄位已填入正確的 URL

- [ ] **其他服務正在運行**
  - Strapi：`http://localhost:1337`（或 `http://127.0.0.1:1337`）

## 🎯 完整流程說明

當您點擊「開始生成文章」時：

1. **HTML 介面** → 發送 POST 請求到 N8N Webhook
2. **N8N Webhook** → 接收請求並開始處理
3. **N8N Workflow 處理**：
   - 處理參數（站點、數量、日期等）
   - 從 Strapi 取得現有文章
   - 呼叫 OpenAI API 生成新文章
   - 將文章儲存到 Strapi
4. **N8N Webhook Response** → 返回結果給 HTML 介面
5. **HTML 介面** → 顯示生成結果

## ❌ 常見問題排除

### 問題 1：無法連接到 N8N

**錯誤訊息：** `Failed to fetch` 或 `NetworkError`

**解決方法：**
1. 確認 N8N 是否正在運行
   ```bash
   # 檢查 N8N 進程
   # 或重新啟動 N8N
   n8n start
   ```
2. 確認 Webhook URL 是否正確
   - 檢查 URL 格式：`http://localhost:5678/webhook/generate-articles`
   - 確認沒有多餘的空格或特殊字元
3. 檢查瀏覽器控制台（F12）的錯誤訊息

### 問題 2：N8N 顯示 Workflow 錯誤

**解決方法：**
1. 檢查 N8N 的「Executions」標籤
2. 點擊失敗的執行記錄，查看哪個節點出錯
3. 檢查節點設定：
   - API Key 是否正確
   - Token 是否正確
   - URL 是否正確

### 問題 3：HTML 介面沒有收到回應

**解決方法：**
1. 確認 N8N Workflow 是否完整執行
   - 查看 N8N 的執行記錄
   - 確認所有節點都成功執行
2. 確認「Webhook Response」節點在流程最後
3. 檢查 N8N 執行記錄中的錯誤訊息

### 問題 4：Webhook URL 找不到

**解決方法：**
1. 確認 Workflow 已啟動（Active 開關是綠色）
2. 點擊「Webhook」節點，在右側面板查看 URL
3. 如果 URL 顯示為「Production URL」或「Test URL」，請使用對應的 URL

## 🚀 快速測試步驟

1. **啟動所有服務**
   ```bash
   # 終端 1：啟動 N8N
   n8n start
   
   # 終端 2：啟動 HTML 管理介面
   cd "C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)\文章生成管理介面"
   node server.js
   
   # 終端 3：確認 Strapi 正在運行
   # （如果還沒啟動，請啟動 Strapi）
   ```

2. **在 HTML 介面中測試**
   - 開啟 `http://localhost:3000`
   - 確認「執行方式」選擇「透過 N8N 執行」
   - 確認「N8N Webhook URL」已填入正確的 URL
   - 選擇一個網站（例如：sce010）
   - 設定生成 1 篇文章
   - 點擊「開始生成文章」
   - 等待完成（可能需要 30 秒到 1 分鐘）

3. **查看結果**
   - HTML 介面會顯示生成結果
   - N8N 的「Executions」標籤會顯示執行記錄

## 📝 注意事項

1. **Webhook URL 可能會變動**
   - 如果重新匯入 Workflow，Webhook URL 可能會改變
   - 每次匯入後，請重新複製 Webhook URL

2. **N8N Workflow 必須啟動**
   - 只有啟動狀態的 Workflow 才能接收 Webhook 請求
   - 確認右上角的「Active」開關是綠色

3. **確保所有服務都在運行**
   - N8N：`http://localhost:5678`
   - HTML 管理介面：`http://localhost:3000`
   - Strapi：`http://localhost:1337`（或 `http://127.0.0.1:1337`）

