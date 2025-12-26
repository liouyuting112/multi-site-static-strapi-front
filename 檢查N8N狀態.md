# 檢查 N8N Workflow 狀態

## 🔍 如何確認 Workflow 是否可用

### 方法 1：檢查 Webhook URL 是否可訪問

1. 在 N8N 中，點擊「Webhook1」節點
2. 在右側面板找到「Webhook URL」
3. 複製這個 URL（例如：`http://localhost:5678/webhook/generate-articles`）
4. 在瀏覽器中打開這個 URL，應該會看到類似這樣的訊息：
   ```
   {"message":"Webhook is waiting for data"}
   ```
   或
   ```
   {"error":"Method not allowed"}
   ```
   
   如果看到這些訊息，表示 Webhook 是可用的！

### 方法 2：檢查 Workflow 是否已保存

1. 在 N8N 編輯器中，查看右上角
2. 應該會看到「Saved」或「Unsaved」標籤
3. 如果顯示「Unsaved」，點擊「Save」按鈕保存

### 方法 3：在 Workflow 列表頁面檢查

1. 點擊左上角的「Workflows」回到列表
2. 找到你的 Workflow
3. 查看是否有「Active」或「Inactive」標籤
4. 如果有「Inactive」，點擊切換為「Active」

### 方法 4：直接測試（最簡單）

即使沒有看到 Active 開關，也可以直接測試：

1. 複製 Webhook URL
2. 在 HTML 管理介面中設定這個 URL
3. 嘗試發送一個測試請求
4. 如果成功，會看到「請求已發送到 N8N」的訊息
5. 然後到 N8N 的「Executions」標籤查看執行記錄

## 💡 重要提示

在 N8N 中，**Webhook 節點預設是啟動的**，只要：
- Workflow 已保存
- N8N 服務正在運行
- Webhook URL 正確

就可以直接使用，不需要額外的 Active 開關！

## 🧪 快速測試

你可以使用這個命令測試 Webhook 是否可用：

```bash
curl -X POST http://localhost:5678/webhook/generate-articles -H "Content-Type: application/json" -d "{\"sites\":[\"sce010\"],\"count\":1}"
```

或者使用我提供的測試腳本：
```bash
node 測試N8N連接.js
```


