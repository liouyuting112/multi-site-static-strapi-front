import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const articleCmsPath = path.join(__dirname, '..', 'article-cms.js');
let content = fs.readFileSync(articleCmsPath, 'utf8');

// 直接替換 else 分支
const pattern = /(\s+\} else \{[\s\S]*?console\.log\([^)]+\);)(\s+\}\);)/;
const replacement = `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);$2`;

if (pattern.test(content)) {
    content = content.replace(pattern, replacement);
    fs.writeFileSync(articleCmsPath, content, 'utf8');
    console.log('✅ 已修復 else 分支，添加了 updateNavDailyLink 調用');
} else {
    console.log('⚠️  未找到匹配的模式，檢查文件內容...');
    // 嘗試更寬鬆的匹配
    const loosePattern = /(\} else \{[\s\S]{0,200}console\.log[^}]+)(\}\);)/;
    if (loosePattern.test(content)) {
        content = content.replace(loosePattern, `$1
        // 即使不是文章頁面，也確保導覽列連結已更新
        setTimeout(() => {
            updateNavDailyLink(site);
        }, 200);$2`);
        fs.writeFileSync(articleCmsPath, content, 'utf8');
        console.log('✅ 已修復 else 分支（使用寬鬆匹配）');
    } else {
        console.log('❌ 無法找到 else 分支，請手動檢查');
    }
}


