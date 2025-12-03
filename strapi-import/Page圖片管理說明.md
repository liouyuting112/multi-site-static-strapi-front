# Page 圖片集中管理說明

## 📋 前提條件

### 1. 確認 Strapi 的 Page Content Type 有 `imageUrl` 欄位

在 Strapi 後台：
1. 進入 **Content-Type Builder**
2. 找到 **Page** Content Type
3. 確認是否有 **`imageUrl`** 欄位（Text 類型）
4. 如果沒有，請添加：
   - 點擊 **Add another field**
   - 選擇 **Text**
   - 名稱輸入：`imageUrl`
   - 保存

## 🚀 使用方式

### 1. 批量更新所有 Page 的 imageUrl

從 HTML 中提取圖片 URL，或根據規則推斷：

```bash
cd strapi-import
npm run update-page-image-url
```

**功能：**
- 自動從每個 Page 的 `html` 欄位中提取第一個 `<img src="...">` 作為 `imageUrl`
- 如果 HTML 中沒有圖片，根據 `site` + `type` 推斷圖片 URL（例如：`site1-about.webp`）
- 只處理 `site1~site5` 的 `about`、`contact`、`privacy` 頁面

### 2. 列出所有 Page 的圖片資訊

查看所有站點的 Page 圖片：

```bash
# 列出所有站點
npm run list-page-images

# 只看特定站點
node list-page-images.js site1
node list-page-images.js site3
```

**顯示內容：**
- 每個 Page 的標題、slug
- HTML 中的第一張圖片（src、alt）
- `imageUrl` 欄位的值

### 3. 編輯特定 Page 的圖片

編輯單個 Page 的圖片：

```bash
node edit-page-image.js site1 about
node edit-page-image.js site2 contact
node edit-page-image.js site3 privacy
```

**選項：**
1. **改 html 裡第一張圖（src + alt）** - 直接修改 HTML 中的 `<img>` 標籤
2. **只改 imageUrl** - 只更新 `imageUrl` 欄位（用於集中管理）

## 📁 圖片檔案命名規則

根據 `shared-assets` 目錄的檔案：
- `site1-about.webp` - site1 的關於我們頁面
- `site1-contact.webp` - site1 的聯絡我們頁面
- `site2-about.webp` - site2 的關於我們頁面
- `site2-contact.webp` - site2 的聯絡我們頁面
- ... 以此類推

**注意：** 目前 `privacy` 頁面可能沒有專用的圖片檔案，腳本會嘗試從 HTML 中提取。

## 🔄 工作流程建議

1. **首次設定：**
   ```bash
   npm run update-page-image-url
   ```
   這會自動為所有 Page 設定 `imageUrl`

2. **查看現況：**
   ```bash
   npm run list-page-images
   ```

3. **修改特定頁面：**
   ```bash
   node edit-page-image.js site1 about
   ```

4. **在 Strapi 後台管理：**
   - 進入 **Content Manager → Page**
   - 選擇要編輯的頁面
   - 直接修改 `imageUrl` 欄位
   - 保存並發布

## 💡 提示

- `imageUrl` 欄位用於集中管理圖片，方便在 Strapi 後台統一修改
- HTML 中的 `<img>` 標籤是實際顯示的圖片
- 建議保持 `imageUrl` 和 HTML 中的圖片 URL 一致，方便管理

