@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 單篇文章上傳腳本
echo ========================================
echo.

:: =========================================================
:: 步驟 0：檢查環境
:: =========================================================

echo [0/4] 檢查環境...
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
echo [1/4] 設定 GitHub 和 Strapi
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
:: 步驟 2：選擇文章檔案
:: =========================================================

echo.
echo ========================================
echo [2/4] 選擇文章檔案
echo ========================================
echo.

set /p ARTICLE_FILE="請輸入文章檔案完整路徑（例如：C:\Users\...\site6\articles\2025-12-07.html）: "

if not exist "!ARTICLE_FILE!" (
    echo ❌ 檔案不存在：!ARTICLE_FILE!
    pause
    exit /b 1
)

echo ✅ 找到檔案：!ARTICLE_FILE!
echo.

:: 從檔案路徑提取資訊
for %%F in ("!ARTICLE_FILE!") do set ARTICLE_NAME=%%~nxF
for %%F in ("!ARTICLE_FILE!") do set ARTICLE_DIR=%%~dpF

echo    檔案名稱：!ARTICLE_NAME!
echo    檔案目錄：!ARTICLE_DIR!
echo.

:: 從路徑判斷網站名稱
set SITE_NAME=

:: 方法 1：從 articles 目錄的父目錄提取（最可靠的方法）
:: 例如：C:\...\site6\articles\ -> site6
for %%D in ("!ARTICLE_DIR!") do (
    set PARENT_DIR=%%~dpD
    :: 移除尾部的反斜線
    set PARENT_DIR=!PARENT_DIR:~0,-1!
    for %%P in ("!PARENT_DIR!") do set SITE_NAME=%%~nxP
)

:: 方法 2：如果找不到，向上查找包含 index.html 的目錄
if not defined SITE_NAME (
    set CURRENT_DIR=!ARTICLE_DIR!
    :find_site_loop
    cd /d "!CURRENT_DIR!"
    if exist "index.html" (
        for %%S in ("!CURRENT_DIR!") do set SITE_NAME=%%~nxS
        goto :site_found
    )
    cd ..
    set NEW_DIR=%CD%\
    if "!NEW_DIR!"=="!CURRENT_DIR!" goto :ask_site_name
    set CURRENT_DIR=!NEW_DIR!
    goto :find_site_loop
)

:site_found
if defined SITE_NAME goto :site_ok

:ask_site_name
if not defined SITE_NAME (
    echo ⚠️  無法自動判斷網站名稱
    echo    檔案路徑：!ARTICLE_FILE!
    echo    檔案目錄：!ARTICLE_DIR!
    echo.
    set /p SITE_NAME="請手動輸入網站名稱（例如：site6）: "
    if "!SITE_NAME!"=="" (
        echo ❌ 網站名稱不能為空
        pause
        exit /b 1
    )
)

:site_ok

echo    網站名稱：!SITE_NAME!
echo.

:: =========================================================
:: 步驟 3：上傳到 Strapi
:: =========================================================

echo.
echo ========================================
echo [3/4] 上傳到 Strapi
echo ========================================
echo.

set UPLOAD_SCRIPT=%~dp0upload-site-to-strapi.js
if not exist "!UPLOAD_SCRIPT!" (
    echo ❌ 找不到上傳腳本
    pause
    exit /b 1
)

:: 檢查是否有單篇文章上傳腳本
set SINGLE_UPLOAD_SCRIPT=%~dp0upload-single-article.js
if exist "!SINGLE_UPLOAD_SCRIPT!" (
    echo 🚀 正在上傳到 Strapi...
    echo    後台：!STRAPI_URL!
    echo    網站：!SITE_NAME!
    echo    文章：!ARTICLE_NAME!
    echo    檔案路徑：!ARTICLE_FILE!
    echo.
    
    :: 切換到腳本目錄
    cd /d "%~dp0"
    
    :: 設定環境變數
    set "STRAPI_URL=!STRAPI_URL!"
    set "STRAPI_TOKEN=!STRAPI_TOKEN!"
    
    :: 執行上傳腳本
    node "!SINGLE_UPLOAD_SCRIPT!" "!ARTICLE_FILE!" "!SITE_NAME!"
    set UPLOAD_RESULT=!ERRORLEVEL!
    
    echo.
    if !UPLOAD_RESULT! EQU 0 (
        echo ✅ Strapi 上傳成功
    ) else (
        echo ❌ Strapi 上傳失敗（錯誤碼：!UPLOAD_RESULT!）
        echo.
        echo 調試資訊：
        echo    檔案路徑：!ARTICLE_FILE!
        echo    網站名稱：!SITE_NAME!
        echo    Strapi URL：!STRAPI_URL!
        echo    腳本路徑：!SINGLE_UPLOAD_SCRIPT!
        echo    當前目錄：%CD%
        echo.
        pause
        exit /b 1
    )
    echo.
) else (
    echo ⚠️  找不到單篇文章上傳腳本，使用完整網站上傳...
    echo.
    
    :: 建立臨時網站資料夾結構（只包含這篇文章）
    set TEMP_SITE_DIR=%TEMP%\strapi-single-article-%RANDOM%
    set TEMP_ARTICLES_DIR=!TEMP_SITE_DIR!\!SITE_NAME!\articles
    
    echo 📁 建立臨時目錄...
    mkdir "!TEMP_ARTICLES_DIR!" 2>nul
    
    :: 複製文章檔案到臨時目錄
    echo 📋 複製文章檔案...
    copy "!ARTICLE_FILE!" "!TEMP_ARTICLES_DIR!\!ARTICLE_NAME!" >nul
    
    if not exist "!TEMP_ARTICLES_DIR!\!ARTICLE_NAME!" (
        echo ❌ 複製檔案失敗
        pause
        exit /b 1
    )
    
    echo ✅ 檔案已準備
    echo.
    
    :: 執行上傳（只上傳這篇文章所在的網站資料夾）
    echo 🚀 正在上傳到 Strapi...
    echo    後台：!STRAPI_URL!
    echo    網站：!SITE_NAME!
    echo    文章：!ARTICLE_NAME!
    echo.
    
    node "!UPLOAD_SCRIPT!" "!TEMP_SITE_DIR!\!SITE_NAME!"
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Strapi 上傳失敗
        pause
        exit /b 1
    )
    
    echo ✅ Strapi 上傳成功
    echo.
    
    :: 清理臨時檔案
    rmdir /s /q "!TEMP_SITE_DIR!" 2>nul
)

:: =========================================================
:: 步驟 4：推送到 GitHub
:: =========================================================

echo.
echo ========================================
echo [4/4] 推送到 GitHub
echo ========================================
echo.

:: 找到 Git 倉庫根目錄
set GIT_ROOT=
cd /d "!ARTICLE_DIR!"

:: 向上查找 .git 目錄
:find_git_root
if exist ".git" (
    set GIT_ROOT=%CD%
    goto :found_git
)
cd ..
if "%CD%"=="%CD:~0,3%" (
    :: 已經到根目錄，沒找到 Git 倉庫
    echo ❌ 找不到 Git 倉庫
    echo    請確認文章檔案在 Git 倉庫中
    pause
    exit /b 1
)
goto :find_git_root

:found_git
cd /d "!GIT_ROOT!"
echo ✅ 找到 Git 倉庫根目錄：%CD%
echo.

git remote set-url origin "!GITHUB_URL!" 2>nul
if %ERRORLEVEL% NEQ 0 (
    git remote add origin "!GITHUB_URL!"
)

:: 確保分支存在
git checkout -b !GITHUB_BRANCH! 2>nul
git branch -M !GITHUB_BRANCH! 2>nul

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
echo.

:: 計算相對路徑（從 Git 根目錄到文章檔案的相對路徑）
set RELATIVE_PATH=!ARTICLE_FILE!
set RELATIVE_PATH=!RELATIVE_PATH:%GIT_ROOT%\=!
set RELATIVE_PATH=!RELATIVE_PATH:%GIT_ROOT%=!

echo    完整路徑：!ARTICLE_FILE!
echo    Git 根目錄：!GIT_ROOT!
echo    相對路徑：!RELATIVE_PATH!
echo.

:: 確保相對路徑正確（移除開頭的 \）
if "!RELATIVE_PATH:~0,1!"=="\" set RELATIVE_PATH=!RELATIVE_PATH:~1!

echo    處理後的相對路徑：!RELATIVE_PATH!
echo.

:: 加入單個 HTML 檔案（優先使用相對路徑）
if exist "!RELATIVE_PATH!" (
    echo    使用相對路徑加入單個檔案...
    git add "!RELATIVE_PATH!"
    set ADD_RESULT=!ERRORLEVEL!
) else (
    echo    ⚠️  相對路徑不存在，使用完整路徑...
    :: 使用完整路徑（Git 會自動轉換為相對路徑）
    git add "!ARTICLE_FILE!"
    set ADD_RESULT=!ERRORLEVEL!
)

if !ADD_RESULT! NEQ 0 (
    echo    ⚠️  加入失敗，嘗試強制加入...
    git add -f "!ARTICLE_FILE!"
    if !ERRORLEVEL! NEQ 0 (
        echo    ❌ 加入檔案失敗
        echo.
        echo    調試資訊：
        echo    完整路徑：!ARTICLE_FILE!
        echo    相對路徑：!RELATIVE_PATH!
        echo    當前目錄：%CD%
        echo.
        pause
        exit /b 1
    )
)

echo    ✅ 單個 HTML 檔案已加入：!RELATIVE_PATH!
echo.

echo 📝 檢查 Git 狀態...
git status --short
echo.

:: 檢查是否有變更需要 commit
git status --short | findstr /R "." >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo 📝 正在建立 commit...
    for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
    set date_str=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2%
    set time_str=%datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
    
    git commit -m "新增文章: !SITE_NAME!/!ARTICLE_NAME! - %date_str% %time_str%"
    
    if %ERRORLEVEL% EQU 0 (
        echo    ✅ Commit 成功
    ) else (
        echo    ❌ Commit 失敗
        echo    錯誤詳情：
        git status
        pause
        exit /b 1
    )
) else (
    echo ⚠️  沒有變更需要 commit
    echo    可能檔案已經在 Git 中
    git status
    pause
    exit /b 1
)

echo ✅ Commit 成功
echo.

echo 🚀 正在推送到 GitHub...
echo    倉庫：!GITHUB_URL!
echo    分支：!GITHUB_BRANCH!
echo.

:: 檢查是否有 commit 可以推送
git log --oneline -1 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 沒有 commit 可以推送
    pause
    exit /b 1
)

echo    最後一個 commit：
git log --oneline -1
echo.

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
echo    ✅ 已上傳文章：!ARTICLE_NAME!
echo    ✅ 網站：!SITE_NAME!
echo    ✅ 已推送到 GitHub
echo    ✅ Vercel 會自動部署（約 1-3 分鐘）
echo.
pause

