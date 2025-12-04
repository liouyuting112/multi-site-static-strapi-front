// =========================================================
// 匯入所有內容到雲端 Strapi
// 使用方式：
//   $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"
//   $env:STRAPI_TOKEN="你的API_TOKEN"
//   node import-to-cloud.js
// =========================================================

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'https://tidy-fireworks-ad201d981a.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
    console.error('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數');
    console.log('\n請執行：');
    console.log('  $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"');
    console.log('  $env:STRAPI_TOKEN="你的API_TOKEN"');
    console.log('  node import-to-cloud.js');
    process.exit(1);
}

// 設定環境變數，讓子腳本可以使用
process.env.STRAPI_URL = STRAPI_URL;
process.env.STRAPI_TOKEN = STRAPI_TOKEN;

console.log('🚀 開始匯入內容到雲端 Strapi...');
console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

function runScript(scriptPath, description) {
    return new Promise((resolve) => {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`📦 ${description}`);
        console.log(`${'='.repeat(50)}\n`);
        
        const scriptFullPath = join(__dirname, scriptPath);
        const child = spawn('node', [scriptFullPath], {
            env: {
                ...process.env,
                STRAPI_URL,
                STRAPI_TOKEN
            },
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                console.log(`\n✅ ${description} 完成\n`);
                resolve(true);
            } else {
                console.error(`\n❌ ${description} 失敗 (退出碼: ${code})\n`);
                resolve(false);
            }
        });
        
        child.on('error', (error) => {
            console.error(`\n❌ ${description} 執行錯誤:`, error.message);
            resolve(false);
        });
    });
}

async function main() {
    const scripts = [
        { file: 'import-pages.js', desc: '匯入頁面 (Pages)' },
        { file: 'import-fixed-article.js', desc: '匯入固定文章 (Fixed Articles)' },
    ];
    
    let successCount = 0;
    
    // 先匯入固定文章（需要指定 site 和 slug）
    console.log('⚠️  注意：固定文章需要手動匯入，因為需要指定 site 和 slug');
    console.log('   使用方式：');
    console.log('   node import-fixed-article.js <site> <slug>');
    console.log('   例如：');
    console.log('   node import-fixed-article.js site1 retro-vs-modern');
    console.log('   node import-fixed-article.js site1 collector-guide');
    console.log('   node import-fixed-article.js site1 cartridge-care\n');
    
    // 只執行匯入頁面
    const success = await runScript('import-pages.js', '匯入頁面 (Pages)');
    if (success) successCount++;
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 匯入結果：${successCount}/1 完成（頁面）`);
    console.log(`${'='.repeat(50)}\n`);
    
    console.log('📝 接下來需要手動匯入：');
    console.log('\n1. 固定文章：');
    console.log('   node import-fixed-article.js <site> <slug>');
    console.log('\n2. 每日精選文章：');
    console.log('   node import-new-article.js <site> <slug>');
    console.log('\n   或使用 list-all.js 查看本機有哪些文章需要匯入\n');
}

main().catch(console.error);

