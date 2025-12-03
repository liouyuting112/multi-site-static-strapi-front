import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修復 article-cms.js 第 5 行的語法錯誤
const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let articleContent = fs.readFileSync(articleCmsPath, 'utf8');

// 修復第 5 行的語法錯誤（缺少結尾引號）
articleContent = articleContent.replace(
    /console\.log\('?? article-cms\.js 已[^']*\);?/,
    "console.log('✅ article-cms.js 已載入');"
);

// 如果上面的替換失敗，嘗試更寬鬆的匹配
if (articleContent.includes('?? article-cms.js')) {
    articleContent = articleContent.replace(
        /console\.log\('[^']*article-cms\.js[^']*\)/,
        "console.log('✅ article-cms.js 已載入');"
    );
}

// 如果還是失敗，直接替換第 5 行
const lines = articleContent.split('\n');
if (lines.length > 4 && lines[4].includes('article-cms.js')) {
    lines[4] = "console.log('✅ article-cms.js 已載入');";
    articleContent = lines.join('\n');
}

fs.writeFileSync(articleCmsPath, articleContent, 'utf8');
console.log('✅ 已修復 article-cms.js 第 5 行的語法錯誤');

