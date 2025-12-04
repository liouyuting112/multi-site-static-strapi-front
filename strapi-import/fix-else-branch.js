import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let content = fs.readFileSync(articleCmsPath, 'utf8');

// 找到 else 分支並添加 updateNavDailyLink 調用
const lines = content.split('\n');
let modified = false;

for (let i = 0; i < lines.length; i++) {
    // 找到 } else { 後面跟著 console.log 的行
    if (lines[i].trim() === '} else {' && 
        i + 1 < lines.length && 
        lines[i + 1].includes('console.log') &&
        lines[i + 1].includes('找不到') &&
        !content.substring(content.indexOf(lines[i]), content.indexOf(lines[i + 2] || '')).includes('updateNavDailyLink')) {
        
        // 在 console.log 後面添加 updateNavDailyLink 調用
        const insertIndex = i + 2;
        const indent = '        '; // 8 個空格
        lines.splice(insertIndex, 0, 
            `${indent}// 即使不是文章頁面，也確保導覽列連結已更新`,
            `${indent}setTimeout(() => {`,
            `${indent}    updateNavDailyLink(site);`,
            `${indent}}, 200);`
        );
        modified = true;
        break;
    }
}

if (modified) {
    fs.writeFileSync(articleCmsPath, lines.join('\n'), 'utf8');
    console.log('✅ 已修復 else 分支');
} else {
    console.log('⚠️  未找到需要修復的 else 分支，可能已經修復過了');
}


