# N8N 設定說明

## 📋 步驟 1：匯入 Workflow

1. 開啟 N8N（通常是 `http://localhost:5678`）
2. 點擊左上角「Workflows」
3. 點擊「Import from File」
4. 選擇 `n8n-workflow.json` 檔案
5. 點擊「Import」

## 📋 步驟 2：確認 Webhook URL

匯入後，點擊「Webhook」節點，你會看到 Webhook URL，格式類似：
```
http://localhost:5678/webhook/generate-articles
```

**重要：** 複製這個 URL，貼到 HTML 管理介面的「N8N Webhook URL」欄位。

## 📋 步驟 3：啟動 Workflow

### 方法 1：在 Workflow 編輯器中啟動
1. 在 N8N Workflow 編輯器中，查看右上角
2. 找到「Active」或「Inactive」開關（可能在「Saved」按鈕旁邊）
3. 如果顯示「Inactive」，點擊切換為「Active」（綠色）

### 方法 2：在 Workflow 列表頁面啟動
1. 點擊左上角的「Workflows」回到列表頁面
2. 找到你的 Workflow「AI自動生成文章並同步到 GitHub」
3. 在該 Workflow 的右側，應該有一個開關或「Active/Inactive」標籤
4. 點擊切換為「Active」

### 方法 3：如果找不到 Active 開關
1. 先點擊右上角的「Save」按鈕保存 Workflow
2. 保存後，Active 開關應該會出現
3. 或者，在 N8N 中，Webhook 節點預設是啟動的，只要 Workflow 已保存即可使用

### 重要提示
- 即使沒有看到 Active 開關，只要 Workflow 已保存，Webhook 通常就可以使用
- 你可以直接測試 Webhook URL 是否可用

## 📋 步驟 4：測試連接

1. 開啟 HTML 管理介面（`http://localhost:3000`）
2. 確認「執行方式」選擇「透過 N8N 執行」
3. 確認「N8N Webhook URL」欄位中的 URL 正確
4. 選擇網站、設定參數
5. 點擊「開始生成文章」

## 🔍 常見問題

### 問題 1：無法連接到 N8N
- **檢查：** N8N 是否正在運行（`http://localhost:5678`）
- **檢查：** Webhook URL 是否正確
- **檢查：** Workflow 是否已啟動（Active）

### 問題 2：N8N 顯示錯誤「Unrecognized node type」
- **解決：** 確保你使用的是最新的 `n8n-workflow.json` 檔案
- **解決：** 如果還有問題，手動檢查節點類型，確保沒有 `executeCommand` 節點

### 問題 3：Strapi API 401 錯誤
- **檢查：** Strapi 是否正在運行（`http://localhost:1337`）
- **檢查：** `server.js` 中的 `STRAPI_TOKEN` 是否正確
- **解決：** 到 Strapi 後台重新生成 API Token

### 問題 4：HTML 介面無法載入站點列表
- **檢查：** `server.js` 是否正在運行（`http://localhost:3000`）
- **檢查：** Strapi 是否正在運行
- **解決：** 查看終端機的錯誤訊息，確認問題所在

## 📝 工作流程說明

1. **Webhook** - 接收來自 HTML 介面的 POST 請求
2. **Webhook Response** - 立即回應（避免超時）
3. **Set Variables** - 設定環境變數
4. **Generate Articles** - 執行 `ai-generate-articles.cjs` 生成文章
5. **IF Success** - 檢查是否成功
6. **Export to GitHub** - 執行 `export-strapi-to-github.cjs` 匯出到 GitHub

## 🎯 測試建議

1. 先在 N8N 中手動執行一次 Workflow（點擊「Execute Workflow」）
2. 確認所有節點都正常執行
3. 然後再從 HTML 介面觸發

