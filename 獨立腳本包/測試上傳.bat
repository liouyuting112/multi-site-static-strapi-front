@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 測試上傳腳本（單網站測試）
echo ========================================
echo.

:: 檢查環境
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安裝
    pause
    exit /b 1
)
echo ✅ Node.js 已安裝

git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git 未安裝
    pause
    exit /b 1
)
echo ✅ Git 已安裝

echo.
echo ========================================
echo 設定
echo ========================================
echo.

:: 預設值
set GITHUB_URL=https://github.com/liouyuting112/static-sites-monorepo-1
set GITHUB_BRANCH=main
set STRAPI_URL=https://effortless-whisper-83765d99df.strapiapp.com

echo 📍 GitHub 倉庫（預設值）
echo    預設值：!GITHUB_URL!
set /p GITHUB_URL="GitHub 倉庫 URL（直接按 Enter 使用預設值）: "
if "!GITHUB_URL!"=="" (
    set GITHUB_URL=https://github.com/liouyuting112/static-sites-monorepo-1
    echo    使用預設值：!GITHUB_URL!
)

set /p GITHUB_BRANCH="分支名稱（預設：main）: "
if "!GITHUB_BRANCH!"=="" set GITHUB_BRANCH=main

echo.
echo 📍 Strapi 後台（預設值）
echo    預設值：!STRAPI_URL!
set /p STRAPI_URL="Strapi URL（直接按 Enter 使用預設值）: "
if "!STRAPI_URL!"=="" (
    set STRAPI_URL=https://effortless-whisper-83765d99df.strapiapp.com
    echo    使用預設值：!STRAPI_URL!
)

echo.
echo 📍 請輸入網站資料夾路徑
set /p SITE_FOLDER="網站資料夾路徑: "

if not exist "!SITE_FOLDER!" (
    echo ❌ 資料夾不存在：!SITE_FOLDER!
    pause
    exit /b 1
)

for %%F in ("!SITE_FOLDER!") do set SITE_NAME=%%~nxF
echo ✅ 網站名稱：!SITE_NAME!

echo.
echo ========================================
echo 開始上傳
echo ========================================
echo.

cd /d "%~dp0"

:: 檢查腳本是否存在
if not exist "upload-site-to-strapi.js" (
    echo ❌ 找不到 upload-site-to-strapi.js
    echo    請確認腳本在：%~dp0
    pause
    exit /b 1
)

echo ✅ 找到上傳腳本
echo.

:: 設定環境變數並執行
set "STRAPI_URL=!STRAPI_URL!"
set "STRAPI_TOKEN="
node upload-site-to-strapi.js "!SITE_FOLDER!"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ 上傳成功！
) else (
    echo.
    echo ❌ 上傳失敗
)

echo.
pause
