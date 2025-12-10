# Vercel 網址變動說明

## 為什麼 Vercel 網址會一直變？

### 原因說明

Vercel 有**兩種部署類型**，它們的網址行為不同：

#### 1. **Production 部署**（固定網址）

- **網址格式**：`https://專案名稱.vercel.app`
- **範例**：`https://multi-site-static-strapi-front.vercel.app`
- **特點**：
  - ✅ **網址固定不變**
  - ✅ 每次部署會更新內容，但網址相同
  - ✅ 適合正式環境使用

#### 2. **Preview 部署**（每次變動）

- **網址格式**：`https://專案名稱-隨機字串.vercel.app`
- **範例**：
  - `https://multi-site-static-strapi-front-bu4ydt91h.vercel.app`
  - `https://multi-site-static-strapi-front-abc123.vercel.app`
  - `https://multi-site-static-strapi-front-xyz789.vercel.app`
- **特點**：
  - ⚠️ **每次部署都會產生新的網址**
  - ⚠️ 網址中的隨機字串會變動
  - ✅ 適合測試和預覽使用

---

## 為什麼會看到網址一直變？

### 情況 1：你在查看 Preview 部署

**症狀：**
- 每次推送後，網址都會變
- 網址包含隨機字串（如 `-bu4ydt91h`）

**原因：**
- 你推送的分支**不是** Production 分支
- Vercel 自動為每次部署創建新的 Preview 網址

**解決方法：**
- 使用 **Production 網址**（固定網址）
- 或設定 Production 分支，讓你的分支部署到固定網址

### 情況 2：Production 分支設定不正確

**症狀：**
- 即使推送了 Production 分支，網址還是會變

**原因：**
- Vercel 的 Production Branch 設定錯誤
- 或 `vercel.json` 設定不正確

**解決方法：**
- 檢查並修正 Vercel 設定（見下方）

---

## 如何獲得固定網址？

### 方法一：設定 Production 分支（推薦）

#### 步驟 1：在 Vercel 後台設定

1. **登入 Vercel**：https://vercel.com
2. **進入專案**：`multi-site-static-strapi-front`
3. **點擊 Settings** → **Git**
4. **設定 Production Branch**：
   - 找到 **Production Branch**
   - 選擇你想要的分支（例如：`develop` 或 `main`）
   - 點擊 **Save**

#### 步驟 2：推送對應分支

```bash
# 如果 Production Branch 設定為 develop
git checkout develop
git add .
git commit -m "Update"
git push origin develop
```

**結果：**
- ✅ 部署到 Production 環境
- ✅ 使用固定網址：`https://multi-site-static-strapi-front.vercel.app`
- ✅ 網址不會再變動

### 方法二：使用自訂網域

1. **在 Vercel 後台設定自訂網域**
   - Settings → Domains
   - 添加你的網域（例如：`example.com`）

2. **設定 DNS**
   - 按照 Vercel 的指示設定 DNS 記錄

**結果：**
- ✅ 使用自訂網域（例如：`https://example.com`）
- ✅ 網址完全固定

---

## 當前設定檢查

### 檢查你的 Vercel 設定

1. **登入 Vercel**：https://vercel.com
2. **進入專案**：`multi-site-static-strapi-front`
3. **點擊 Settings** → **Git**
4. **查看 Production Branch**：
   - 目前設定為：`develop` 或 `main`？
   - 這決定了哪個分支會部署到固定網址

### 檢查你的 `vercel.json`

```json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

**說明：**
- `deploymentEnabled` 只是**啟用**分支部署
- **不會**決定哪個是 Production 分支
- Production 分支需要在 Vercel 後台設定

---

## 推薦設定

### 方案 A：develop 分支 = Production（固定網址）

**Vercel 設定：**
- **Production Branch**: `develop`
- **Preview Branches**: `main`

**結果：**
- 推送 `develop` → 固定網址：`https://multi-site-static-strapi-front.vercel.app`
- 推送 `main` → 預覽網址：`https://multi-site-static-strapi-front-xxxxx.vercel.app`（會變動）

### 方案 B：main 分支 = Production（固定網址）

**Vercel 設定：**
- **Production Branch**: `main`
- **Preview Branches**: `develop`

**結果：**
- 推送 `main` → 固定網址：`https://multi-site-static-strapi-front.vercel.app`
- 推送 `develop` → 預覽網址：`https://multi-site-static-strapi-front-xxxxx.vercel.app`（會變動）

---

## 如何區分 Production 和 Preview 部署？

### 在 Vercel Deployments 頁面

1. **Production 部署**：
   - 標籤顯示：**Production**
   - 網址：`https://multi-site-static-strapi-front.vercel.app`（固定）

2. **Preview 部署**：
   - 標籤顯示：**Preview**
   - 網址：`https://multi-site-static-strapi-front-xxxxx.vercel.app`（會變動）
   - 會顯示分支名稱（如 `develop`、`main`）

### 在網址中判斷

- **固定網址**（Production）：
  ```
  https://multi-site-static-strapi-front.vercel.app
  ```
  - 只有專案名稱，沒有隨機字串

- **變動網址**（Preview）：
  ```
  https://multi-site-static-strapi-front-bu4ydt91h.vercel.app
  ```
  - 專案名稱後面有 `-隨機字串`

---

## 常見問題

### Q: 為什麼每次推送網址都會變？

**A:** 因為你推送的分支**不是** Production 分支，所以 Vercel 創建了 Preview 部署。

**解決方法：**
1. 在 Vercel 後台設定 Production Branch
2. 推送 Production 分支（例如：`develop` 或 `main`）
3. 使用固定網址：`https://multi-site-static-strapi-front.vercel.app`

### Q: 可以讓 Preview 網址也固定嗎？

**A:** 不可以。Preview 網址設計上就是每次變動的，這是 Vercel 的預設行為。

**替代方案：**
- 使用 Production 分支獲得固定網址
- 或使用自訂網域

### Q: 如何知道當前使用的是 Production 還是 Preview？

**A:** 
1. 查看網址：
   - 固定網址 = Production
   - 有隨機字串 = Preview
2. 在 Vercel Deployments 頁面查看標籤

### Q: 推送 develop 分支，但網址還是會變？

**A:** 檢查 Vercel 設定：
1. Settings → Git → Production Branch
2. 確認是否設定為 `develop`
3. 如果設定正確，重新推送一次

---

## 快速解決步驟

### 如果你想要固定網址：

1. **登入 Vercel**：https://vercel.com
2. **進入專案**：`multi-site-static-strapi-front`
3. **Settings** → **Git** → **Production Branch**
4. **選擇分支**：選擇 `develop` 或 `main`
5. **Save**
6. **推送對應分支**：
   ```bash
   git checkout develop  # 或 main
   git push origin develop  # 或 main
   ```
7. **使用固定網址**：`https://multi-site-static-strapi-front.vercel.app`

---

## 總結

- **Production 部署** = 固定網址（不會變）
- **Preview 部署** = 變動網址（每次都會變）
- **解決方法** = 設定 Production Branch，使用固定網址

如果還有問題，請檢查：
1. Vercel 後台的 Production Branch 設定
2. 你推送的是哪個分支
3. 部署記錄中的標籤（Production 還是 Preview）

