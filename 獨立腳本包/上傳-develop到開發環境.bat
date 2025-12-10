@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 上傳 GitHub develop 分支到 Strapi 開發環境
echo ========================================
echo.

:: Strapi 開發環境設定
set STRAPI_URL=https://growing-dawn-18cd7440ad.strapiapp.com
set STRAPI_TOKEN=

echo 📍 Strapi 開發環境 URL: %STRAPI_URL%
echo.

if "%STRAPI_TOKEN%"=="" (
    echo ⚠️  請先設定 Strapi API Token
    set /p STRAPI_TOKEN="請輸入 Strapi API Token: "
    if "!STRAPI_TOKEN!"=="" (
        echo ❌ Strapi API Token 不能為空
        pause
        exit /b 1
    )
)

echo.
echo 📋 請確認以下設定：
echo    Strapi URL: %STRAPI_URL%
echo    GitHub 分支: develop
echo.
set /p CONFIRM="確認開始上傳？(Y/N，預設 Y): "
if /i "!CONFIRM!"=="" set CONFIRM=Y
if /i not "!CONFIRM!"=="Y" (
    echo 已取消
    pause
    exit /b 0
)

echo.
echo ========================================
echo [1/3] 檢查並下載 GitHub develop 分支
echo ========================================
echo.

set GITHUB_REPO=https://github.com/liouyuting112/multi-site-static-strapi-front.git
set BRANCH=develop
set TEMP_DIR=%TEMP%\strapi-upload-temp

:: 清理臨時目錄
if exist "!TEMP_DIR!" (
    echo 🗑️  清理舊的臨時目錄...
    rmdir /s /q "!TEMP_DIR!" 2>nul
)

:: 創建臨時目錄
mkdir "!TEMP_DIR!" 2>nul

echo 📥 正在克隆 GitHub develop 分支...
cd /d "!TEMP_DIR!"

git clone --depth 1 --branch %BRANCH% "!GITHUB_REPO!" repo 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 無法克隆 GitHub 倉庫
    echo    請確認：
    echo    1. 網路連線正常
    echo    2. GitHub 倉庫可以訪問
    echo    3. develop 分支存在
    pause
    exit /b 1
)

echo ✅ 成功下載 develop 分支
echo.

:: 回到專案目錄
cd /d "%~dp0"

echo ========================================
echo [2/3] 掃描網站資料夾
echo ========================================
echo.

set REPO_DIR=!TEMP_DIR!\repo
set SITE_FOLDERS=
set SITE_COUNT=0

for /d %%D in ("!REPO_DIR!\site*") do (
    if exist "%%D\index.html" (
        set CURRENT_NAME=%%~nxD
        echo ✅ 找到網站：!CURRENT_NAME!
        set SITE_FOLDERS=!SITE_FOLDERS! "%%D"
        set /a SITE_COUNT+=1
    )
)

if !SITE_COUNT! EQU 0 (
    echo ❌ 沒有找到任何網站資料夾
    pause
    exit /b 1
)

echo.
echo ✅ 找到 !SITE_COUNT! 個網站資料夾
echo.

echo ========================================
echo [3/3] 上傳到 Strapi 開發環境
echo ========================================
echo.

set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
if not exist "!UPLOAD_SCRIPT!" (
    echo ❌ 找不到上傳腳本
    pause
    exit /b 1
)

set PROCESSED_COUNT=0
set UPLOADED_COUNT=0
set FAILED_COUNT=0

for %%F in (!SITE_FOLDERS!) do (
    set CURRENT_FOLDER=%%F
    set CURRENT_FOLDER=!CURRENT_FOLDER:"=!
    
    for %%S in ("!CURRENT_FOLDER!") do set CURRENT_NAME=%%~nxS
    
    set /a PROCESSED_COUNT+=1
    echo.
    echo 📦 處理網站 !PROCESSED_COUNT!/!SITE_COUNT!：!CURRENT_NAME!
    echo    路徑：!CURRENT_FOLDER!
    echo.
    
    :: 設定環境變數
    set "STRAPI_MAX_LENGTH=10000"
    set "STRAPI_PAGE_MAX_LENGTH=50000"
    
    :: 執行上傳（透過環境變數傳遞 Strapi 設定）
    set STRAPI_URL=%STRAPI_URL%
    set STRAPI_TOKEN=%STRAPI_TOKEN%
    node "!UPLOAD_SCRIPT!" "!CURRENT_FOLDER!" !STRAPI_MAX_LENGTH! !STRAPI_PAGE_MAX_LENGTH!
    
    if %ERRORLEVEL% EQU 0 (
        set /a UPLOADED_COUNT+=1
        echo ✅ !CURRENT_NAME! 上傳成功
    ) else (
        set /a FAILED_COUNT+=1
        echo ❌ !CURRENT_NAME! 上傳失敗
    )
)

echo.
echo ========================================
echo 📊 完成統計
echo ========================================
echo.
echo    ✅ 已處理 !SITE_COUNT! 個網站
echo    ✅ 成功上傳 !UPLOADED_COUNT! 個網站
if !FAILED_COUNT! GTR 0 (
    echo    ❌ 失敗 !FAILED_COUNT! 個網站
)
echo.
echo    Strapi 開發環境: %STRAPI_URL%
echo.

:: 清理臨時目錄
echo 🗑️  清理臨時檔案...
if exist "!TEMP_DIR!" (
    rmdir /s /q "!TEMP_DIR!" 2>nul
)

echo.
echo ✅ 完成！
echo.
pause

