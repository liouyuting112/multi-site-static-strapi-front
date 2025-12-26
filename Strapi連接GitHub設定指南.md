# Strapi 自託管後台連接 GitHub 倉庫 - 完整指南

## 📋 目錄
1. [整體架構說明](#1-整體架構說明)
2. [前置準備](#2-前置準備)
3. [設定 GitHub Repository](#3-設定-github-repository)
4. [設定匯出腳本](#4-設定匯出腳本)
5. [設定 N8N Workflow](#5-設定-n8n-workflow)
6. [設定 Strapi Webhook（可選）](#6-設定-strapi-webhook可選)
7. [測試與驗證](#7-測試與驗證)

---

## 1. 整體架構說明

### 流程圖
```
N8N 定時觸發
    ↓
生成文章到 Strapi (ai-generate-articles.cjs)
    ↓
匯出文章到 GitHub (export-strapi-to-github.cjs)
    ↓
Git Commit & Push
    ↓
GitHub Repository 更新
    ↓
(可選) GitHub Actions / Vercel 自動部署
```

### 兩種連接方式

**方式一：透過 N8N（推薦，你目前的方式）**
- ✅ 優點：統一管理，可以控制匯出時機
- ✅ 適合：自動生成文章的場景
- 流程：N8N → 生成文章 → 立即匯出到 GitHub

**方式二：透過 Strapi Webhook（可選）**
- ✅ 優點：即時反應，任何文章更新都會觸發
- ✅ 適合：手動在 Strapi 後台編輯文章的場景
- 流程：Strapi 後台操作 → Webhook → N8N → 匯出到 GitHub

---

## 2. 前置準備

### 2.1 確認本機環境

1. **Git 已安裝並設定**
   ```bash
   git --version
   git config --global user.name "你的名字"
   git config --global user.email "你的email"
   ```

2. **Node.js 已安裝**
   ```bash
   node --version
   ```

3. **本機資料夾已初始化為 Git Repository**
   ```bash
   cd "C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)"
   git init
   git remote add origin https://github.com/你的用戶名/你的倉庫名.git
   ```

### 2.2 準備 GitHub Personal Access Token

1. 前往 GitHub：https://github.com/settings/tokens
2. 點擊 **Generate new token (classic)**
3. 設定：
   - **Note**: `N8N Strapi Export`
   - **Expiration**: 選擇過期時間（建議 90 天或更長）
   - **Scopes**: 勾選 `repo`（完整權限）
4. 點擊 **Generate token**
5. **複製 Token**（只會顯示一次，請妥善保存）

---

## 3. 設定 GitHub Repository

### 3.1 建立 GitHub Repository

1. 前往 https://github.com/new
2. 建立新 Repository：
   - **Repository name**: `100-website`（或你喜歡的名稱）
   - **Description**: `靜態網站 - 多站點文章系統`
   - **Visibility**: Public 或 Private（根據需求）
   - **不要**勾選 "Initialize this repository with a README"
3. 點擊 **Create repository**

### 3.2 將本機資料夾推送到 GitHub

```bash
cd "C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)"

# 初始化 Git（如果還沒初始化）
git init

# 加入所有檔案
git add .

# 第一次 commit
git commit -m "Initial commit: 所有靜態網站檔案"

# 連接遠端倉庫
git remote add origin https://github.com/你的用戶名/你的倉庫名.git

# 推送到 GitHub
git push -u origin main
```

**注意**：如果遇到認證問題，可以使用 Personal Access Token：
```bash
git remote set-url origin https://你的Token@github.com/你的用戶名/你的倉庫名.git
```

---

## 4. 設定匯出腳本

### 4.1 確認腳本已建立

確認 `export-strapi-to-github.cjs` 檔案存在於專案根目錄。

### 4.2 測試腳本

```bash
# 測試匯出單一站點
node export-strapi-to-github.cjs sce010 2025-12-24 daily

# 測試匯出所有站點
node export-strapi-to-github.cjs all 2025-12-24 daily
```

### 4.3 設定環境變數（可選）

如果需要，可以在系統環境變數中設定：
- `GITHUB_REPO_PATH`: Git 倉庫路徑
- `GITHUB_AUTO_PUSH`: `true` 或 `false`（是否自動 push）

---

## 5. 設定 N8N Workflow

### 5.1 匯入更新後的 Workflow

1. 開啟 N8N：http://localhost:5678
2. 點擊 **Workflows** → **Import from File**
3. 選擇 `n8n-workflow.json`
4. 檢查所有節點設定

### 5.2 更新 Set Variables 節點

在 **Set Variables** 節點中，確認以下變數：

| Name | Value |
|------|-------|
| `GITHUB_REPO_PATH` | `C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)` |
| `GITHUB_AUTO_PUSH` | `true` |

### 5.3 確認 Execute Command 節點

**節點 1：生成文章**
- Command: `node`
- Arguments: `ai-generate-articles.cjs`
- Working Directory: 你的專案路徑

**節點 2：匯出到 GitHub**（新增）
- Command: `node`
- Arguments: `export-strapi-to-github.cjs`
- Working Directory: 你的專案路徑
- Environment Variables:
  - `SITES`: `={{ $json.SITES }}`
  - `DATE`: `={{ $json.DATE }}`
  - `CATEGORY`: `={{ $json.CATEGORY }}`
  - `STRAPI_URL`: `={{ $json.STRAPI_URL }}`
  - `STRAPI_TOKEN`: `={{ $json.STRAPI_TOKEN }}`
  - `GITHUB_REPO_PATH`: `={{ $json.GITHUB_REPO_PATH }}`
  - `GITHUB_AUTO_PUSH`: `={{ $json.GITHUB_AUTO_PUSH }}`

### 5.4 設定 Git 認證（如果需要）

如果 Git push 需要認證，有兩種方式：

**方式一：使用 Personal Access Token（推薦）**

在 Windows 上，可以設定 Git Credential Manager：
```bash
git config --global credential.helper manager-core
```

然後在第一次 push 時輸入：
- Username: 你的 GitHub 用戶名
- Password: 你的 Personal Access Token

**方式二：在 URL 中包含 Token**

修改 `export-strapi-to-github.cjs`，在 `gitPush` 函數中加入：
```javascript
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (GITHUB_TOKEN) {
    execSync(`git remote set-url origin https://${GITHUB_TOKEN}@github.com/你的用戶名/你的倉庫名.git`);
}
```

然後在 N8N 的環境變數中加入 `GITHUB_TOKEN`。

---

## 6. 設定 Strapi Webhook（可選）

如果你希望「手動在 Strapi 後台編輯文章時，也自動同步到 GitHub」，可以設定 Webhook。

### 6.1 在 N8N 建立 Webhook 節點

1. 在 N8N 建立新的 Workflow
2. 拖曳 **Webhook** 節點
3. 設定：
   - **HTTP Method**: `POST`
   - **Path**: `strapi-webhook`
   - **Response Mode**: `Response Node`

### 6.2 在 Strapi 設定 Webhook

1. 登入 Strapi 後台：http://localhost:1337/admin
2. 前往 **Settings** → **Webhooks**
3. 點擊 **Create new webhook**
4. 設定：
   - **Name**: `Sync to GitHub`
   - **URL**: `http://localhost:5678/webhook/strapi-webhook`（或你的 N8N URL）
   - **Events**: 勾選
     - ✅ `Entry create`
     - ✅ `Entry update`
     - ✅ `Entry delete`
   - **Headers**（可選）:
     ```json
     {
       "Content-Type": "application/json"
     }
     ```
5. 點擊 **Save**

### 6.3 在 N8N 處理 Webhook

在 Webhook 節點後，加入：
1. **Set** 節點：解析 Strapi 傳來的資料
2. **Execute Command** 節點：執行 `export-strapi-to-github.cjs`

---

## 7. 測試與驗證

### 7.1 測試匯出腳本

```bash
# 測試單一站點
node export-strapi-to-github.cjs sce010 2025-12-24 daily

# 檢查檔案是否生成
dir "星宿探索家sce010\articles"
```

### 7.2 測試 Git 操作

```bash
# 檢查 Git 狀態
git status

# 手動測試 commit 和 push
git add .
git commit -m "Test: 測試匯出"
git push
```

### 7.3 測試完整 N8N Workflow

1. 在 N8N 中手動執行 Workflow
2. 檢查每個節點的輸出
3. 確認 GitHub Repository 有更新

### 7.4 驗證 GitHub Repository

1. 前往你的 GitHub Repository
2. 檢查檔案是否正確上傳
3. 檢查 commit 記錄

---

## 8. 常見問題

### Q1: Git push 失敗，提示認證錯誤

**解決方案：**
- 確認 Personal Access Token 有效
- 使用 Token 作為密碼（不是 GitHub 密碼）
- 或使用 SSH Key 認證

### Q2: 找不到站點資料夾

**解決方案：**
- 檢查 `export-strapi-to-github.cjs` 中的 `findSiteFolder` 函數
- 確認資料夾名稱與 Strapi 中的 `site` 欄位匹配
- 可以在腳本中加入更多可能的資料夾名稱格式

### Q3: HTML 檔案格式不對

**解決方案：**
- 檢查現有 HTML 檔案的結構
- 調整 `getArticleTemplate` 函數以符合你的範本格式
- 可以參考 `通用上傳腳本.cjs` 中的 HTML 處理邏輯

### Q4: N8N 執行失敗

**解決方案：**
- 檢查 N8N 執行日誌
- 確認所有環境變數正確設定
- 確認 Node.js 路徑正確
- 確認檔案路徑正確（Windows 路徑格式）

---

## 9. 進階設定

### 9.1 只匯出特定日期範圍的文章

修改 `export-strapi-to-github.cjs`，加入日期範圍過濾。

### 9.2 自動觸發 GitHub Actions

在 GitHub Repository 中建立 `.github/workflows/deploy.yml`，當有新的 commit 時自動部署。

### 9.3 備份機制

定期備份 Strapi 資料庫和 GitHub Repository。

---

## 10. 安全建議

1. **不要將 Token 寫在程式碼中**
   - 使用環境變數
   - 使用 N8N Credentials

2. **限制 Webhook 訪問**
   - 使用認證
   - 限制 IP 範圍

3. **定期更新 Token**
   - 設定過期提醒
   - 定期輪換

---

## 需要幫助？

如果遇到問題，請檢查：
- N8N 執行日誌
- Node.js 腳本輸出
- Git 操作日誌
- GitHub Repository 狀態


