# Vercel 問題排查完整指南

## 目錄

1. [Vercel 看不到 develop 分支](#問題1-vercel-看不到-develop-分支)
2. [Vercel 部署舊的 commit](#問題2-vercel-部署舊的-commit)
3. [常見問題解決](#常見問題解決)
4. [推薦設定](#推薦設定)

---

## 問題 1：Vercel 看不到 develop 分支

### 快速檢查清單

#### ✅ 步驟 1：確認 GitHub 分支存在

1. 前往 GitHub 倉庫：https://github.com/liouyuting112/multi-site-static-strapi-front
2. 點擊分支下拉選單（應該顯示 `main`）
3. 確認 `develop` 分支存在
4. 如果不存在，需要先創建並推送：
   ```bash
   git checkout -b develop
   git push origin develop
   ```

#### ✅ 步驟 2：檢查 Vercel 專案設定

1. **登入 Vercel**
   - 前往 https://vercel.com
   - 登入你的帳號

2. **進入專案**
   - 找到專案：`multi-site-static-strapi-front`
   - 點擊進入專案

3. **檢查 Git 設定**
   - 點擊頂部選單的 **Settings**
   - 在左側選單找到 **Git**
   - 檢查以下設定：
     - **Production Branch**: 應該設定為 `develop`（或你想要的分支）
     - **Preview Branches**: 應該包含 `develop` 和 `main`

#### ✅ 步驟 3：檢查 Deployments 頁面

1. 在 Vercel 專案中，點擊 **Deployments** 標籤
2. 查看是否有 `develop` 分支的部署記錄
3. 如果沒有，可能需要：
   - 推送一個新的 commit 到 `develop` 分支
   - 或手動觸發部署

#### ✅ 步驟 4：手動觸發部署

如果設定正確但還是沒有部署，可以手動觸發：

1. 在 Vercel 專案中，點擊 **Deployments**
2. 點擊右上角的 **Create Deployment**
3. 選擇：
   - **Branch**: `develop`
   - **Framework Preset**: `Other`
   - **Root Directory**: `./`
   - **Build Command**: 留空
   - **Output Directory**: 留空
4. 點擊 **Deploy**

---

## 問題 2：Vercel 部署舊的 commit

### 情況說明

從你的截圖可以看到：
- **Vercel 部署的 commit**: `5ff1ef7 Initial upload of all project content from local directory`
- **develop 分支最新 commit**: `47fd2af Fix: Use dev Strapi for preview environments`

這表示 Vercel 部署的是舊的 commit，而不是最新的。

### 可能的原因

#### 1. Vercel 還沒有檢測到新的 commit

**解決方法：**
- 等待 1-3 分鐘讓 Vercel 自動檢測
- 或手動觸發部署

#### 2. Vercel 部署了錯誤的 commit

**解決方法：**
- 在 Vercel 後台手動觸發新的部署
- 選擇正確的 commit

#### 3. GitHub 推送有問題

**檢查步驟：**
```bash
# 確認本地 develop 分支有最新 commit
git log develop -1

# 確認遠端 develop 分支有最新 commit
git log origin/develop -1

# 如果不同，重新推送
git push origin develop
```

### 解決步驟

#### 步驟 1：確認 GitHub 上的 commit

1. 前往 GitHub：https://github.com/liouyuting112/multi-site-static-strapi-front/tree/develop
2. 確認最新的 commit 是 `47fd2af Fix: Use dev Strapi for preview environments`
3. 確認這個 commit 包含了修改的 `home-cms.js` 等檔案

#### 步驟 2：手動觸發 Vercel 部署

1. **登入 Vercel**：https://vercel.com
2. **進入專案**：`multi-site-static-strapi-front`
3. **點擊 Deployments**
4. **點擊右上角的 Create Deployment**
5. **選擇**：
   - Branch: `develop`
   - Commit: 選擇最新的 commit `47fd2af`
6. **點擊 Deploy**

#### 步驟 3：檢查部署狀態

部署完成後，確認：
- 部署的 commit 是 `47fd2af`
- 部署狀態是 **Ready**（綠色）
- 訪問網站測試是否使用開發環境的 Strapi

### 驗證

部署完成後，訪問預覽網址並打開 Console，應該會看到：

```
🔍 檢測環境，hostname: multi-site-static-strapi-front-bu4ydt91h.vercel.app
📍 STRAPI_URL (動態): https://growing-dawn-18cd7440ad.strapiapp.com
✅ 使用開發環境 Strapi
```

---

## 常見問題解決

### 問題 1：Vercel 只顯示 main 分支

**解決方法：**
1. 進入 Vercel 專案設定 → Git
2. 將 **Production Branch** 改為 `develop`
3. 在 **Preview Branches** 中勾選 `develop`
4. 儲存設定
5. 推送一個新的 commit 到 `develop` 分支觸發部署

### 問題 2：修改設定後還是沒有部署

**解決方法：**
1. 確認 GitHub 上 `develop` 分支確實有內容
2. 推送一個新的 commit：
   ```bash
   git checkout develop
   echo "# Update" >> README.md
   git add .
   git commit -m "Trigger Vercel deployment"
   git push origin develop
   ```
3. 等待 1-2 分鐘，Vercel 應該會自動檢測並部署

### 問題 3：Vercel 顯示 "No deployments"

**解決方法：**
1. 檢查 Vercel 是否正確連接到 GitHub 倉庫
2. 在 Vercel 設定 → Git 中，確認：
   - **Repository**: 正確的 GitHub 倉庫
   - **Production Branch**: 正確的分支名稱
3. 如果連接有問題，可能需要重新連接：
   - 刪除現有專案（注意：會刪除部署歷史）
   - 重新導入專案

### 問題 4：部署成功但網站無法訪問

**檢查項目：**
1. 確認部署狀態是 **Ready**（不是 Building 或 Error）
2. 檢查部署日誌，看是否有錯誤
3. 確認網站路徑正確：
   - 多站點結構：`https://你的域名.vercel.app/site1/index.html`
   - 不是：`https://你的域名.vercel.app/`（根目錄可能沒有 index.html）

---

## 推薦設定

### 最佳實踐設定

在 Vercel 專案設定中：

**Git 設定：**
- **Production Branch**: `develop`
- **Preview Branches**: 勾選 `main`, `develop`

**Build & Development Settings：**
- **Framework Preset**: `Other`
- **Root Directory**: `./`
- **Build Command**: 留空
- **Output Directory**: 留空
- **Install Command**: 留空

**Environment Variables：**
- 如果需要，可以設定環境變數（例如 Strapi URL）

### 驗證步驟

完成設定後，驗證是否成功：

1. **推送 commit 到 develop 分支**
   ```bash
   git checkout develop
   git add .
   git commit -m "Test deployment"
   git push origin develop
   ```

2. **檢查 Vercel Deployments**
   - 1-2 分鐘後，應該會看到新的部署記錄
   - 部署狀態應該是 **Ready**

3. **訪問網站**
   - 點擊部署記錄中的 **Visit** 按鈕
   - 或使用專案的預設網址

---

## 如果還是不行

請提供以下資訊：
1. Vercel 專案的 Git 設定截圖
2. Deployments 頁面的截圖
3. GitHub 分支列表截圖
4. 任何錯誤訊息
5. GitHub develop 分支的最新 commit hash
6. Vercel 部署頁面顯示的 commit hash
7. 兩者是否一致

這樣我可以更準確地幫你解決問題。

