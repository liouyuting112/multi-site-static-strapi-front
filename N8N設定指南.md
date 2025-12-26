# N8N 自動化文章生成與 GitHub 同步 - 完整設定指南

## 📋 目錄
1. [N8N 安裝](#1-n8n-安裝)
2. [Workflow 建立](#2-workflow-建立)
3. [節點詳細設定](#3-節點詳細設定)
4. [GitHub 連接設定](#4-github-連接設定)
5. [環境變數設定](#5-環境變數設定)
6. [測試與執行](#6-測試與執行)
7. [進階設定](#7-進階設定)

---

## 1. N8N 安裝

### Windows 安裝方式

#### 方法 1：使用 npm（推薦）
```bash
npm install n8n -g
n8n start
```

#### 方法 2：使用 Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

#### 方法 3：下載桌面版
前往 https://n8n.io/download/ 下載 Windows 版本

### 啟動 N8N
安裝完成後，打開瀏覽器訪問：`http://localhost:5678`

---

## 2. Workflow 建立

### 建立新 Workflow
1. 登入 N8N
2. 點擊左側選單的 **Workflows**
3. 點擊 **+ Add workflow**
4. 命名為：`AI 自動生成文章`

---

## 3. 節點詳細設定

### 節點 1：Schedule Trigger（定時觸發）

**功能：** 設定自動執行的時間

**設定步驟：**
1. 從左側拖曳 **Schedule Trigger** 節點到畫布
2. 點擊節點進行設定：

**設定內容：**
```json
{
  "rule": {
    "interval": [
      {
        "field": "hours",
        "hoursInterval": 1
      }
    ]
  },
  "triggerAtHour": 9,
  "triggerAtMinute": 0
}
```

**說明：**
- `hoursInterval: 1` = 每 1 小時執行一次
- `triggerAtHour: 9` = 每天 9 點執行
- `triggerAtMinute: 0` = 整點執行

**其他常用設定：**
- **每天執行一次：** `"interval": [{"field": "days", "daysInterval": 1}]`
- **每週執行一次：** `"interval": [{"field": "weeks", "weeksInterval": 1}]`
- **每月執行一次：** `"interval": [{"field": "months", "monthsInterval": 1}]`

---

### 節點 2：Set（設定變數）

**功能：** 設定要傳給腳本的參數

**設定步驟：**
1. 從左側拖曳 **Set** 節點到畫布
2. 連接到 Schedule Trigger
3. 點擊節點進行設定

**設定內容：**

在 **Values to Set** 區域，點擊 **Add Value** 加入以下變數：

**方式一：按網站選擇（傳統方式）**

| Name | Type | Value |
|------|------|-------|
| `SITES` | String | `sce010,site1,cds006` |
| `SELECTION_TYPE` | String | `sites` |
| `DATE` | Expression | `{{ $now.format('YYYY-MM-DD') }}` |
| `COUNT` | Number | `1` |
| `CATEGORY` | String | `daily` |
| `STRAPI_URL` | String | `http://localhost:1337` |
| `STRAPI_TOKEN` | String | `6a02dd00859ce2861a884a1de0b5f7eaf4ee961b0e6bf0c07c7df72d47e1c9b142a07564ffadd433ffa9b851d14629989b07d72fb09457d775f3227cca99fbaee43200ccac7a0db7d6d65185ca71b317bae9d6c0db943abb50a9e3ed9f279e536c2acba98e2f642bb44f543d1c23fac24a131ec177f23d2d496715b9c5984c76` |
| `GEMINI_API_KEY` | String | `你的Gemini API Key` |
| `PROMPT_FILE` | String | `C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)\下載\新增文章提詞.txt` |
| `OUTPUT_JSON` | String | `true` |

**方式二：按主題選擇（新功能）**

| Name | Type | Value |
|------|------|-------|
| `THEMES` | String | `星座,占星,運勢` |
| `SELECTION_TYPE` | String | `themes` |
| `DATE` | Expression | `{{ $now.format('YYYY-MM-DD') }}` |
| `COUNT` | Number | `1` |
| `CATEGORY` | String | `daily` |
| `STRAPI_URL` | String | `http://localhost:1337` |
| `STRAPI_TOKEN` | String | `6a02dd00859ce2861a884a1de0b5f7eaf4ee961b0e6bf0c07c7df72d47e1c9b142a07564ffadd433ffa9b851d14629989b07d72fb09457d775f3227cca99fbaee43200ccac7a0db7d6d65185ca71b317bae9d6c0db943abb50a9e3ed9f279e536c2acba98e2f642bb44f543d1c23fac24a131ec177f23d2d496715b9c5984c76` |
| `GEMINI_API_KEY` | String | `你的Gemini API Key` |
| `PROMPT_FILE` | String | `C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)\下載\新增文章提詞.txt` |
| `OUTPUT_JSON` | String | `true` |

**重要說明：**
- `SITES`: 可以設定為 `all`（所有站點）或指定站點（逗號分隔）
- `THEMES`: 指定主題（逗號分隔），例如：`星座,占星,運勢`
- `SELECTION_TYPE`: 選擇 `sites`（按網站）或 `themes`（按主題）
- `DATE`: 使用 Expression 自動取得今天日期
- `STRAPI_TOKEN`: 已更新為你的 Token
- `GEMINI_API_KEY`: 從 Google AI Studio 取得

**動態設定範例：**
如果你想讓 N8N 可以選擇站點或主題，可以這樣設定：
- `SITES`: Expression → `{{ $json.sites || 'all' }}`
- `THEMES`: Expression → `{{ $json.themes || '' }}`
- `SELECTION_TYPE`: Expression → `{{ $json.selectionType || 'sites' }}`
- 這樣可以從前一個節點傳入參數

---

### 節點 3：Execute Command（執行腳本）

**功能：** 執行 Node.js 腳本

**設定步驟：**
1. 從左側拖曳 **Execute Command** 節點到畫布
2. 連接到 Set 節點
3. 點擊節點進行設定

**設定內容：**

**Command:**
```bash
node
```

**Arguments:**
```
ai-generate-articles.cjs
```

**Working Directory:**
```
C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)
```

**Environment Variables:**
點擊 **Add Environment Variable**，加入以下環境變數：

| Name | Value |
|------|-------|
| `SITES` | `{{ $json.SITES }}` |
| `THEMES` | `{{ $json.THEMES }}` |
| `SELECTION_TYPE` | `{{ $json.SELECTION_TYPE }}` |
| `DATE` | `{{ $json.DATE }}` |
| `COUNT` | `{{ $json.COUNT }}` |
| `CATEGORY` | `{{ $json.CATEGORY }}` |
| `STRAPI_URL` | `{{ $json.STRAPI_URL }}` |
| `STRAPI_TOKEN` | `{{ $json.STRAPI_TOKEN }}` |
| `GEMINI_API_KEY` | `{{ $json.GEMINI_API_KEY }}` |
| `PROMPT_FILE` | `{{ $json.PROMPT_FILE }}` |
| `OUTPUT_JSON` | `{{ $json.OUTPUT_JSON }}` |

**說明：**
- `{{ $json.變數名 }}` 會從前一個 Set 節點取得值
- 環境變數會自動傳給 Node.js 腳本

---

### 節點 4：IF（條件判斷 - 可選）

**功能：** 判斷執行是否成功

**設定步驟：**
1. 從左側拖曳 **IF** 節點到畫布
2. 連接到 Execute Command
3. 點擊節點進行設定

**設定內容：**

**Condition:**
```
{{ $json.exitCode === 0 }}
```

**說明：**
- `exitCode === 0` 表示腳本執行成功
- 可以根據結果決定是否執行後續動作（如發送通知）

---

### 節點 7：Slack / Email（通知 - 可選）

**功能：** 發送執行結果通知

**設定步驟：**
1. 從左側拖曳 **Slack** 或 **Email** 節點
2. 連接到 IF 節點
3. 設定通知內容

**Slack 通知範例：**
```
✅ 文章生成並同步到 GitHub 完成！
日期: {{ $json.DATE }}
站點: {{ $json.SITES }}
生成數量: {{ $json.COUNT }}
```

---

## 4. GitHub 連接設定

### 4.1 準備 GitHub Repository

1. **建立 GitHub Repository**
   - 前往 https://github.com/new
   - 建立新 Repository（例如：`100-website`）

2. **初始化本機 Git Repository**
   ```bash
   cd "C:\Users\yyutingliu\Downloads\AI生成網站測試\cursor\一個主題多個站(落地)"
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/你的用戶名/你的倉庫名.git
   git push -u origin main
   ```

3. **取得 GitHub Personal Access Token**
   - 前往 https://github.com/settings/tokens
   - 點擊 **Generate new token (classic)**
   - 勾選 `repo` 權限
   - 複製 Token

### 4.2 設定 Git 認證

**方式一：使用 Git Credential Manager（推薦）**
```bash
git config --global credential.helper manager-core
```

第一次 push 時會提示輸入：
- Username: 你的 GitHub 用戶名
- Password: 你的 Personal Access Token（不是 GitHub 密碼）

**方式二：在 URL 中包含 Token**
```bash
git remote set-url origin https://你的Token@github.com/你的用戶名/你的倉庫名.git
```

### 4.3 測試匯出腳本

```bash
# 測試單一站點
node export-strapi-to-github.cjs sce010 2025-12-24 daily

# 檢查檔案是否生成
dir "星宿探索家sce010\articles"
```

---

## 5. 環境變數設定（進階）

### 在 N8N 中設定全域環境變數

1. 點擊右上角 **Settings** → **Environment Variables**
2. 新增以下變數：

| Variable Name | Value |
|---------------|-------|
| `STRAPI_URL` | `http://localhost:1337` |
| `STRAPI_TOKEN` | `你的Token` |
| `GEMINI_API_KEY` | `你的API Key` |

3. 在 Set 節點中，可以直接使用 `{{ $env.STRAPI_TOKEN }}`

**優點：**
- 不需要在每個 Workflow 中重複設定
- 更安全（不會顯示在 Workflow 中）

---

## 6. 測試與執行

### 測試步驟

1. **手動觸發測試**
   - 點擊右上角 **Execute Workflow**
   - 檢查每個節點的輸出

2. **檢查 Execute Command 節點輸出**
   - 應該看到腳本的執行日誌
   - 確認環境變數正確傳入

3. **檢查 Strapi 後台**
   - 登入 `http://localhost:1337/admin`
   - 確認新文章已建立

4. **啟用排程**
   - 點擊右上角的 **Active** 開關
   - Workflow 會根據 Schedule Trigger 自動執行

---

## 7. 進階設定

### 6.1 動態選擇站點

**建立一個 Webhook 節點：**
1. 拖曳 **Webhook** 節點
2. 設定 **HTTP Method:** `POST`
3. 設定 **Path:** `generate-articles`

**在 Set 節點中：**
```json
{
  "SITES": "{{ $json.body.sites || 'all' }}",
  "DATE": "{{ $json.body.date || $now.format('YYYY-MM-DD') }}",
  "COUNT": "{{ $json.body.count || 1 }}"
}
```

**使用方式：**
```bash
curl -X POST http://localhost:5678/webhook/generate-articles \
  -H "Content-Type: application/json" \
  -d '{
    "sites": "sce010,site1",
    "date": "2025-12-24",
    "count": 2
  }'
```

### 6.2 批次處理多個站點

**使用 Loop 節點：**
1. 拖曳 **Split In Batches** 節點
2. 設定 **Batch Size:** `5`（每次處理 5 個站點）
3. 在 Execute Command 中處理每個批次

### 6.3 錯誤處理

**加入 Error Trigger：**
1. 拖曳 **Error Trigger** 節點
2. 連接到可能出錯的節點
3. 設定錯誤通知（Email/Slack）

### 6.4 記錄執行歷史

**使用 Database 節點：**
1. 連接資料庫（MySQL/PostgreSQL）
2. 記錄每次執行的結果
3. 可以查詢歷史記錄

---

## 8. 完整 Workflow 流程圖

```
Schedule Trigger
    ↓
Set (設定變數)
    ↓
Execute Command (生成文章到 Strapi)
    ↓
IF (判斷成功/失敗)
    ├─ True → Execute Command (匯出到 GitHub)
    │            ↓
    │         Git Add & Commit & Push
    │            ↓
    │         GitHub Repository 更新
    └─ False → Email/Slack (發送錯誤通知)
```

---

## 9. 常見問題

### Q1: Execute Command 找不到 node
**解決方案：**
- 確認 Node.js 已安裝並在 PATH 中
- 或在 Command 中使用完整路徑：`C:\Program Files\nodejs\node.exe`

### Q2: 環境變數沒有傳入
**解決方案：**
- 檢查 Set 節點的變數名稱是否正確
- 確認 Execute Command 中的環境變數設定正確

### Q3: Strapi 連線失敗
**解決方案：**
- 確認 Strapi 正在運行
- 檢查 Token 是否有效
- 確認 URL 正確

### Q4: 腳本執行但沒有生成文章
**解決方案：**
- 檢查 Execute Command 的輸出日誌
- 確認腳本路徑正確
- 檢查 Strapi 後台是否有錯誤

---

## 10. 安全建議

1. **不要將 Token/API Key 直接寫在 Workflow 中**
   - 使用環境變數
   - 使用 N8N 的 Credentials 功能

2. **限制 Webhook 訪問**
   - 使用認證
   - 限制 IP 範圍

3. **定期更新 Token**
   - 設定 Token 過期提醒
   - 使用 N8N 的排程功能自動更新

---

## 11. 下一步

完成設定後，你可以：
1. ✅ 測試單一站點生成
2. ✅ 測試多站點批量生成
3. ✅ 設定自動排程
4. ✅ 整合 GitHub Webhook
5. ✅ 設定通知機制

---

## 需要幫助？

如果遇到問題，請檢查：
- N8N 執行日誌
- Node.js 腳本輸出
- Strapi 後台日誌
- 環境變數設定

