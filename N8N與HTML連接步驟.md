# 🔗 N8N 與 HTML 介面連接步驟

## 📋 完整連接流程

### 步驟 1：啟動 N8N 並匯入 Workflow

1. **啟動 N8N**
   ```bash
   # 如果還沒啟動，執行：
   n8n start
   ```
   或使用你平常啟動 N8N 的方式

2. **開啟 N8N 介面**
   - 瀏覽器開啟：`http://localhost:5678`

3. **匯入 Workflow**
   - 點擊左側選單的「Workflows」
   - 點擊右上角「Import from File」或「Import from URL」
   - 選擇 `n8n-workflow-complete.json` 檔案
   - 點擊「Import」

4. **啟動 Workflow**
   - 匯入後，點擊右上角的「Active」開關，確保 Workflow 是**啟動狀態**（綠色）

### 步驟 2：取得 N8N Webhook URL

1. **在 N8N 中找到 Webhook 節點**
   - 打開匯入的 Workflow
   - 找到第一個節點「Webhook」（應該在最左邊）

2. **複製 Webhook URL**
   - 點擊「Webhook」節點
   - 在右側面板中，你會看到「Webhook URL」
   - 複製這個 URL，格式應該是：
     ```
     http://localhost:5678/webhook/generate-articles
     ```
   - **重要：** 如果 URL 不同，請使用 N8N 顯示的實際 URL

### 步驟 3：在 HTML 介面中設定 Webhook URL

1. **啟動 HTML 管理介面**
   ```bash
   cd 文章生成管理介面
   node server.js
   ```
   或使用你平常啟動的方式

2. **開啟 HTML 介面**
   - 瀏覽器開啟：`http://localhost:3000`

3. **設定 Webhook URL**
   - 在「執行方式」下拉選單中，確認選擇「透過 N8N 執行」
   - 在「N8N Webhook URL」欄位中，貼上剛才從 N8N 複製的 URL
   - 預設值應該是：`http://localhost:5678/webhook/generate-articles`
   - 如果不同，請修改為 N8N 顯示的實際 URL

### 步驟 4：測試連接

1. **在 HTML 介面中設定參數**
   - 選擇網站（例如：sce010）
   - 設定文章數量（例如：1 篇）
   - 選擇日期（預設今天）
   - 確認「執行方式」是「透過 N8N 執行」

2. **點擊「開始生成文章」**

3. **查看結果**
   - 如果成功，會顯示：
     - ✅ 文章生成完成！
     - 成功生成 X 篇文章
     - 生成的文章列表
   - 如果失敗，會顯示錯誤訊息

4. **在 N8N 中查看執行記錄**
   - 回到 N8N 介面
   - 點擊「Executions」標籤
   - 查看最新的執行記錄
   - 點擊執行記錄可以查看每個節點的詳細資訊

## 🔍 連接檢查清單

在開始測試前，確認以下項目：

- [ ] **N8N 正在運行**
  - 確認 `http://localhost:5678` 可以開啟
  - 確認 N8N 沒有錯誤訊息

- [ ] **Workflow 已匯入並啟動**
  - 確認 Workflow 名稱是「AI 自動生成文章完整流程（N8N 原生）」
  - 確認右上角「Active」開關是**綠色**（啟動狀態）

- [ ] **Webhook URL 已複製**
  - 從 N8N 的 Webhook 節點複製 URL
  - 確認 URL 格式正確

- [ ] **HTML 介面已設定**
  - 確認 `http://localhost:3000` 可以開啟
  - 確認「執行方式」選擇「透過 N8N 執行」
  - 確認「N8N Webhook URL」欄位已填入正確的 URL

- [ ] **其他服務正在運行**
  - Strapi：`http://localhost:1337`
  - 確認 Strapi API Token 正確

## 🎯 完整流程說明

當你點擊「開始生成文章」時，整個流程如下：

```
HTML 介面
  ↓ (POST 請求)
N8N Webhook
  ↓
N8N Workflow 處理：
  1. 處理參數（站點、數量、日期等）
  2. 從 Strapi 取得現有文章
  3. 調用 Gemini API 生成文章
  4. 上傳到 Strapi
  5. 生成 HTML 檔案
  6. 推送到 GitHub
  ↓
N8N Webhook Response
  ↓ (JSON 回應)
HTML 介面顯示結果
```

## 💡 常見問題排除

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
   cd 文章生成管理介面
   node server.js
   
   # 終端 3：確認 Strapi 正在運行
   # （如果還沒啟動，請啟動 Strapi）
   ```

2. **在 HTML 介面中測試**
   - 開啟 `http://localhost:3000`
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
   - 確認右上角「Active」開關是綠色

3. **執行時間**
   - 生成一篇文章通常需要 30 秒到 1 分鐘
   - 如果生成多篇文章，時間會更長
   - 請耐心等待，不要重複點擊

4. **錯誤處理**
   - 如果出現錯誤，請查看：
     - HTML 介面的錯誤訊息
     - N8N 的執行記錄
     - 瀏覽器控制台（F12）

## ✅ 成功標誌

如果一切正常，你會看到：

1. **HTML 介面顯示：**
   ```
   ✅ 文章生成完成！
   成功生成 X 篇文章
   
   📝 生成的文章：
   - sce010: 文章標題
   - site1: 文章標題
   ...
   ```

2. **N8N 執行記錄顯示：**
   - 所有節點都是綠色（成功）
   - 沒有錯誤訊息

3. **Strapi 後台：**
   - 可以在 `http://localhost:1337/admin` 看到新生成的文章

4. **GitHub：**
   - 如果設定正確，新生成的 HTML 檔案會推送到 GitHub

---

**如果還有問題，請告訴我具體的錯誤訊息，我會幫你解決！** 🚀


