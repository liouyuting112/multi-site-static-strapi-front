# 避免 Google 重複內容問題指南

## 問題：開發環境是否會被 Google 認為是重複內容？

**答案：可能會，但可以透過設定避免。**

## 解決方案

### 方案一：使用 robots.txt 阻止索引（推薦）

在開發環境的網站根目錄添加 `robots.txt`，阻止 Google 索引開發環境。

#### 步驟 1：創建 robots.txt

在專案根目錄創建 `robots.txt`：

```txt
User-agent: *
Disallow: /
```

這會阻止所有搜尋引擎索引整個網站。

#### 步驟 2：根據環境動態設定

更好的方式是根據環境動態設定：

**方法 A：使用 JavaScript 動態生成**

在 `index.html` 或根目錄的 HTML 檔案中添加：

```html
<script>
// 如果是開發/預覽環境，添加 robots meta tag
if (window.location.hostname.includes('vercel.app') && 
    !window.location.hostname.includes('multi-site-static-strapi-front.vercel.app')) {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
}
</script>
```

**方法 B：為不同環境創建不同的 robots.txt**

- **正式環境**：`robots.txt` 允許索引
- **開發/預覽環境**：`robots.txt` 禁止索引

### 方案二：使用 noindex Meta Tag

在開發環境的所有 HTML 檔案中添加：

```html
<meta name="robots" content="noindex, nofollow">
```

這會告訴搜尋引擎不要索引這個頁面。

### 方案三：使用 X-Robots-Tag HTTP Header

在 Vercel 設定中添加 HTTP Header：

1. 進入 Vercel 專案設定
2. 點擊 **Settings** → **Headers**
3. 添加規則：
   - **Source**: `*`
   - **Headers**: 
     - `X-Robots-Tag: noindex, nofollow`
   - **Environment**: 選擇 `Preview` 或 `Development`

### 方案四：使用密碼保護（最安全）

在 Vercel 設定中啟用密碼保護：

1. 進入 Vercel 專案設定
2. 點擊 **Settings** → **Deployment Protection**
3. 為 Preview/Development 環境啟用密碼保護
4. 這樣只有知道密碼的人才能訪問，Google 也無法索引

## 推薦設定

### 最佳實踐

1. **正式環境（Production）**
   - 使用 `develop` 分支
   - 允許 Google 索引
   - 使用正式網域

2. **預覽環境（Preview）**
   - 使用其他分支（如 `main`）
   - 使用 `robots.txt` 或 `noindex` 禁止索引
   - 或啟用密碼保護

3. **開發環境（Development）**
   - 使用 CLI 部署
   - 啟用密碼保護
   - 或使用 `noindex`

## 檢查清單

完成設定後，檢查：

- [ ] 開發/預覽環境有 `robots.txt` 或 `noindex` meta tag
- [ ] 正式環境允許索引
- [ ] 使用 Google Search Console 檢查索引狀態
- [ ] 確認只有正式環境被索引

## 如何檢查是否被索引

1. **使用 Google Search Console**
   - 登入 https://search.google.com/search-console
   - 檢查哪些網址被索引

2. **使用 Google 搜尋**
   - 搜尋：`site:你的預覽網址.vercel.app`
   - 如果沒有結果，表示沒有被索引

3. **檢查 robots.txt**
   - 訪問：`https://你的網址.vercel.app/robots.txt`
   - 確認內容正確

## 注意事項

⚠️ **重要提醒：**

1. **不要同時索引多個環境**
   - 如果正式環境和預覽環境都被索引，Google 可能認為是重複內容
   - 建議只索引正式環境

2. **使用正式網域**
   - 正式環境應該使用自訂網域（如 `yourdomain.com`）
   - 預覽環境使用 Vercel 預設網域（如 `xxx.vercel.app`）

3. **定期檢查**
   - 定期檢查 Google Search Console
   - 確認沒有意外索引開發環境

## 快速設定腳本

我可以幫你創建一個腳本，自動為不同環境設定正確的 `robots.txt` 和 meta tags。

需要我幫你設定嗎？


