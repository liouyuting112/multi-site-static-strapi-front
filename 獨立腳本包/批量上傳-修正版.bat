@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 批量上傳腳本（修正版）
echo ========================================
echo.

:: =========================================================
:: 步驟 0：檢查環境
:: =========================================================

echo [0/5] 檢查環境...
echo.

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

:: =========================================================
:: 步驟 1：設定 GitHub 和 Strapi
:: =========================================================

echo.
echo ========================================
echo [1/5] 設定 GitHub 和 Strapi
echo ========================================
echo.

set CONFIG_FILE=%~dp0上傳設定.txt

if exist "!CONFIG_FILE!" (
    echo 📋 找到現有設定檔
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_URL=" "!CONFIG_FILE!"') do set GITHUB_URL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_BRANCH=" "!CONFIG_FILE!"') do set GITHUB_BRANCH=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_URL=" "!CONFIG_FILE!"') do set STRAPI_URL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_TOKEN=" "!CONFIG_FILE!"') do set STRAPI_TOKEN=%%a
    
    echo    GitHub: !GITHUB_URL!
    echo    Strapi: !STRAPI_URL!
    echo.
    set /p USE_EXISTING="是否使用現有設定？(Y/N，預設 Y): "
    if /i "!USE_EXISTING!"=="" set USE_EXISTING=Y
    if /i not "!USE_EXISTING!"=="Y" (
        goto :setup_config
    )
) else (
    :setup_config
    echo 📍 請設定 GitHub 倉庫位置
    set /p GITHUB_URL="GitHub 倉庫 URL: "
    if "!GITHUB_URL!"=="" (
        echo ❌ GitHub 倉庫 URL 不能為空
        pause
        exit /b 1
    )
    
    set /p GITHUB_BRANCH="分支名稱（預設：main）: "
    if "!GITHUB_BRANCH!"=="" set GITHUB_BRANCH=main
    
    echo.
    echo 📍 請設定 Strapi 後台位置
    set /p STRAPI_URL="Strapi URL: "
    if "!STRAPI_URL!"=="" (
        echo ❌ Strapi URL 不能為空
        pause
        exit /b 1
    )
    
    set /p STRAPI_TOKEN="Strapi API Token: "
    if "!STRAPI_TOKEN!"=="" (
        echo ❌ Strapi API Token 不能為空
        pause
        exit /b 1
    )
    
    (
        echo GITHUB_URL=!GITHUB_URL!
        echo GITHUB_BRANCH=!GITHUB_BRANCH!
        echo STRAPI_URL=!STRAPI_URL!
        echo STRAPI_TOKEN=!STRAPI_TOKEN!
    ) > "!CONFIG_FILE!"
)

echo ✅ 設定完成
echo.

:: =========================================================
:: 步驟 2：選擇父資料夾
:: =========================================================

echo.
echo ========================================
echo [2/5] 選擇包含多個網站資料夾的父資料夾
echo ========================================
echo.

set /p PARENT_FOLDER="請輸入父資料夾路徑: "

if not exist "!PARENT_FOLDER!" (
    echo ❌ 資料夾不存在
    pause
    exit /b 1
)

echo.
echo 📁 正在掃描網站資料夾...
echo.

set SITE_FOLDERS=
set SITE_COUNT=0

for /d %%D in ("!PARENT_FOLDER!\*") do (
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

:: =========================================================
:: 步驟 3：上傳到 Strapi
:: =========================================================

echo.
echo ========================================
echo [3/5] 上傳到 Strapi
echo ========================================
echo.

set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
if not exist "!UPLOAD_SCRIPT!" (
    echo ❌ 找不到上傳腳本
    pause
    exit /b 1
)

set UPLOADED_COUNT=0
set FAILED_COUNT=0
set PROCESSED_COUNT=0

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
    set "STRAPI_URL=!STRAPI_URL!"
    set "STRAPI_TOKEN=!STRAPI_TOKEN!"
    
    :: 執行上傳
    echo    正在上傳到 Strapi...
    node "!UPLOAD_SCRIPT!" "!CURRENT_FOLDER!"
    set UPLOAD_RESULT=!ERRORLEVEL!
    
    if !UPLOAD_RESULT! EQU 0 (
        echo    ✅ Strapi 上傳成功
        set /a UPLOADED_COUNT+=1
    ) else (
        echo    ❌ Strapi 上傳失敗（錯誤碼：!UPLOAD_RESULT!）
        set /a FAILED_COUNT+=1
    )
    echo.
)

echo.
echo ========================================
echo 📊 Strapi 上傳統計
echo ========================================
echo    成功：!UPLOADED_COUNT! 個網站
echo    失敗：!FAILED_COUNT! 個網站
echo ========================================
echo.

:: =========================================================
:: 步驟 4：推送到 GitHub
:: =========================================================

echo.
echo ========================================
echo [4/5] 推送到 GitHub
echo ========================================
echo.

:: 檢查是否在 Git 倉庫中
cd /d "!PARENT_FOLDER!"
cd ..

git rev-parse --git-dir >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  當前目錄不是 Git 倉庫
    echo    正在初始化 Git 倉庫...
    git init
    git remote add origin "!GITHUB_URL!"
    git branch -M !GITHUB_BRANCH!
) else (
    echo ✅ 找到 Git 倉庫
    git remote set-url origin "!GITHUB_URL!" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        git remote add origin "!GITHUB_URL!"
    )
    :: 確保分支存在
    git checkout -b !GITHUB_BRANCH! 2>nul
    git branch -M !GITHUB_BRANCH! 2>nul
)

:: 檢查 Git 設定
git config user.name >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set /p GIT_NAME="請輸入 Git 使用者名稱: "
    git config user.name "!GIT_NAME!"
)

git config user.email >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    set /p GIT_EMAIL="請輸入 Git Email: "
    git config user.email "!GIT_EMAIL!"
)

echo.
echo 📤 正在加入檔案到 Git...
echo.

:: 加入所有網站資料夾
set HAS_CHANGES=0
for %%F in (!SITE_FOLDERS!) do (
    set CURRENT_FOLDER=%%F
    set CURRENT_FOLDER=!CURRENT_FOLDER:"=!
    for %%S in ("!CURRENT_FOLDER!") do set CURRENT_NAME=%%~nxS
    
    echo    檢查：!CURRENT_NAME!
    
    :: 檢查檔案是否存在
    if exist "!CURRENT_NAME!" (
        echo    加入：!CURRENT_NAME!
        git add "!CURRENT_NAME!"
        if !ERRORLEVEL! EQU 0 (
            set HAS_CHANGES=1
        )
    ) else (
        echo    ⚠️  檔案不存在：!CURRENT_NAME!
    )
)

echo.
echo 📝 正在檢查變更...
git status --short | findstr /R "." >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    發現變更，建立 commit...
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
    set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
    
    git commit -m "批量新增網站: !SITE_COUNT! 個網站 - %date_str% %time_str%"
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Commit 成功
    ) else (
        echo    ❌ Commit 失敗
        pause
        exit /b 1
    )
) else (
    echo    ⚠️  沒有變更需要 commit
    echo    正在檢查是否有未追蹤的檔案...
    git status --porcelain | findstr "^??" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo    發現未追蹤的檔案，加入所有檔案...
        git add .
        for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
        set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
        set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
        git commit -m "批量新增網站: !SITE_COUNT! 個網站 - %date_str% %time_str%"
        if %ERRORLEVEL% NEQ 0 (
            echo    ❌ Commit 失敗
            pause
            exit /b 1
        )
    ) else (
        echo    ⚠️  沒有任何變更或新檔案
        echo    跳過 commit
    )
)

echo.
echo 🚀 正在推送到 GitHub...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

:: 檢查是否有 commit 可以推送
git log --oneline -1 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 沒有 commit 可以推送
    echo    請確認檔案已正確加入並 commit
    pause
    exit /b 1
)

:: 使用 force push
echo    使用 force push 推送...
git push -u origin !GITHUB_BRANCH! --force

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送到 GitHub 失敗
    echo.
    echo 請檢查：
    echo 1. GitHub 認證是否正確
    echo 2. 網路連線是否正常
    echo 3. 倉庫權限是否正確
    echo 4. 是否有 commit 可以推送
    echo.
    echo 調試資訊：
    git log --oneline -1
    git status --short
    echo.
    pause
    exit /b 1
)

echo ✅ 已推送到 GitHub
echo.

:: =========================================================
:: 完成
:: =========================================================

echo.
echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 📊 完成項目：
echo    ✅ GitHub 倉庫：!GITHUB_URL!
echo    ✅ Strapi 後台：!STRAPI_URL!
echo    ✅ 已處理 !SITE_COUNT! 個網站
echo    ✅ 已上傳 !UPLOADED_COUNT! 個網站到 Strapi
echo    ✅ 已推送到 GitHub
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
pause
