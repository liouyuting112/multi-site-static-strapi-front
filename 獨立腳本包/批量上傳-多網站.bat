@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 批量上傳腳本（一次處理多個網站）
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

:: 檢查是否有設定檔
if exist "!CONFIG_FILE!" (
    echo 📋 找到現有設定檔
    type "!CONFIG_FILE!" | findstr /V "TOKEN" | findstr /V "Token"
    echo.
    set /p USE_EXISTING="是否使用現有設定？(Y/N，預設 Y): "
    if /i "!USE_EXISTING!"=="" set USE_EXISTING=Y
    if /i "!USE_EXISTING!"=="Y" (
        for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_URL=" "!CONFIG_FILE!"') do set GITHUB_URL=%%a
        for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_BRANCH=" "!CONFIG_FILE!"') do set GITHUB_BRANCH=%%a
        for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_URL=" "!CONFIG_FILE!"') do set STRAPI_URL=%%a
        for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_TOKEN=" "!CONFIG_FILE!"') do set STRAPI_TOKEN=%%a
        echo ✅ 使用現有設定
        goto :select_folder
    )
)

echo 📍 請設定 GitHub 倉庫位置
set /p GITHUB_URL="GitHub 倉庫 URL（例如：https://github.com/liouyuting112/multi-site-static-strapi-front）: "
if "!GITHUB_URL!"=="" (
    echo ❌ GitHub 倉庫 URL 不能為空
    pause
    exit /b 1
)

set /p GITHUB_BRANCH="分支名稱（預設：main）: "
if "!GITHUB_BRANCH!"=="" set GITHUB_BRANCH=main

echo.
echo 📍 請設定 Strapi 後台位置
set /p STRAPI_URL="Strapi URL（例如：https://effortless-whisper-83765d99df.strapiapp.com）: "
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

:: 儲存設定
(
    echo GITHUB_URL=!GITHUB_URL!
    echo GITHUB_BRANCH=!GITHUB_BRANCH!
    echo STRAPI_URL=!STRAPI_URL!
    echo STRAPI_TOKEN=!STRAPI_TOKEN!
) > "!CONFIG_FILE!"

echo ✅ 設定已儲存

:select_folder

:: =========================================================
:: 步驟 2：選擇包含多個網站資料夾的父資料夾
:: =========================================================

echo.
echo ========================================
echo [2/5] 選擇包含多個網站資料夾的父資料夾
echo ========================================
echo.

echo 💡 提示：
echo    - 這個資料夾應該包含多個網站資料夾（例如：site6, site7, site8...）
echo    - 每個網站資料夾應該有 index.html, about.html, articles/ 等
echo.

set /p PARENT_FOLDER="請輸入父資料夾路徑（例如：C:\Users\...\網站資料夾）: "

if not exist "!PARENT_FOLDER!" (
    echo ❌ 資料夾不存在：!PARENT_FOLDER!
    pause
    exit /b 1
)

echo.
echo 📁 正在掃描網站資料夾...
echo.

:: 掃描所有子資料夾，找出網站資料夾
set SITE_FOLDERS=
set SITE_COUNT=0

for /d %%D in ("!PARENT_FOLDER!\*") do (
    set CURRENT_FOLDER=%%D
    set CURRENT_NAME=%%~nxD
    
    :: 檢查是否包含 index.html（判斷是否為網站資料夾）
    if exist "!CURRENT_FOLDER!\index.html" (
        echo ✅ 找到網站：!CURRENT_NAME!
        set SITE_FOLDERS=!SITE_FOLDERS! "!CURRENT_FOLDER!"
        set /a SITE_COUNT+=1
    )
)

if !SITE_COUNT! EQU 0 (
    echo ❌ 沒有找到任何網站資料夾
    echo    請確認資料夾中包含 index.html 的網站資料夾
    pause
    exit /b 1
)

echo.
echo ✅ 找到 !SITE_COUNT! 個網站資料夾
echo.

:: 顯示找到的網站
set DISPLAY_COUNT=0
for %%F in (!SITE_FOLDERS!) do (
    set /a DISPLAY_COUNT+=1
    for %%S in ("%%F") do echo    !DISPLAY_COUNT!. %%~nxS
)

echo.
set /p CONFIRM="確認要上傳這些網站？(Y/N，預設 Y): "
if /i "!CONFIRM!"=="" set CONFIRM=Y
if /i not "!CONFIRM!"=="Y" (
    echo 取消操作
    pause
    exit /b 1
)

:: =========================================================
:: 步驟 3：準備 Git 工作區
:: =========================================================

echo.
echo ========================================
echo [3/5] 準備 Git 工作區
echo ========================================
echo.

set TEMP_DIR=%TEMP%\strapi-batch-%RANDOM%
echo 📁 建立臨時目錄：!TEMP_DIR!
mkdir "!TEMP_DIR!" 2>nul

cd /d "!TEMP_DIR!"

echo 🔗 連接 GitHub 倉庫...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

git init
git remote add origin "!GITHUB_URL!"
git fetch origin !GITHUB_BRANCH! --depth=1
git checkout -b !GITHUB_BRANCH! 2>nul
git branch --set-upstream-to=origin/!GITHUB_BRANCH! !GITHUB_BRANCH! 2>nul

echo ✅ Git 工作區準備完成
echo.

:: =========================================================
:: 步驟 4：複製檔案並上傳到 Strapi
:: =========================================================

echo.
echo ========================================
echo [4/5] 複製檔案並上傳到 Strapi
echo ========================================
echo.

set UPLOAD_SCRIPT=
if exist "%~dp0upload-site-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
) else if exist "%~dp0upload-site6-10-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site6-10-to-strapi.js
)

if not defined UPLOAD_SCRIPT (
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
    echo ========================================
    echo 📦 處理網站 !PROCESSED_COUNT!/!SITE_COUNT!：!CURRENT_NAME!
    echo ========================================
    echo.
    
    :: 複製檔案到臨時目錄
    echo    正在複製檔案...
    set TARGET_DIR=!TEMP_DIR!\!CURRENT_NAME!
    xcopy "!CURRENT_FOLDER!" "!TARGET_DIR!\" /E /I /Y >nul
    
    :: 上傳到 Strapi
    echo    正在上傳到 Strapi...
    echo    後台：!STRAPI_URL!
    echo    網站：!CURRENT_NAME!
    echo    資料夾：!CURRENT_FOLDER!
    echo.
    
    :: 設定環境變數給 Node.js 腳本
    set "STRAPI_URL=!STRAPI_URL!"
    set "STRAPI_TOKEN=!STRAPI_TOKEN!"
    
    :: 執行上傳腳本
    node "!UPLOAD_SCRIPT!" "!CURRENT_FOLDER!"
    set UPLOAD_RESULT=!ERRORLEVEL!
    
    echo.
    if !UPLOAD_RESULT! EQU 0 (
        echo    ✅ 上傳成功
        set /a UPLOADED_COUNT+=1
    ) else (
        echo    ❌ 上傳失敗（錯誤碼：!UPLOAD_RESULT!）
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
:: 步驟 5：推送到 GitHub
:: =========================================================

echo.
echo ========================================
echo [5/5] 推送到 GitHub
echo ========================================
echo.

cd /d "!TEMP_DIR!"

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

echo 📤 正在加入檔案到 Git...
for %%F in (!SITE_FOLDERS!) do (
    set CURRENT_FOLDER=%%F
    set CURRENT_FOLDER=!CURRENT_FOLDER:"=!
    for %%S in ("!CURRENT_FOLDER!") do set CURRENT_NAME=%%~nxS
    git add "!CURRENT_NAME!"
)

echo 📝 正在建立 commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
git commit -m "批量新增網站: !SITE_COUNT! 個網站 - %date_str% %time_str%"

echo 🚀 正在推送到 GitHub...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

:: 檢查是否有遠端分支
git ls-remote --heads origin !GITHUB_BRANCH! >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    遠端分支已存在，使用合併模式...
    git fetch origin !GITHUB_BRANCH!
    git merge origin/!GITHUB_BRANCH! --allow-unrelated-histories -m "合併: !SITE_COUNT! 個網站" 2>nul
    git push origin !GITHUB_BRANCH!
) else (
    echo    遠端分支不存在，直接推送...
    git push -u origin !GITHUB_BRANCH!
)

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ 推送到 GitHub 失敗
    echo.
    echo 可能的原因：
    echo 1. GitHub 認證失敗
    echo 2. 網路問題
    echo 3. 權限問題
    echo.
    echo 請檢查：
    echo - Git 使用者名稱和 Email 是否設定
    echo - GitHub 認證是否正確
    echo - 網路連線是否正常
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
echo 💡 提示：
echo    - 所有網站已上傳到 Strapi（Post 和 Page）
echo    - 所有網站已推送到 GitHub
echo    - Vercel 會自動偵測更新並部署
echo.
pause

