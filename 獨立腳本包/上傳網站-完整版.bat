@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 完整版上傳腳本（支援多檔案上傳）
echo ========================================
echo.

:: =========================================================
:: 步驟 0：檢查環境
:: =========================================================

echo [0/6] 檢查環境...
echo.

node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安裝
    echo    請訪問 https://nodejs.org/ 下載安裝
    pause
    exit /b 1
)
echo ✅ Node.js 已安裝

git --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git 未安裝
    echo    請訪問 https://git-scm.com/ 下載安裝
    pause
    exit /b 1
)
echo ✅ Git 已安裝

:: =========================================================
:: 步驟 1：設定 GitHub 倉庫
:: =========================================================

echo.
echo ========================================
echo [1/6] 設定 GitHub 倉庫
echo ========================================
echo.

set CONFIG_FILE=%~dp0上傳設定.txt

:: 檢查是否有設定檔
if exist "!CONFIG_FILE!" (
    echo 📋 找到現有設定檔
    echo.
    type "!CONFIG_FILE!"
    echo.
    set /p USE_EXISTING="是否使用現有設定？(Y/N，預設 Y): "
    if /i "!USE_EXISTING!"=="" set USE_EXISTING=Y
    if /i "!USE_EXISTING!"=="Y" (
        :: 讀取設定檔
        for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_URL=" "!CONFIG_FILE!"') do set GITHUB_URL=%%a
        for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_BRANCH=" "!CONFIG_FILE!"') do set GITHUB_BRANCH=%%a
        echo ✅ 使用現有設定
        goto :strapi_setup
    )
)

echo 📍 請設定 GitHub 倉庫位置
echo.
echo 💡 提示：
echo    - 這是其他電腦可以連接的 GitHub 倉庫
echo    - 格式：https://github.com/使用者名稱/倉庫名稱
echo.

set /p GITHUB_URL="GitHub 倉庫 URL（例如：https://github.com/liouyuting112/multi-site-static-strapi-front）: "

if "!GITHUB_URL!"=="" (
    echo ❌ GitHub 倉庫 URL 不能為空
    pause
    exit /b 1
)

set /p GITHUB_BRANCH="分支名稱（預設：main）: "
if "!GITHUB_BRANCH!"=="" set GITHUB_BRANCH=main

echo.
echo ✅ GitHub 倉庫設定完成
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

:: 儲存設定
(
    echo GITHUB_URL=!GITHUB_URL!
    echo GITHUB_BRANCH=!GITHUB_BRANCH!
) > "!CONFIG_FILE!"

:strapi_setup

:: =========================================================
:: 步驟 2：設定 Strapi 後台
:: =========================================================

echo.
echo ========================================
echo [2/6] 設定 Strapi 後台
echo ========================================
echo.

if exist "!CONFIG_FILE!" (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_URL=" "!CONFIG_FILE!"') do set STRAPI_URL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_TOKEN=" "!CONFIG_FILE!"') do set STRAPI_TOKEN=%%a
    
    if defined STRAPI_URL if defined STRAPI_TOKEN (
        echo 📋 找到現有設定
        echo    Strapi URL: !STRAPI_URL!
        echo    Token: !STRAPI_TOKEN:~0,20!...
        echo.
        set /p USE_EXISTING_STRAPI="是否使用現有設定？(Y/N，預設 Y): "
        if /i "!USE_EXISTING_STRAPI!"=="" set USE_EXISTING_STRAPI=Y
        if /i "!USE_EXISTING_STRAPI!"=="Y" (
            echo ✅ 使用現有設定
            goto :select_files
        )
    )
)

echo 📍 請設定 Strapi 後台位置
echo.
echo 💡 提示：
echo    - 這是內容要上傳到的 Strapi 後台
echo    - 格式：https://您的專案.strapiapp.com
echo.

set /p STRAPI_URL="Strapi URL（例如：https://effortless-whisper-83765d99df.strapiapp.com）: "

if "!STRAPI_URL!"=="" (
    echo ❌ Strapi URL 不能為空
    pause
    exit /b 1
)

echo.
echo 📍 請設定 Strapi API Token
echo.
echo 💡 提示：
echo    - 在 Strapi 後台 → Settings → API Tokens 建立
echo    - 選擇 Full access 權限
echo.

set /p STRAPI_TOKEN="Strapi API Token: "

if "!STRAPI_TOKEN!"=="" (
    echo ❌ Strapi API Token 不能為空
    pause
    exit /b 1
)

echo.
echo ✅ Strapi 後台設定完成
echo    URL: !STRAPI_URL!
echo    Token: !STRAPI_TOKEN:~0,20!...
echo.

:: 儲存設定
(
    echo STRAPI_URL=!STRAPI_URL!
    echo STRAPI_TOKEN=!STRAPI_TOKEN!
) >> "!CONFIG_FILE!"

:select_files

:: =========================================================
:: 步驟 3：選擇要上傳的檔案（支援多個）
:: =========================================================

echo.
echo ========================================
echo [3/6] 選擇要上傳的網站檔案（支援多個）
echo ========================================
echo.

set SITE_FOLDERS=
set SITE_COUNT=0

:add_site
set /a SITE_COUNT+=1

echo 📁 網站 !SITE_COUNT!
set /p SITE_FOLDER="請輸入網站資料夾路徑（直接按 Enter 結束）: "

if "!SITE_FOLDER!"=="" (
    if !SITE_COUNT! EQU 1 (
        echo ❌ 至少需要選擇一個網站資料夾
        pause
        exit /b 1
    )
    goto :process_files
)

if not exist "!SITE_FOLDER!" (
    echo ❌ 資料夾不存在：!SITE_FOLDER!
    set /a SITE_COUNT-=1
    goto :add_site
)

for %%F in ("!SITE_FOLDER!") do set SITE_NAME=%%~nxF
echo ✅ 找到：!SITE_NAME!

set SITE_FOLDERS=!SITE_FOLDERS! "!SITE_FOLDER!"

echo.
set /p ADD_MORE="是否要新增更多網站？(Y/N，預設 N): "
if /i "!ADD_MORE!"=="Y" (
    goto :add_site
)

:process_files

echo.
echo ✅ 已選擇 !SITE_COUNT! 個網站
echo.

:: =========================================================
:: 步驟 4：準備 Git 工作區
:: =========================================================

echo.
echo ========================================
echo [4/6] 準備 Git 工作區
echo ========================================
echo.

set TEMP_DIR=%TEMP%\strapi-upload-%RANDOM%
echo 📁 建立臨時目錄：!TEMP_DIR!
mkdir "!TEMP_DIR!" 2>nul

cd /d "!TEMP_DIR!"

echo 🔗 連接 GitHub 倉庫...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

:: 初始化 Git 倉庫
git init
git remote add origin "!GITHUB_URL!"

:: 只 fetch 必要的資訊（不下載檔案）
echo 📥 取得倉庫資訊（不下載檔案）...
git fetch origin !GITHUB_BRANCH! --depth=1

:: 設定分支
git checkout -b !GITHUB_BRANCH! 2>nul
git branch --set-upstream-to=origin/!GITHUB_BRANCH! !GITHUB_BRANCH! 2>nul

echo ✅ Git 工作區準備完成
echo.

:: =========================================================
:: 步驟 5：複製檔案並上傳到 Strapi
:: =========================================================

echo.
echo ========================================
echo [5/6] 複製檔案並上傳到 Strapi
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

for %%F in (!SITE_FOLDERS!) do (
    set CURRENT_FOLDER=%%F
    set CURRENT_FOLDER=!CURRENT_FOLDER:"=!
    
    for %%S in ("!CURRENT_FOLDER!") do set CURRENT_NAME=%%~nxS
    
    echo.
    echo 📦 處理網站：!CURRENT_NAME!
    echo    路徑：!CURRENT_FOLDER!
    echo.
    
    :: 複製檔案到臨時目錄
    echo    正在複製檔案...
    set TARGET_DIR=!TEMP_DIR!\!CURRENT_NAME!
    xcopy "!CURRENT_FOLDER!" "!TARGET_DIR!\" /E /I /Y >nul
    
    :: 上傳到 Strapi
    echo    正在上傳到 Strapi...
    echo    後台：!STRAPI_URL!
    echo.
    
    :: 設定環境變數給 Node.js 腳本
    set "STRAPI_URL=!STRAPI_URL!"
    set "STRAPI_TOKEN=!STRAPI_TOKEN!"
    
    node "!UPLOAD_SCRIPT!" "!CURRENT_FOLDER!"
    
    if !ERRORLEVEL! EQU 0 (
        echo    ✅ 上傳成功
        set /a UPLOADED_COUNT+=1
    ) else (
        echo    ❌ 上傳失敗
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
:: 步驟 6：推送到 GitHub
:: =========================================================

echo.
echo ========================================
echo [6/6] 推送到 GitHub
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
git commit -m "新增網站: !SITE_COUNT! 個網站 - %date_str% %time_str%"

echo 🚀 正在推送到 GitHub...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

git push origin !GITHUB_BRANCH! --force

if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  推送失敗，嘗試合併模式...
    git fetch origin !GITHUB_BRANCH!
    git merge origin/!GITHUB_BRANCH! --allow-unrelated-histories -m "合併: !SITE_COUNT! 個網站"
    git push origin !GITHUB_BRANCH!
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 推送到 GitHub 失敗
        pause
        exit /b 1
    )
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
echo    ✅ 已上傳 !UPLOADED_COUNT! 個網站到 Strapi
echo    ✅ 已推送到 GitHub
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
echo 💡 提示：
echo    - 設定已儲存到：!CONFIG_FILE!
echo    - 下次使用時會自動載入設定
echo    - Vercel 會自動偵測 GitHub 更新並部署
echo.
pause

