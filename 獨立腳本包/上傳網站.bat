@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 獨立上傳腳本（支援任何網站名稱）
echo ========================================
echo.

:: =========================================================
:: 步驟 1：檢查環境
:: =========================================================

echo [1/5] 檢查環境...
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
echo [2/5] 選擇網站資料夾...
echo.

set /p SITE_FOLDER="請輸入網站資料夾路徑（例如：C:\Users\...\site6）: "

if not exist "!SITE_FOLDER!" (
    echo ❌ 資料夾不存在：!SITE_FOLDER!
    pause
    exit /b 1
)

echo ✅ 找到資料夾：!SITE_FOLDER!

:: 從資料夾路徑提取網站名稱（site6, site7 等）
for %%F in ("!SITE_FOLDER!") do set SITE_NAME=%%~nxF

echo    網站名稱：!SITE_NAME!

:: =========================================================
:: 步驟 3：準備臨時工作區
:: =========================================================

echo.
echo [3/5] 準備 Git 工作區...
echo.

set TEMP_DIR=%TEMP%\strapi-upload-%RANDOM%
echo 建立臨時目錄：!TEMP_DIR!
mkdir "!TEMP_DIR!" 2>nul

:: 檢查是否已有專案目錄
echo.
echo 💡 提示：
echo    - 選擇 Y：如果您已經在本機 Clone 過 GitHub 倉庫
echo      需要輸入本機資料夾的完整路徑（例如：C:\Users\...\multi-site-static-strapi-front）
echo    - 選擇 N：如果沒有 Clone 過，腳本會自動下載並找到專案目錄位置
echo.
set /p HAS_PROJECT="是否已有專案目錄（已 Clone GitHub 倉庫）？(Y/N): "
if /i "!HAS_PROJECT!"=="Y" (
    echo.
    echo 📁 請輸入本機專案目錄的完整路徑
    echo    範例：C:\Users\YourName\Documents\multi-site-static-strapi-front
    echo    範例：C:\Users\YourName\Desktop\multi-site-static-strapi-front
    echo.
    set /p PROJECT_DIR="專案目錄路徑: "
    
    :: 移除前後空格
    set "PROJECT_DIR=!PROJECT_DIR: =!"
    
    :: 檢查是否輸入的是 GitHub URL，如果是則提示錯誤
    echo !PROJECT_DIR! | findstr /i "github.com http https" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo ❌ 錯誤：您輸入的是 GitHub URL，不是本機路徑
        echo    請輸入本機資料夾的完整路徑，例如：
        echo    C:\Users\YourName\Documents\multi-site-static-strapi-front
        echo.
        echo    或者選擇 N，讓腳本自動 Clone 到指定位置
        pause
        exit /b 1
    )
    
    if not exist "!PROJECT_DIR!" (
        echo.
        echo ❌ 專案目錄不存在：!PROJECT_DIR!
        echo.
        echo 💡 提示：
        echo    1. 確認路徑是否正確
        echo    2. 確認資料夾是否存在
        echo    3. 或者選擇 N，讓腳本自動 Clone
        pause
        exit /b 1
    )
    
    :: 檢查是否為有效的 Git 倉庫
    if not exist "!PROJECT_DIR!\.git" (
        echo.
        echo ⚠️  警告：指定的目錄不是 Git 倉庫
        echo    是否要在此目錄 Clone 倉庫？(Y/N)
        set /p CLONE_HERE="> "
        if /i "!CLONE_HERE!"=="Y" (
            echo 正在 Clone 倉庫...
            cd /d "!PROJECT_DIR!"
            git clone https://github.com/liouyuting112/multi-site-static-strapi-front.git .
            if %ERRORLEVEL% NEQ 0 (
                echo ❌ Clone 失敗
                pause
                exit /b 1
            )
            echo ✅ 倉庫 Clone 完成
        ) else (
            echo 取消操作
            pause
            exit /b 1
        )
    )
    
    set USE_EXISTING=1
) else (
    :: Clone 倉庫到臨時目錄
    echo.
    echo 📥 正在自動下載 GitHub 倉庫...
    echo    來源：https://github.com/liouyuting112/multi-site-static-strapi-front
    echo    目標：!TEMP_DIR!
    echo.
    echo 💡 腳本會自動下載並找到專案目錄位置，您不需要手動操作
    echo.
    git clone https://github.com/liouyuting112/multi-site-static-strapi-front.git "!TEMP_DIR!"
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Clone 失敗
        echo.
        echo 可能的原因：
        echo 1. 網路連線問題
        echo 2. Git 未正確安裝
        echo 3. 目錄權限問題
        pause
        exit /b 1
    )
    echo ✅ 倉庫下載完成
    echo 📍 專案目錄位置：!TEMP_DIR!
    echo.
    set PROJECT_DIR=!TEMP_DIR!
    set USE_EXISTING=0
)

:: =========================================================
:: 步驟 4：複製網站檔案到專案目錄
:: =========================================================

echo.
echo [4/5] 複製網站檔案到專案目錄...
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

:: 檢查是否有上傳腳本（優先使用腳本目錄中的，支援多個檔名）
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
    echo.
    echo    搜尋位置：
    echo    1. 批次檔同目錄
    echo    2. 專案目錄
    echo    3. 當前目錄
    pause
    exit /b 1
)

:: =========================================================
:: 步驟 6：推送到 GitHub
:: =========================================================

echo.
echo [6/6] 推送到 GitHub...
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
:: 清理
:: =========================================================

if !USE_EXISTING!==0 (
    echo.
    echo 💡 提示：專案目錄位置
    echo    臨時專案目錄：!PROJECT_DIR!
    echo.
    echo    下次使用時，您可以：
    echo    1. 選擇 Y（已有專案目錄）
    echo    2. 輸入路徑：!PROJECT_DIR!
    echo    這樣就不需要重新下載了
    echo.
    set /p KEEP_TEMP="是否保留臨時專案目錄？(Y/N，預設 N): "
    if /i not "!KEEP_TEMP!"=="Y" (
        echo.
        echo 📍 專案目錄位置已記錄：!PROJECT_DIR!
        echo    下次使用時可以選擇 Y 並輸入此路徑
        echo    或選擇 N 讓腳本自動下載
    )
)

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
echo    ✅ 已推送到 GitHub
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
pause

