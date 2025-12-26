# N8N 連接 Strapi 問題排除指南

## 🔴 錯誤訊息
"The service refused the connection - perhaps it is offline"

## 🔍 問題分析

從你的錯誤訊息來看，有兩個可能的問題：

1. **N8N 無法連接到 `localhost:1337`**
   - 如果 N8N 運行在 Docker 容器中，`localhost` 指向容器內部，而不是主機
   - 需要使用 `host.docker.internal`（Windows/Mac）或主機 IP

2. **Authorization Token 沒有正確傳遞**
   - 從圖片看到 Authorization header 只顯示 "Bearer"，沒有 token

## ✅ 解決方案

### 方案 1：修改 URL（如果 N8N 運行在 Docker 中）

如果 N8N 是通過 Docker 運行的，需要將 `localhost` 改為：

**Windows/Mac:**
```
http://host.docker.internal:1337
```

**Linux:**
```
http://172.17.0.1:1337
```
或使用主機的實際 IP 地址

### 方案 2：確認 Strapi 正在運行

1. **檢查 Strapi 是否運行：**
   ```bash
   # 在瀏覽器開啟
   http://localhost:1337/admin
   ```

2. **確認端口是否正確：**
   ```bash
   netstat -ano | findstr :1337
   ```

### 方案 3：檢查 N8N 的運行方式

1. **如果 N8N 是本地運行（不是 Docker）：**
   - 使用 `http://localhost:1337` 應該可以

2. **如果 N8N 是 Docker 運行：**
   - 需要修改 workflow 中的 `STRAPI_URL` 為 `http://host.docker.internal:1337`

### 方案 4：確認 Token 傳遞

1. **檢查 "Set Variables" 節點：**
   - 確認 `STRAPI_TOKEN` 的值是否正確設定
   - 確認值不是表達式，而是純文字字串

2. **檢查 "Process Parameters" 節點：**
   - 確認 `STRAPI_TOKEN` 被正確傳遞

## 🛠️ 快速修復步驟

### 步驟 1：確認 Strapi 運行狀態

```bash
# 檢查 Strapi 是否在運行
curl http://localhost:1337/api/posts
```

如果返回 JSON 資料，表示 Strapi 正常運行。

### 步驟 2：測試 N8N 能否訪問 Strapi

在 N8N 中建立一個簡單的測試 Workflow：

1. 建立一個 **HTTP Request** 節點
2. 設定 URL 為：`http://localhost:1337/api/posts`（或 `http://host.docker.internal:1337/api/posts` 如果 N8N 在 Docker 中）
3. 設定 Method 為 `GET`
4. 在 Headers 中加入：
   - `Authorization: Bearer YOUR_TOKEN`
   - `Content-Type: application/json`
5. 執行測試

### 步驟 3：根據測試結果調整

- **如果 `localhost` 可以連接：** 保持使用 `http://localhost:1337`
- **如果 `localhost` 無法連接，但 `host.docker.internal` 可以：** 修改 workflow 中的 `STRAPI_URL` 為 `http://host.docker.internal:1337`

## 📝 修改 Workflow 中的 URL

如果確認需要使用 `host.docker.internal`，請修改：

1. **在 N8N 中編輯 "Set Variables" 節點**
2. 將 `STRAPI_URL` 的值從：
   ```
   http://localhost:1337
   ```
   改為：
   ```
   http://host.docker.internal:1337
   ```

## 🔐 確認 Token 設定

1. **在 N8N 中檢查 "Set Variables" 節點**
2. 確認 `STRAPI_TOKEN` 的值是完整的 token 字串（不是表達式）
3. 確認 token 沒有多餘的空格或換行

## 💡 其他可能的原因

1. **防火牆阻擋：** 確認防火牆允許連接
2. **Strapi CORS 設定：** 確認 Strapi 允許來自 N8N 的請求
3. **Strapi 只監聽特定 IP：** 檢查 Strapi 的配置

## 🚀 測試連接

建立一個簡單的測試腳本來確認連接：

```javascript
// 在 N8N 的 Code 節點中測試
const fetch = require('node-fetch');

const url = 'http://localhost:1337/api/posts';
const token = 'YOUR_TOKEN';

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('成功連接！', data);
  return { json: { success: true, data } };
})
.catch(error => {
  console.error('連接失敗：', error.message);
  return { json: { success: false, error: error.message } };
});
```

## ✅ 確認清單

- [ ] Strapi 正在運行（`http://localhost:1337/admin` 可以開啟）
- [ ] 確認 N8N 的運行方式（本地或 Docker）
- [ ] 根據運行方式選擇正確的 URL（`localhost` 或 `host.docker.internal`）
- [ ] `STRAPI_TOKEN` 在 "Set Variables" 節點中正確設定
- [ ] Authorization header 包含完整的 token
- [ ] 測試連接成功

---

**如果以上方法都無法解決，請告訴我：**
1. N8N 是如何運行的？（本地 Node.js 或 Docker）
2. Strapi 是如何運行的？（本地 Node.js 或 Docker）
3. 具體的錯誤訊息

這樣我可以提供更精確的解決方案！


