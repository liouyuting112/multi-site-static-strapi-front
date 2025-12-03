# 解決 Strapi html 字段為 null 的問題

## 🔍 問題診斷

從你的錯誤訊息看，Strapi API 返回 `200 OK`，但響應中的 `html` 字段是 `null`。這通常表示：

1. **字段類型問題**：`html` 字段可能是 **Rich Text** 類型，需要特殊格式
2. **字段權限問題**：字段可能不允許通過 API 更新
3. **Draft/Published 狀態**：可能需要先發布才能保存

## 🎯 解決方案

### 方案一：檢查並修改字段類型（推薦）

1. **登入 Strapi 後台**
   - 訪問 `http://localhost:1337/admin`
   - 進入 **Content-Type Builder**

2. **檢查 `html` 字段類型**
   - 點擊 **Post** → 找到 **html** 字段
   - 查看字段類型：
     - 如果是 **Rich Text** → 需要改為 **Text** 或 **Long text**
     - 如果是 **Text** 或 **Long text** → 繼續下一步

3. **修改字段類型（如果是 Rich Text）**
   - 點擊 **html** 字段
   - 將類型改為 **Text** 或 **Long text**
   - 點擊 **Finish** 保存
   - **重要**：這會清空現有的 Rich Text 內容，但之後可以通過腳本重新導入

4. **重新運行更新腳本**
   ```bash
   cd strapi-import
   npm run update-html
   ```

### 方案二：手動在 Strapi 後台編輯（臨時方案）

如果暫時不想修改字段類型，可以手動編輯：

1. **登入 Strapi 後台**
   - 訪問 `http://localhost:1337/admin`
   - 進入 **Content Manager** → **Post**

2. **編輯文章**
   - 點擊要編輯的文章
   - 找到 **html** 字段
   - 如果看到 Rich Text 編輯器：
     - 點擊右上角的 **`</>`** 按鈕（源代碼模式）
     - 直接貼上 HTML 代碼
   - 點擊 **Save** 保存
   - 點擊 **Publish** 發布

### 方案三：檢查字段權限

1. **檢查 API Token 權限**
   - 進入 **Settings** → **API Tokens**
   - 找到你使用的 Token
   - 確認有 **Update** 權限

2. **檢查 Content-Type 權限**
   - 進入 **Settings** → **Users & Permissions Plugin** → **Roles**
   - 選擇你的角色（例如 **Authenticated** 或 **Public**）
   - 確認 **Post** 的 **update** 權限已開啟

## 🔧 快速檢查步驟

1. **檢查字段類型**
   ```
   Content-Type Builder → Post → html 字段 → 查看類型
   ```

2. **如果是 Rich Text**
   - 改為 **Text** 或 **Long text**
   - 重新運行腳本

3. **如果是 Text/Long text 但還是 null**
   - 檢查 API Token 權限
   - 檢查字段是否設為必填（可能導致更新失敗）

## 📝 推薦設置

為了讓腳本正常工作，建議：

1. **字段類型**：**Long text**（不是 Rich Text）
2. **字段設置**：
   - 允許空值：✅ 是（暫時，導入後可以改為否）
   - 默認值：留空
3. **API Token 權限**：**Full access** 或至少 **Update** 權限

## ⚠️ 注意事項

- 如果將 Rich Text 改為 Text，現有的 Rich Text 內容會丟失
- 建議先備份 Strapi 資料庫
- 改為 Text 後，可以重新運行 `npm run update-html` 導入所有內容

## 🚀 完成後

修改字段類型並重新運行腳本後：

1. 檢查 Strapi 後台，確認 `html` 字段有內容
2. 刷新前端網站，確認內容正確顯示



