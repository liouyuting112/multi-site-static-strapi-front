# Vercel 環境與分支對應說明

## 環境與分支的對應關係

### 基本概念

在 Vercel 中，你可以設定不同的**環境（Environments）**來追蹤不同的**分支（Branches）**：

```
環境（Environment） ← 追蹤 → 分支（Branch）
```

## 推薦設定

### 方案一：開發環境 = develop 分支，正式環境 = main 分支

**設定步驟：**

1. **Production 環境**
   - 追蹤分支：`main`
   - 用途：正式上線環境
   - 網址：`https://multi-site-static-strapi-front.vercel.app`

2. **Preview 環境**
   - 追蹤分支：`develop`（或其他開發分支）
   - 用途：開發測試環境
   - 網址：`https://multi-site-static-strapi-front-git-develop-你的帳號.vercel.app`

### 方案二：開發環境 = develop 分支，正式環境 = develop 分支（你目前的設定）

**設定步驟：**

1. **Production 環境**
   - 追蹤分支：`develop`
   - 用途：正式上線環境（使用 develop 分支）
   - 網址：`https://multi-site-static-strapi-front.vercel.app`

2. **Preview 環境**
   - 追蹤分支：`main`（或其他分支）
   - 用途：預覽/測試環境
   - 網址：預覽網址

## 如何切換環境

### 方法一：透過 Vercel 後台切換

1. **進入 Environments 設定**
   - Vercel 專案 → Settings → Environments

2. **修改 Production 環境的分支**
   - 點擊 **Production**
   - 在 **Branch Tracking** 中修改分支
   - 點擊 **Save**

3. **修改 Preview 環境的分支**
   - 點擊 **Preview**
   - 在 **Branch Tracking** 中設定要追蹤的分支
   - 點擊 **Save**

### 方法二：透過推送分支自動切換

當你推送不同的分支到 GitHub 時：

- **推送 `develop` 分支** → 如果 Production 追蹤 `develop`，會自動部署到 Production 環境
- **推送 `main` 分支** → 如果 Preview 追蹤 `main`，會自動部署到 Preview 環境

## 如何查看不同環境的網站

### 查看 Production 環境

1. 進入 Vercel 專案
2. 點擊 **Deployments**
3. 找到 Production 環境的部署記錄（通常是最新的）
4. 點擊 **Visit** 按鈕
5. 或直接訪問：`https://multi-site-static-strapi-front.vercel.app`

### 查看 Preview 環境

1. 進入 Vercel 專案
2. 點擊 **Deployments**
3. 找到 Preview 環境的部署記錄（會顯示分支名稱）
4. 點擊 **Visit** 按鈕
5. 或使用預覽網址

## 實際操作範例

### 場景：開發新功能

1. **開發階段**
   - 在 `develop` 分支開發
   - 推送到 GitHub：`git push origin develop`
   - Vercel 自動部署到 Preview 環境（如果 Preview 追蹤 `develop`）
   - 訪問 Preview 網址測試

2. **測試完成後**
   - 合併到 `main` 分支
   - 推送到 GitHub：`git push origin main`
   - Vercel 自動部署到 Production 環境（如果 Production 追蹤 `main`）
   - 正式環境更新

### 場景：快速切換環境

如果你想快速切換 Production 環境追蹤的分支：

1. **切換到 develop 分支**
   - Vercel → Settings → Environments → Production
   - Branch Tracking 改為 `develop`
   - Save
   - 推送到 `develop` 分支會自動部署到 Production

2. **切換回 main 分支**
   - Vercel → Settings → Environments → Production
   - Branch Tracking 改為 `main`
   - Save
   - 推送到 `main` 分支會自動部署到 Production

## 推薦工作流程

### 開發流程

```
開發 → develop 分支 → Preview 環境（測試）
  ↓
測試完成
  ↓
合併 → main 分支 → Production 環境（正式）
```

### Vercel 設定

- **Production 環境**：追蹤 `main` 分支
- **Preview 環境**：追蹤 `develop` 分支（或其他開發分支）

## 快速檢查清單

- [ ] Production 環境追蹤哪個分支？
- [ ] Preview 環境追蹤哪些分支？
- [ ] 知道如何查看 Production 環境的網站
- [ ] 知道如何查看 Preview 環境的網站
- [ ] 了解推送分支會自動觸發哪個環境的部署

## 常見問題

### Q: 如何同時查看開發和正式環境？

**A:** 
- Production 環境：訪問正式網址
- Preview 環境：訪問預覽網址（在 Deployments 頁面找到）

### Q: 推送分支後多久會部署？

**A:** 通常 1-3 分鐘內會自動開始部署

### Q: 可以同時有多個環境追蹤同一個分支嗎？

**A:** 可以，但不建議。建議一個分支對應一個環境。

### Q: 如何知道當前 Production 環境追蹤哪個分支？

**A:** 
- Settings → Environments → Production
- 查看 Branch Tracking 設定


