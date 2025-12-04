@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo 測試單篇文章上傳
echo ========================================
echo.

set STRAPI_URL=https://effortless-whisper-83765d99df.strapiapp.com
set STRAPI_TOKEN=446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef

set /p ARTICLE_FILE="請輸入文章檔案路徑: "

if not exist "!ARTICLE_FILE!" (
    echo ❌ 檔案不存在
    pause
    exit /b 1
)

echo.
echo 🔍 自動判斷網站名稱...
echo.

:: 自動判斷網站名稱
set SITE_NAME=

:: 從 articles 目錄的父目錄提取（最可靠的方法）
for %%F in ("!ARTICLE_FILE!") do set ARTICLE_DIR=%%~dpF

for %%D in ("!ARTICLE_DIR!") do (
    set PARENT_DIR=%%~dpD
    :: 移除尾部的反斜線
    set PARENT_DIR=!PARENT_DIR:~0,-1!
    for %%P in ("!PARENT_DIR!") do set SITE_NAME=%%~nxP
)

if defined SITE_NAME (
    echo ✅ 自動判斷網站名稱：!SITE_NAME!
) else (
    echo ⚠️  無法自動判斷，請手動輸入
    set /p SITE_NAME="請輸入網站名稱: "
    if "!SITE_NAME!"=="" (
        echo ❌ 網站名稱不能為空
        pause
        exit /b 1
    )
)

echo.
echo 🚀 測試上傳到 Strapi...
echo    檔案：!ARTICLE_FILE!
echo    網站：!SITE_NAME!
echo.

cd /d "%~dp0"
set "STRAPI_URL=!STRAPI_URL!"
set "STRAPI_TOKEN=!STRAPI_TOKEN!"
node upload-single-article.js "!ARTICLE_FILE!" "!SITE_NAME!"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Strapi 上傳測試成功
) else (
    echo.
    echo ❌ Strapi 上傳測試失敗
)

echo.
pause

