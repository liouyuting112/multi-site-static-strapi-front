// =========================================================
// 修復 SSL 問題的匯入腳本
// 使用方式：
//   $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"
//   $env:STRAPI_TOKEN="你的API_TOKEN"
//   $env:NODE_TLS_REJECT_UNAUTHORIZED="0"
//   node fix-ssl-import.js
// =========================================================

// 暫時禁用 SSL 驗證（僅用於開發/測試）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'https://tidy-fireworks-ad201d981a.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
    console.error('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數');
    console.log('\n請執行：');
    console.log('  $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"');
    console.log('  $env:STRAPI_TOKEN="你的API_TOKEN"');
    console.log('  $env:NODE_TLS_REJECT_UNAUTHORIZED="0"');
    console.log('  node fix-ssl-import.js');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json'
};

if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

// 測試連接
async function testConnection() {
    try {
        console.log('🔍 測試連接到 Strapi...');
        const response = await fetch(`${STRAPI_URL}/api`, {
            method: 'GET',
            headers
        });
        
        if (response.ok) {
            console.log('✅ 連接成功！\n');
            return true;
        } else {
            console.error(`❌ 連接失敗: ${response.status} ${response.statusText}`);
            return false;
        }
    } catch (error) {
        console.error('❌ 連接錯誤:', error.message);
        return false;
    }
}

// 匯入頁面
async function importPages() {
    console.log('📄 開始匯入頁面...\n');
    
    const pageDefs = [
        { type: 'home', file: 'index.html', slug: 'index' },
        { type: 'contact', file: 'contact.html', slug: 'contact' },
        { type: 'about', file: 'about.html', slug: 'about' },
        { type: 'privacy', file: 'privacy.html', slug: 'privacy' }
    ];
    
    let successCount = 0;
    let failCount = 0;
    
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const siteDir = path.join(__dirname, '..', site);
        
        if (!fs.existsSync(siteDir)) {
            console.log(`⚠️  找不到目錄：${site}，跳過`);
            continue;
        }
        
        console.log(`\n處理 ${site}...`);
        
        for (const def of pageDefs) {
            const filePath = path.join(siteDir, def.file);
            if (!fs.existsSync(filePath)) {
                console.log(`  ⏭️  跳過：${def.file}（檔案不存在）`);
                continue;
            }
            
            try {
                const html = fs.readFileSync(filePath, 'utf-8');
                
                // 提取標題
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
                const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*.*$/, '').trim() : def.type;
                
                // 提取內容（從 <main> 或 <body>）
                let content = '';
                const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
                if (mainMatch) {
                    content = mainMatch[1].trim();
                } else {
                    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
                    if (bodyMatch) {
                        content = bodyMatch[1].trim();
                    }
                }
                
                // 檢查是否已存在
                const checkUrl = `${STRAPI_URL}/api/pages?filters[site][$eq]=${site}&filters[type][$eq]=${def.type}`;
                const checkRes = await fetch(checkUrl, { headers });
                const checkData = await checkRes.json();
                
                const existing = checkData.data?.[0];
                
                const payload = {
                    data: {
                        site,
                        type: def.type,
                        slug: def.slug,
                        title,
                        html: content
                    }
                };
                
                let result;
                if (existing) {
                    // 更新
                    const updateUrl = `${STRAPI_URL}/api/pages/${existing.id}`;
                    result = await fetch(updateUrl, {
                        method: 'PUT',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    console.log(`  ✅ 更新：${def.type}`);
                } else {
                    // 建立
                    const createUrl = `${STRAPI_URL}/api/pages`;
                    result = await fetch(createUrl, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify(payload)
                    });
                    console.log(`  ✅ 建立：${def.type}`);
                }
                
                if (result.ok) {
                    successCount++;
                } else {
                    console.error(`  ❌ 失敗：${def.type} (${result.status})`);
                    failCount++;
                }
            } catch (error) {
                console.error(`  ❌ 錯誤：${def.type} - ${error.message}`);
                failCount++;
            }
        }
    }
    
    console.log(`\n📊 頁面匯入完成：成功 ${successCount}，失敗 ${failCount}`);
    return { successCount, failCount };
}

async function main() {
    console.log('🚀 開始匯入內容到雲端 Strapi...');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
    
    // 測試連接
    const connected = await testConnection();
    if (!connected) {
        console.error('❌ 無法連接到 Strapi，請檢查：');
        console.error('   1. STRAPI_URL 是否正確');
        console.error('   2. STRAPI_TOKEN 是否正確');
        console.error('   3. 網路連接是否正常');
        process.exit(1);
    }
    
    // 匯入頁面
    await importPages();
    
    console.log('\n✅ 匯入完成！');
    console.log('\n⚠️  注意：');
    console.log('   1. 固定文章和每日文章需要手動匯入');
    console.log('   2. 使用方式：');
    console.log('      node import-new-article.js <site> <slug>');
    console.log('      node import-fixed-article.js <site> <slug>');
    console.log('   3. 記得設定環境變數：');
    console.log('      $env:NODE_TLS_REJECT_UNAUTHORIZED="0"');
}

main().catch(console.error);

