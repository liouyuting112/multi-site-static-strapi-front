// =========================================================
// 從本機 Strapi 同步資料到雲端 Strapi
// 使用方式：
//   $env:STRAPI_URL="http://localhost:1337"
//   $env:CLOUD_STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"
//   $env:CLOUD_STRAPI_TOKEN="你的雲端API_TOKEN"
//   node sync-local-to-cloud.js
// =========================================================

import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修復 SSL/TLS 問題（必須在最前面）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const LOCAL_STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const CLOUD_STRAPI_URL = process.env.CLOUD_STRAPI_URL || 'https://tidy-fireworks-ad201d981a.strapiapp.com';
const CLOUD_STRAPI_TOKEN = process.env.CLOUD_STRAPI_TOKEN || '';

if (!CLOUD_STRAPI_TOKEN) {
    console.error('❌ 錯誤：請設定 CLOUD_STRAPI_TOKEN 環境變數');
    console.log('\n請執行：');
    console.log('  $env:CLOUD_STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"');
    console.log('  $env:CLOUD_STRAPI_TOKEN="你的雲端API_TOKEN"');
    console.log('  node sync-local-to-cloud.js');
    process.exit(1);
}

const localHeaders = {
    'Content-Type': 'application/json'
};

const cloudHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${CLOUD_STRAPI_TOKEN}`
};

// =========================================================
// 從本機 Strapi 取得所有資料
// =========================================================

async function getAllFromLocal(endpoint) {
    try {
        const url = `${LOCAL_STRAPI_URL}/api/${endpoint}?pagination[limit]=1000`;
        const response = await fetch(url, { headers: localHeaders });
        if (response.ok) {
            const data = await response.json();
            return data.data || [];
        }
        return [];
    } catch (error) {
        console.error(`❌ 從本機取得 ${endpoint} 失敗:`, error.message);
        return [];
    }
}

// =========================================================
// 同步到雲端 Strapi
// =========================================================

async function syncToCloud(endpoint, items, itemName) {
    console.log(`\n📦 開始同步 ${itemName}...`);
    console.log(`   找到 ${items.length} 筆資料\n`);
    
    let successCount = 0;
    let failCount = 0;
    
    for (const item of items) {
        try {
            const attrs = item.attributes || item;
            const itemId = item.id;
            
            // 檢查雲端是否已存在
            const checkUrl = `${CLOUD_STRAPI_URL}/api/${endpoint}?filters[id][$eq]=${itemId}`;
            const checkRes = await fetch(checkUrl, { 
                headers: cloudHeaders,
                // 跳過 SSL 驗證
                agent: new (await import('https')).Agent({ rejectUnauthorized: false })
            });
            
            const payload = { data: attrs };
            
            if (checkRes.ok) {
                const checkData = await checkRes.json();
                const existing = checkData.data?.[0];
                
                if (existing) {
                    // 更新
                    const updateUrl = `${CLOUD_STRAPI_URL}/api/${endpoint}/${existing.id}`;
                    const updateRes = await fetch(updateUrl, {
                        method: 'PUT',
                        headers: cloudHeaders,
                        body: JSON.stringify(payload),
                        agent: new (await import('https')).Agent({ rejectUnauthorized: false })
                    });
                    
                    if (updateRes.ok) {
                        console.log(`  ✅ 更新: ${attrs.slug || attrs.title || itemId}`);
                        successCount++;
                    } else {
                        console.error(`  ❌ 更新失敗: ${attrs.slug || attrs.title || itemId}`);
                        failCount++;
                    }
                } else {
                    // 建立
                    const createUrl = `${CLOUD_STRAPI_URL}/api/${endpoint}`;
                    const createRes = await fetch(createUrl, {
                        method: 'POST',
                        headers: cloudHeaders,
                        body: JSON.stringify(payload),
                        agent: new (await import('https')).Agent({ rejectUnauthorized: false })
                    });
                    
                    if (createRes.ok) {
                        console.log(`  ✅ 建立: ${attrs.slug || attrs.title || itemId}`);
                        successCount++;
                    } else {
                        console.error(`  ❌ 建立失敗: ${attrs.slug || attrs.title || itemId}`);
                        failCount++;
                    }
                }
            } else {
                console.error(`  ❌ 查詢失敗: ${attrs.slug || attrs.title || itemId}`);
                failCount++;
            }
        } catch (error) {
            console.error(`  ❌ 錯誤:`, error.message);
            failCount++;
        }
    }
    
    console.log(`\n📊 ${itemName} 同步完成：成功 ${successCount}，失敗 ${failCount}`);
    return { successCount, failCount };
}

// =========================================================
// 主程序
// =========================================================

async function main() {
    console.log('🚀 開始從本機 Strapi 同步資料到雲端...');
    console.log(`📍 本機 Strapi: ${LOCAL_STRAPI_URL}`);
    console.log(`📍 雲端 Strapi: ${CLOUD_STRAPI_URL}\n`);
    
    // 取得本機資料
    console.log('📥 從本機 Strapi 取得資料...');
    const pages = await getAllFromLocal('pages');
    const posts = await getAllFromLocal('posts');
    
    console.log(`✅ 取得 ${pages.length} 個頁面，${posts.length} 篇文章\n`);
    
    // 同步頁面
    await syncToCloud('pages', pages, '頁面 (Pages)');
    
    // 同步文章
    await syncToCloud('posts', posts, '文章 (Posts)');
    
    console.log('\n✅ 同步完成！');
}

main().catch(console.error);

