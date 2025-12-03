import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修復 article-cms.js
const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let articleContent = fs.readFileSync(articleCmsPath, 'utf8');

// 在 DOMContentLoaded 開頭添加 site 變數定義和 updateNavDailyLink 調用
const domContentLoadedPattern = /document\.addEventListener\('DOMContentLoaded', function\(\) \{/;
if (domContentLoadedPattern.test(articleContent)) {
    const replacement = `document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded 事件觸發');
    
    const site = getSiteFromPath();
    
    // 立即更新導覽列連結（無論是否有文章容器）
    updateNavDailyLink(site);
    
    // 查找文章容器`;
    
    articleContent = articleContent.replace(
        /document\.addEventListener\('DOMContentLoaded', function\(\) \{[\s\S]*?console\.log\('[^']*DOMContentLoaded[^']*'\);[\s\S]*?\/\/ 使用[^]*?查[^]*?/,
        replacement
    );
    
    // 如果上面的替換失敗，嘗試更簡單的替換
    if (!articleContent.includes('const site = getSiteFromPath();')) {
        articleContent = articleContent.replace(
            /document\.addEventListener\('DOMContentLoaded', function\(\) \{/,
            `document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded 事件觸發');
    
    const site = getSiteFromPath();
    
    // 立即更新導覽列連結（無論是否有文章容器）
    updateNavDailyLink(site);
    
    // 查找文章容器`
        );
    }
    
    // 修復 console.log 中的亂碼
    articleContent = articleContent.replace(
        /console\.log\('[^']*找到[^']*容器[^']*'\);/g,
        "console.log('✅ 找到文章容器，開始載入文章內容');"
    );
    
    articleContent = articleContent.replace(
        /console\.log\('[^']*找不到[^']*章容[^']*'\);/g,
        "console.log('ℹ️  找不到文章容器，可能不是文章頁面');"
    );
    
    // 確保在 else 分支中也更新導覽列連結
    if (!articleContent.includes('即使不是文章頁面，也確保導覽列連結已更新')) {
        // 查找 } else { 後面的 console.log，並在其後添加更新導覽列連結的代碼
        const elsePattern = /(\} else \{[\s\S]*?console\.log\([^)]+\);)([\s\S]*?\}\);)/;
        if (elsePattern.test(articleContent)) {
            articleContent = articleContent.replace(
                elsePattern,
                `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);$2`
            );
        } else {
            // 如果上面的模式不匹配，嘗試更簡單的模式
            articleContent = articleContent.replace(
                /(\} else \{[\s\S]*?console\.log\([^)]+\);)/,
                `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);`
            );
        }
    }
    
    fs.writeFileSync(articleCmsPath, articleContent, 'utf8');
    console.log('✅ 已修復 article-cms.js');
} else {
    console.log('⚠️  找不到 DOMContentLoaded 事件處理器');
}

console.log('✅ 修復完成！');

