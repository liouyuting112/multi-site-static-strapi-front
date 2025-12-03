import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修復 article-cms.js 的錯誤
const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let articleContent = fs.readFileSync(articleCmsPath, 'utf8');

// 1. 修復第 302 行的語法錯誤（缺少結尾引號）
articleContent = articleContent.replace(
    /console\.warn\('[^']*找不到[^']*章容[^']*\);?/,
    "console.warn('⚠️  找不到文章容器');"
);

// 2. 移除重複的 updateNavDailyLink 調用（在 updateNavDailyLink 函數內部）
// 找到 updateNavDailyLink 函數結尾前的重複調用
articleContent = articleContent.replace(
    /(\s+});\s*\/\/ 即使不是文章頁面，也確保導覽列連結已更新\s*setTimeout\(\(\) => \{\s*updateNavDailyLink\(site\);\s*\}, 200\);\s*)/,
    '$1'
);

// 更精確的替換：移除 updateNavDailyLink 函數內部不應該有的調用
articleContent = articleContent.replace(
    /(\s+}\);\s*\/\/ 即使不是文章頁面，也確保導覽列連結已更新[\s\S]*?setTimeout\(\(\) => \{[\s\S]*?updateNavDailyLink\(site\);[\s\S]*?\}, 200\);[\s\S]*?)(\s+if \(updatedCount > 0\))/,
    '$1$2'
);

// 如果上面的替換失敗，直接查找並移除
if (articleContent.includes('即使不是文章頁面，也確保導覽列連結已更新') && 
    articleContent.indexOf('即使不是文章頁面，也確保導覽列連結已更新') < articleContent.indexOf('async function updateNavDailyLink')) {
    // 這個調用不應該在 updateNavDailyLink 函數內部
    articleContent = articleContent.replace(
        /(\s+}\);\s*\/\/ 即使不是文章頁面，也確保導覽列連結已更新\s*setTimeout\(\(\) => \{\s*updateNavDailyLink\(site\);\s*\}, 200\);\s*)/,
        '$1'
    );
}

fs.writeFileSync(articleCmsPath, articleContent, 'utf8');
console.log('✅ 已修復 article-cms.js 的錯誤');

