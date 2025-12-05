@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 輕量版上傳腳本（不需要下載整個根目錄）
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
:: 步驟 3：準備 Git 工作區（只下載需要的部分）
:: =========================================================

echo.
echo [3/4] 準備 Git 工作區（輕量模式）...
echo.

set TEMP_DIR=%TEMP%\strapi-upload-%RANDOM%
echo 建立臨時目錄：!TEMP_DIR!
mkdir "!TEMP_DIR!" 2>nul

echo.
echo 📥 正在下載 GitHub 倉庫（只下載需要的部分）...
echo    來源：https://github.com/liouyuting112/multi-site-static-strapi-front
echo    目標：!TEMP_DIR!
echo.
echo 💡 使用輕量模式，只下載必要的檔案，不會下載整個根目錄
echo.

cd /d "!TEMP_DIR!"

:: 初始化 git 倉庫
git init
git remote add origin https://github.com/liouyuting112/multi-site-static-strapi-front.git

:: 啟用 sparse checkout（只下載需要的檔案）
git config core.sparseCheckout true

:: 設定只下載需要的檔案
(
    echo !SITE_NAME!/
    echo upload-site-to-strapi.js
    echo upload-site6-10-to-strapi.js
    echo .gitignore
) > .git/info/sparse-checkout

:: 只 fetch 需要的部分
echo 正在下載必要檔案...
git pull origin main --depth=1

if %ERRORLEVEL% NEQ 0 (
    echo ❌ 下載失敗
    echo.
    echo 可能的原因：
    echo 1. 網路連線問題
    echo 2. Git 未正確安裝
    echo 3. 目錄權限問題
    pause
    exit /b 1
)

echo ✅ 下載完成
echo 📍 專案目錄位置：!TEMP_DIR!
echo.

set PROJECT_DIR=!TEMP_DIR!

:: =========================================================
:: 步驟 4：複製網站檔案到專案目錄
:: =========================================================

echo.
echo [4/4] 複製網站檔案到專案目錄...
echo.

set TARGET_DIR=!PROJECT_DIR!\!SITE_NAME!

echo    來源：!SITE_FOLDER!
echo    目標：!TARGET_DIR!

:: 複製整個網站資料夾
if exist "!TARGET_DIR!" (
    echo ⚠️  目標目錄已存在，將覆蓋
    set /p OVERWRITE="是否繼續？(Y/N): "
    if /i not "!OVERWRITE!"=="Y" (
        echo 取消操作
        pause
        exit /b 1
    )
)

echo 正在複製檔案...
xcopy "!SITE_FOLDER!" "!TARGET_DIR!\" /E /I /Y >nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 複製檔案失敗
    pause
    exit /b 1
)
echo ✅ 檔案已複製

:: =========================================================
:: 步驟 5：上傳到 Strapi
:: =========================================================

echo.
echo [5/5] 上傳到 Strapi...
echo.

cd /d "!PROJECT_DIR!"

:: 檢查是否有上傳腳本（優先使用腳本目錄中的）
set UPLOAD_SCRIPT=
if exist "%~dp0upload-site-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
) else if exist "%~dp0upload-site6-10-to-strapi.js" (
    set UPLOAD_SCRIPT=%~dp0upload-site6-10-to-strapi.js
) else if exist "!PROJECT_DIR!\upload-site-to-strapi.js" (
    set UPLOAD_SCRIPT=!PROJECT_DIR!\upload-site-to-strapi.js
) else if exist "!PROJECT_DIR!\upload-site6-10-to-strapi.js" (
    set UPLOAD_SCRIPT=!PROJECT_DIR!\upload-site6-10-to-strapi.js
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
:: 步驟 6：推送到 GitHub（只推送變更的部分）
:: =========================================================

echo.
echo [6/6] 推送到 GitHub（只推送變更的部分）...
echo.

cd /d "!PROJECT_DIR!"

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

echo 正在加入檔案到 Git...
git add "!SITE_NAME!"
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Git add 失敗
    pause
    exit /b 1
)

echo 正在建立 commit...
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
git commit -m "新增網站: !SITE_NAME! - %date_str% %time_str%"
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Commit 失敗（可能沒有變更）
)

echo 正在推送到 GitHub...
git push origin main
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 推送到 GitHub 失敗
    echo.
    echo 可能的原因：
    echo 1. GitHub 認證失敗
    echo 2. 網路問題
    pause
    exit /b 1
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
echo    ✅ 網站檔案已複製到專案目錄
echo    ✅ 已上傳到 Strapi
echo    ✅ 已推送到 GitHub（只推送變更的部分）
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
echo 💡 提示：
echo    使用輕量模式，只下載和推送必要的檔案
echo    不會影響 GitHub 倉庫中的其他檔案
echo.
pause



