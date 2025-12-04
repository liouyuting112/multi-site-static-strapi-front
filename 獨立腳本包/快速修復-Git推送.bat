@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 快速修復 Git 推送問題
echo ========================================
echo.

set /p WORK_DIR="請輸入工作目錄路徑（包含網站資料夾的目錄）: "

if not exist "!WORK_DIR!" (
    echo ❌ 目錄不存在
    pause
    exit /b 1
)

cd /d "!WORK_DIR!"

echo.
echo 📍 當前目錄：%CD%
echo.

:: 檢查是否為 Git 倉庫
git rev-parse --git-dir >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  不是 Git 倉庫，正在初始化...
    git init
    git branch -M main
)

:: 檢查遠端倉庫
git remote get-url origin >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set /p GITHUB_URL="請輸入 GitHub 倉庫 URL: "
    git remote add origin "!GITHUB_URL!"
) else (
    echo ✅ 遠端倉庫已設定
    git remote get-url origin
)

echo.
echo 📤 檢查變更...
git status --short

echo.
set /p ADD_ALL="是否加入所有變更？(Y/N): "
if /i "!ADD_ALL!"=="Y" (
    git add .
    echo ✅ 已加入所有變更
)

echo.
echo 📝 檢查是否有變更需要 commit...
git status --short | findstr /R "." >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    set /p COMMIT_MSG="請輸入 commit 訊息（預設：更新網站）: "
    if "!COMMIT_MSG!"=="" set COMMIT_MSG=更新網站
    git commit -m "!COMMIT_MSG!"
    if %ERRORLEVEL% EQU 0 (
        echo ✅ Commit 成功
    ) else (
        echo ❌ Commit 失敗
        pause
        exit /b 1
    )
) else (
    echo ⚠️  沒有變更需要 commit
)

echo.
echo 🚀 推送到 GitHub...
git branch
echo.

git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  推送失敗，嘗試設定上游分支...
    git push -u origin main
    
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo ❌ 推送失敗
        echo.
        echo 請檢查：
        echo 1. Git 使用者名稱和 Email 是否設定
        echo 2. GitHub 認證是否正確
        echo 3. 網路連線是否正常
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ✅ 推送成功！
echo.
pause


