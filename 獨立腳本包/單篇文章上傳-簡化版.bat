@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 單篇文章上傳腳本（簡化版）
echo ========================================
echo.

:: 讀取設定
set CONFIG_FILE=%~dp0上傳設定.txt
if exist "!CONFIG_FILE!" (
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_URL=" "!CONFIG_FILE!"') do set GITHUB_URL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"GITHUB_BRANCH=" "!CONFIG_FILE!"') do set GITHUB_BRANCH=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_URL=" "!CONFIG_FILE!"') do set STRAPI_URL=%%a
    for /f "tokens=2 delims==" %%a in ('findstr /C:"STRAPI_TOKEN=" "!CONFIG_FILE!"') do set STRAPI_TOKEN=%%a
) else (
    echo ❌ 找不到設定檔：!CONFIG_FILE!
    echo    請先執行完整版腳本進行設定
    pause
    exit /b 1
)

:: 輸入文章檔案
set /p ARTICLE_FILE="請輸入文章檔案完整路徑: "

if not exist "!ARTICLE_FILE!" (
    echo ❌ 檔案不存在
    pause
    exit /b 1
)

:: 自動判斷網站名稱
for %%F in ("!ARTICLE_FILE!") do set ARTICLE_DIR=%%~dpF

:: 方法 1：從 articles 目錄的父目錄提取
set SITE_NAME=
for %%D in ("!ARTICLE_DIR!") do (
    set PARENT_DIR=%%~dpD
    for %%P in ("!PARENT_DIR!") do set SITE_NAME=%%~nxP
)

:: 方法 2：使用 PowerShell 從路徑中提取 siteX
if not defined SITE_NAME (
    for /f "delims=" %%I in ('powershell -Command "$path='!ARTICLE_FILE!'; $match=[regex]::Match($path, '\\\\(site[0-9]+)\\\\'); if($match.Success){$match.Groups[1].Value}"') do set SITE_NAME=%%I
)

if not defined SITE_NAME (
    echo ⚠️  無法自動判斷網站名稱
    set /p SITE_NAME="請輸入網站名稱: "
)

echo ✅ 網站名稱：!SITE_NAME!
echo.

:: 上傳到 Strapi
echo 🚀 正在上傳到 Strapi...
cd /d "%~dp0"
set "STRAPI_URL=!STRAPI_URL!"
set "STRAPI_TOKEN=!STRAPI_TOKEN!"
node upload-single-article.js "!ARTICLE_FILE!" "!SITE_NAME!"

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Strapi 上傳失敗
    pause
    exit /b 1
)

echo ✅ Strapi 上傳成功
echo.

:: 推送到 GitHub
echo 📤 正在推送到 GitHub...

:: 找到 Git 倉庫根目錄
set GIT_ROOT=
cd /d "!ARTICLE_DIR!"

:find_git
if exist ".git" (
    set GIT_ROOT=%CD%
    goto :found_git
)
cd ..
if "%CD%"=="%CD:~0,3%" (
    echo ❌ 找不到 Git 倉庫
    pause
    exit /b 1
)
goto :find_git

:found_git
cd /d "!GIT_ROOT!"
git remote set-url origin "!GITHUB_URL!" 2>nul
git checkout -b !GITHUB_BRANCH! 2>nul
git branch -M !GITHUB_BRANCH! 2>nul

:: 加入檔案
set RELATIVE_PATH=!ARTICLE_FILE!
set RELATIVE_PATH=!RELATIVE_PATH:%GIT_ROOT%\=!
if "!RELATIVE_PATH:~0,1!"=="\" set RELATIVE_PATH=!RELATIVE_PATH:~1!

git add "!RELATIVE_PATH!"
git commit -m "新增文章: !SITE_NAME!/%%~nxF" 2>nul

git push -u origin !GITHUB_BRANCH! --force

if %ERRORLEVEL% EQU 0 (
    echo ✅ 已推送到 GitHub
) else (
    echo ❌ 推送到 GitHub 失敗
)

echo.
pause


