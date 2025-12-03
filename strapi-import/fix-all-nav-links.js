import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修復 article-cms.js
const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let articleContent = fs.readFileSync(articleCmsPath, 'utf8');

// 修復第 450 行的亂碼 console.log，並添加 updateNavDailyLink 調用
articleContent = articleContent.replace(
    /(\} else \{[\s\S]*?console\.log\('[^']*找不到[^']*章容[^']*'\);)([\s\S]*?\}\);)/,
    `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);$2`
);

// 如果上面的替換失敗，嘗試更簡單的模式
if (!articleContent.includes('即使不是文章頁面，也確保導覽列連結已更新')) {
    articleContent = articleContent.replace(
        /(\} else \{[\s\S]*?console\.log\([^)]+\);)([\s\S]*?\}\);)/,
        `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);$2`
    );
}

fs.writeFileSync(articleCmsPath, articleContent, 'utf8');
console.log('✅ 已修復 article-cms.js');

// 驗證所有腳本都正確配置
console.log('\n📋 驗證所有腳本的 updateNavDailyLink 配置：');

const scripts = [
    { name: 'home-cms.js', path: path.join(__dirname, '..', 'home-cms.js') },
    { name: 'page-cms.js', path: path.join(__dirname, '..', 'page-cms.js') },
    { name: 'article-cms.js', path: articleCmsPath },
    { name: 'all-daily-articles-cms.js', path: path.join(__dirname, '..', 'all-daily-articles-cms.js') }
];

scripts.forEach(script => {
    const content = fs.readFileSync(script.path, 'utf8');
    const hasUpdateNavDailyLink = content.includes('updateNavDailyLink');
    const hasDOMContentLoaded = content.includes("document.addEventListener('DOMContentLoaded'");
    const hasFunction = content.includes('async function updateNavDailyLink') || content.includes('function updateNavDailyLink');
    
    console.log(`  ${script.name}:`);
    console.log(`    - 有 updateNavDailyLink 函數: ${hasFunction ? '✅' : '❌'}`);
    console.log(`    - 有 DOMContentLoaded 事件: ${hasDOMContentLoaded ? '✅' : '❌'}`);
    console.log(`    - 有調用 updateNavDailyLink: ${hasUpdateNavDailyLink ? '✅' : '❌'}`);
});

console.log('\n✅ 修復完成！');

