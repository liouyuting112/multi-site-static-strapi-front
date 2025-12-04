// =========================================================
// 批量匯入所有站點的所有文章
// 使用方式：
//   $env:STRAPI_URL="http://localhost:1337"
//   node import-all-articles.js
// =========================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

// 固定文章列表（每個站點）
const fixedArticles = {
    site1: ['retro-vs-modern', 'collector-guide', 'cartridge-care'],
    site2: ['monitor-hz', 'keyboard-switches', 'aim-training'],
    site3: [], // 需要根據實際檔案填入
    site4: [], // 需要根據實際檔案填入
    site5: []  // 需要根據實際檔案填入
};

// 取得所有每日文章（從檔案系統掃描）
function getDailyArticles(site) {
    const articlesDir = path.join(__dirname, '..', site, 'articles');
    if (!fs.existsSync(articlesDir)) {
        return [];
    }
    
    const files = fs.readdirSync(articlesDir);
    // 過濾出日期格式的檔案（例如：2025-12-01.html）
    return files
        .filter(file => /^\d{4}-\d{2}-\d{2}\.html$/.test(file))
        .map(file => file.replace('.html', ''))
        .sort()
        .reverse(); // 最新的在前
}

function runScript(script, args) {
    return new Promise((resolve) => {
        const scriptPath = path.join(__dirname, script);
        const child = spawn('node', [scriptPath, ...args], {
            env: {
                ...process.env,
                STRAPI_URL
            },
            stdio: 'inherit',
            shell: true
        });
        
        child.on('close', (code) => {
            resolve(code === 0);
        });
        
        child.on('error', (error) => {
            console.error(`❌ 執行錯誤: ${error.message}`);
            resolve(false);
        });
    });
}

async function main() {
    console.log('🚀 開始批量匯入所有文章...');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
    
    let totalSuccess = 0;
    let totalFail = 0;
    
    // 處理每個站點
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        console.log(`\n${'='.repeat(50)}`);
        console.log(`處理 ${site}`);
        console.log(`${'='.repeat(50)}\n`);
        
        // 匯入固定文章
        const fixed = fixedArticles[site] || [];
        if (fixed.length > 0) {
            console.log(`📝 匯入 ${fixed.length} 篇固定文章...`);
            for (const slug of fixed) {
                const success = await runScript('import-fixed-article.js', [site, slug]);
                if (success) totalSuccess++;
                else totalFail++;
            }
        }
        
        // 匯入每日文章
        const daily = getDailyArticles(site);
        if (daily.length > 0) {
            console.log(`\n📅 匯入 ${daily.length} 篇每日文章...`);
            for (const slug of daily) {
                const success = await runScript('import-new-article.js', [site, slug]);
                if (success) totalSuccess++;
                else totalFail++;
            }
        }
    }
    
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 匯入完成：成功 ${totalSuccess}，失敗 ${totalFail}`);
    console.log(`${'='.repeat(50)}\n`);
    
    console.log('✅ 所有文章已匯入到本機 Strapi！');
    console.log('\n📋 下一步：');
    console.log('1. 執行：node generate-browser-sync.js');
    console.log('2. 在雲端 Strapi 後台 Console 執行生成的腳本');
}

main().catch(console.error);

