# Vercel 分支設定說明

## 問題：Vercel 只抓到 main 分支，沒有抓到 develop 分支

## 解決方法

### 方法一：在 Vercel 專案設定中修改（推薦）

1. **登入 Vercel**
   - 前往 https://vercel.com
   - 登入你的帳號

2. **進入專案設定**
   - 點擊你的專案名稱
   - 點擊頂部選單的 **Settings**

3. **修改 Git 設定**
   - 在左側選單找到 **Git**
   - 找到 **Production Branch** 設定
   - 將 `main` 改為 `develop`
   - 點擊 **Save**

4. **設定預覽分支（可選）**
   - 在 **Git** 設定中，找到 **Preview Branches**
   - 可以設定哪些分支會自動部署預覽
   - 建議設定：`develop`, `main`（這樣兩個分支都會自動部署）

### 方法二：使用 vercel.json 設定

在專案根目錄創建 `vercel.json` 檔案：

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

然後重新部署專案。

### 方法三：重新連接 GitHub 專案

如果上述方法無效，可以嘗試重新連接：

1. **刪除現有專案（注意：這會刪除部署歷史）**
   - 進入專案設定
   - 滾動到底部
   - 點擊 **Delete Project**

2. **重新導入專案**
   - 點擊 **Add New Project**
   - 選擇你的 GitHub 倉庫
   - 在設定頁面中：
     - **Production Branch**: 選擇 `develop`
     - **Preview Branches**: 可以選擇 `main` 和 `develop`
   - 點擊 **Deploy**

### 方法四：使用 Vercel CLI

如果你有安裝 Vercel CLI：

```bash
# 安裝 Vercel CLI（如果還沒安裝）
npm i -g vercel

# 登入 Vercel
vercel login

# 連結專案
vercel link

# 設定生產分支
vercel env pull .env.local
```

然後在 Vercel 網頁後台設定分支。

## 檢查步驟

### 1. 確認 GitHub 分支存在

```bash
# 檢查本地分支
git branch -a

# 確認 develop 分支已推送到 GitHub
git push origin develop
```

### 2. 確認 Vercel 設定

在 Vercel 專案設定中檢查：
- **Production Branch** 是否為 `develop`
- **Preview Branches** 是否包含 `develop`

### 3. 觸發部署

修改設定後，可以：
- 推送新的 commit 到 `develop` 分支
- 或在 Vercel 後台手動觸發部署

## 常見問題

### Q: 修改設定後還是沒有部署 develop 分支？

**A:** 嘗試以下步驟：
1. 確認 GitHub 倉庫中 `develop` 分支確實存在
2. 推送一個新的 commit 到 `develop` 分支觸發部署
3. 檢查 Vercel 的 **Deployments** 頁面，看看是否有 `develop` 分支的部署記錄

### Q: 想要同時部署 main 和 develop？

**A:** 在 Vercel 設定中：
- **Production Branch**: 設定為 `develop`（正式環境）
- **Preview Branches**: 設定包含 `main`（預覽環境）

這樣 `develop` 會部署到正式網址，`main` 會部署到預覽網址。

### Q: 如何查看當前 Vercel 專案使用的分支？

**A:** 
1. 進入 Vercel 專案
2. 點擊 **Deployments**
3. 查看最新的部署記錄，會顯示使用的分支名稱

## 推薦設定

### 開發環境流程

```
開發 → develop 分支 → Vercel 正式環境
測試 → main 分支 → Vercel 預覽環境
```

### 設定步驟

1. **Vercel 專案設定**
   - Production Branch: `develop`
   - Preview Branches: `main`, `develop`

2. **GitHub 工作流程**
   - 開發時推送到 `develop`
   - 測試完成後合併到 `main`
   - 兩者都會自動部署

3. **腳本設定**
   - 開發環境使用 `develop` 分支
   - 測試環境使用 `main` 分支

## 注意事項

⚠️ **重要提醒：**
- 修改 Production Branch 後，現有的正式網址會指向新的分支
- 如果 `develop` 分支還沒有內容，可能會導致網站無法訪問
- 建議先在 `develop` 分支推送內容，再修改設定


