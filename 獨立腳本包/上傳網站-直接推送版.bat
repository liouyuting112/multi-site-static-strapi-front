@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 直接推送版（不需要下載根目錄）
echo ========================================
echo.

:: =========================================================
:: 步驟 1：檢查環境
:: =========================================================

echo [1/4] 檢查環境...
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
:: 步驟 2：選擇網站資料夾
:: =========================================================

echo.
echo [2/4] 選擇網站資料夾...
echo.

set /p SITE_FOLDER="請輸入網站資料夾路徑（例如：C:\Users\...\site6）: "

if not exist "!SITE_FOLDER!" (
    echo ❌ 資料夾不存在：!SITE_FOLDER!
    pause
    exit /b 1
)

echo ✅ 找到資料夾：!SITE_FOLDER!

:: 從資料夾路徑提取網站名稱
for %%F in ("!SITE_FOLDER!") do set SITE_NAME=%%~nxF

echo    網站名稱：!SITE_NAME!

:: =========================================================
:: 步驟 3：準備臨時 Git 工作區（只推送您的檔案）
:: =========================================================

echo.
echo [3/4] 準備 Git 工作區（直接推送模式）...
echo.

set TEMP_DIR=%TEMP%\strapi-push-%RANDOM%
echo 建立臨時目錄：!TEMP_DIR!
mkdir "!TEMP_DIR!" 2>nul

cd /d "!TEMP_DIR!"

:: 初始化 Git 倉庫
echo 初始化 Git 倉庫...
git init

:: 添加遠端倉庫
echo 連接 GitHub 倉庫...
git remote add origin https://github.com/liouyuting112/multi-site-static-strapi-front.git

:: 只 fetch 必要的資訊（不下載檔案）
echo 取得倉庫資訊（不下載檔案）...
git fetch origin main --depth=1

:: 設定分支
git checkout -b main 2>nul
git branch --set-upstream-to=origin/main main 2>nul

:: 複製您的網站檔案到臨時目錄
echo 複製網站檔案...
set TARGET_DIR=!TEMP_DIR!\!SITE_NAME!
xcopy "!SITE_FOLDER!" "!TARGET_DIR!\" /E /I /Y >nul

echo ✅ 檔案已準備完成

:: =========================================================
:: 步驟 4：上傳到 Strapi
:: =========================================================

echo.
echo [4/4] 上傳到 Strapi...
echo.

:: 檢查是否有上傳腳本（優先使用腳本目錄中的）
set UPLOAD_SCRIPT=
if exist "%~dp0upload-site-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
) else if exist "%~dp0upload-site6-10-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site6-10-to-strapi.js
) else if exist "upload-site-to-strapi.js" (
    set UPLOAD_SCRIPT=upload-site-to-strapi.js
) else if exist "upload-site6-10-to-strapi.js" (
    set UPLOAD_SCRIPT=upload-site6-10-to-strapi.js
)

if defined UPLOAD_SCRIPT (
    echo 執行上傳腳本...
    set STRAPI_URL=https://effortless-whisper-83765d99df.strapiapp.com
    set STRAPI_TOKEN=446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef
    node "!UPLOAD_SCRIPT!" "!SITE_FOLDER!"
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 上傳到 Strapi 失敗
        pause
        exit /b 1
    )
) else (
    echo ⚠️  找不到上傳腳本
    echo    請確認以下檔案之一存在：
    echo    1. upload-site-to-strapi.js（推薦）
    echo    2. upload-site6-10-to-strapi.js（舊版）
    pause
    exit /b 1
)

:: =========================================================
:: 步驟 5：直接推送到 GitHub（只推送您的檔案）
:: =========================================================

echo.
echo [5/5] 直接推送到 GitHub（只推送您的檔案）...
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

:: 只添加您的網站資料夾
echo 正在加入檔案到 Git...
git add "!SITE_NAME!"

:: 建立 commit
echo 正在建立 commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
git commit -m "新增網站: !SITE_NAME! - %date_str% %time_str%"

:: 直接推送到 GitHub（只推送您的檔案）
echo 正在推送到 GitHub...
echo 💡 只推送您的檔案，不會影響其他檔案
git push origin main --force

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ⚠️  推送失敗，嘗試合併模式...
    echo.
    
    :: 如果 force push 失敗，嘗試合併
    git fetch origin main
    git merge origin/main --allow-unrelated-histories -m "合併: !SITE_NAME!"
    git push origin main
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 推送到 GitHub 失敗
        echo.
        echo 可能的原因：
        echo 1. GitHub 認證失敗
        echo 2. 網路問題
        echo 3. 權限問題
        pause
        exit /b 1
    )
)

echo ✅ 已推送到 GitHub

:: =========================================================
:: 完成
:: =========================================================

echo.
echo ========================================
echo ✅ 完成！
echo ========================================
echo.
echo 📊 完成項目：
echo    ✅ 網站檔案已準備
echo    ✅ 已上傳到 Strapi
echo    ✅ 已直接推送到 GitHub（只推送您的檔案）
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
echo 💡 提示：
echo    使用直接推送模式，不需要下載根目錄
echo    只推送您的檔案，不會影響其他檔案
echo.
pause


