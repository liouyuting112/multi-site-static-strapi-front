# Strapi 文章編輯指南

## 📝 如何在 Strapi 中編輯文章

### 方法一：直接編輯 HTML（推薦，保留完整格式）

如果你的 `html` 欄位是 **Text** 或 **Long text** 類型：

1. **登入 Strapi 後台**
   - 訪問 `http://localhost:1337/admin`
   - 進入 **Content Manager** → **Post**

2. **選擇要編輯的文章**
   - 點擊文章標題進入編輯頁面

3. **編輯 `html` 欄位**
   - 找到 `html` 欄位（通常在頁面下方）
   - 直接編輯 HTML 代碼
   - 例如：
   ```html
   <p>這是第一段文字。</p>
   <h2>這是小標題</h2>
   <p>這是第二段文字。</p>
   ```

4. **保存並發布**
   - 點擊右上角 **Save** 按鈕
   - 如果使用 Draft/Published 模式，記得點擊 **Publish**

5. **查看更新**
   - 刷新前端網站頁面（`F5`）
   - 內容會自動從 Strapi 載入並顯示

---

### 方法二：使用 Rich Text 編輯器（更友好，但需要設定）

如果你想使用 Strapi 的可視化編輯器（類似 Word），需要：

#### 步驟 1：修改 Strapi 欄位類型

1. 進入 **Content-Type Builder** → **Post**
2. 找到 `html` 欄位
3. 點擊編輯，將類型改為 **Rich text**
4. 保存

#### 步驟 2：修改前端腳本（我會幫你處理）

需要將 Rich Text 的格式轉換為 HTML。

---

## 🎯 編輯建議

### ✅ 推薦做法

1. **保留 HTML 結構**
   - 使用 `<p>` 標籤包裹段落
   - 使用 `<h2>`, `<h3>` 作為小標題
   - 使用 `<strong>`, `<em>` 強調文字

2. **圖片處理**
   - 圖片 URL 保持不變（使用 GitHub 或其他 CDN）
   - 例如：`<img src="https://github.com/.../site1-daily1.webp?raw=true" alt="描述">`

3. **樣式**
   - 內聯樣式會被保留，例如：`<div style="margin-bottom: 2rem;">`
   - 或使用 CSS 類別（如果已在 `style.css` 中定義）

### ⚠️ 注意事項

1. **不要包含外層標籤**
   - ❌ 不要：`<article class="article-content">...</article>`
   - ✅ 要：直接寫內容，例如 `<h1>標題</h1><p>內容</p>`

2. **標題處理**
   - 頁面的 `<h1>` 會自動從 `title` 欄位載入
   - 所以 `html` 欄位中不需要再寫 `<h1>`

3. **Hero Image**
   - 如果文章有 Hero Image，可以在 `html` 開頭加入：
   ```html
   <div class="hero-image" style="margin-bottom: 2rem;">
       <img src="圖片URL" alt="描述" style="width: 100%; height: auto;" loading="lazy">
   </div>
   ```

---

## 📋 編輯範例

### 範例 1：簡單文章

```html
<p>說到瑪利歐，大家腦中浮現的第一個形象，大概就是那個大鼻子、濃密的鬍子，還有一頂紅色的帽子。</p>

<h2>嘴巴太難畫，不如遮起來</h2>

<p>在 1981 年《大金剛》這款遊戲開發時，角色能使用的像素格數非常有限（大約只有 16x16）。</p>
```

### 範例 2：帶圖片的文章

```html
<div class="hero-image" style="margin-bottom: 2rem;">
    <img src="https://github.com/.../site1-daily1.webp?raw=true" alt="描述" style="width: 100%; height: auto;" loading="lazy">
</div>

<p>這是文章的第一段。</p>

<h2>小標題</h2>

<p>這是第二段內容。</p>
```

---

## 🔄 更新流程

1. **在 Strapi 編輯** → 2. **保存** → 3. **刷新前端頁面** → 4. **完成！**

前端會自動從 Strapi 載入最新內容，無需重新部署或上傳檔案。

---

## ❓ 常見問題

### Q: 編輯後前端沒有更新？
A: 
- 確認已點擊 **Save** 和 **Publish**（如果使用 Draft 模式）
- 確認前端頁面已刷新（`Ctrl+F5` 強制刷新）
- 檢查瀏覽器 Console 是否有錯誤訊息

### Q: HTML 格式跑掉了？
A: 
- 確認 HTML 標籤正確閉合
- 避免使用特殊字符（如 `<` 和 `>`），應該用 `&lt;` 和 `&gt;`

### Q: 想要更友好的編輯介面？
A: 
- 可以考慮使用 Rich Text 編輯器（需要修改欄位類型和前端腳本）
- 或使用 Markdown 編輯器（需要額外設定）

---

## 🚀 進階：批量編輯

如果需要批量更新多篇文章，可以使用：
- Strapi API（寫腳本批量更新）
- 或直接在 Strapi 後台逐篇編輯



