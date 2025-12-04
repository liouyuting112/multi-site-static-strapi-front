// =========================================================
// 從本機 Strapi 讀取資料，生成可在瀏覽器 Console 執行的同步腳本
// 使用方式：
//   $env:STRAPI_URL="http://localhost:1337"
//   node generate-browser-sync.js
// 然後在雲端 Strapi 後台的 Console 中執行生成的腳本
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCAL_STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';

const headers = {
    'Content-Type': 'application/json'
};

async function getAllFromLocal(endpoint) {
    try {
        const url = `${LOCAL_STRAPI_URL}/api/${endpoint}?pagination[limit]=1000`;
        const response = await fetch(url, { headers });
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

async function main() {
    console.log('📥 從本機 Strapi 取得資料...');
    
    const pages = await getAllFromLocal('pages');
    const posts = await getAllFromLocal('posts');
    
    console.log(`✅ 取得 ${pages.length} 個頁面，${posts.length} 篇文章\n`);
    
    // 生成瀏覽器腳本
    let browserScript = `// =========================================================
// 在雲端 Strapi 後台 Console 中執行的同步腳本
// 使用方式：
// 1. 登入雲端 Strapi 後台
// 2. 按 F12 打開開發者工具
// 3. 切換到 Console 標籤
// 4. 複製貼上這個腳本並執行
// =========================================================

(async function() {
    console.log('🚀 開始同步資料到雲端 Strapi...');
    
    const STRAPI_URL = window.location.origin;
    console.log(\`📍 Strapi URL: \${STRAPI_URL}\`);
    
    let successCount = 0;
    let failCount = 0;
    
    // 同步頁面
    const pages = ${JSON.stringify(pages, null, 4)};
    console.log(\`\\n📄 開始同步 \${pages.length} 個頁面...\\n\`);
    
    for (const page of pages) {
        try {
            const attrs = page.attributes || page;
            const payload = { data: attrs };
            
            // 檢查是否已存在
            const checkUrl = \`\${STRAPI_URL}/api/pages?filters[site][\$eq]=\${attrs.site}&filters[type][\$eq]=\${attrs.type}\`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();
            const existing = checkData.data?.[0];
            
            let result;
            if (existing) {
                // 更新
                const updateUrl = \`\${STRAPI_URL}/api/pages/\${existing.id}\`;
                result = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(\`  ✅ 更新頁面: \${attrs.site} - \${attrs.type}\`);
                    successCount++;
                } else {
                    console.error(\`  ❌ 更新失敗: \${attrs.site} - \${attrs.type}\`);
                    failCount++;
                }
            } else {
                // 建立
                const createUrl = \`\${STRAPI_URL}/api/pages\`;
                result = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(\`  ✅ 建立頁面: \${attrs.site} - \${attrs.type}\`);
                    successCount++;
                } else {
                    console.error(\`  ❌ 建立失敗: \${attrs.site} - \${attrs.type}\`);
                    failCount++;
                }
            }
        } catch (error) {
            console.error(\`  ❌ 錯誤: \${error.message}\`);
            failCount++;
        }
    }
    
    // 同步文章
    const posts = ${JSON.stringify(posts, null, 4)};
    console.log(\`\\n📝 開始同步 \${posts.length} 篇文章...\\n\`);
    
    for (const post of posts) {
        try {
            const attrs = post.attributes || post;
            const payload = { data: attrs };
            
            // 檢查是否已存在
            const checkUrl = \`\${STRAPI_URL}/api/posts?filters[site][\$eq]=\${attrs.site}&filters[slug][\$eq]=\${attrs.slug}\`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();
            const existing = checkData.data?.[0];
            
            let result;
            if (existing) {
                // 更新
                const updateUrl = \`\${STRAPI_URL}/api/posts/\${existing.id}\`;
                result = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(\`  ✅ 更新文章: \${attrs.site} - \${attrs.slug}\`);
                    successCount++;
                } else {
                    console.error(\`  ❌ 更新失敗: \${attrs.site} - \${attrs.slug}\`);
                    failCount++;
                }
            } else {
                // 建立
                const createUrl = \`\${STRAPI_URL}/api/posts\`;
                result = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (result.ok) {
                    console.log(\`  ✅ 建立文章: \${attrs.site} - \${attrs.slug}\`);
                    successCount++;
                } else {
                    console.error(\`  ❌ 建立失敗: \${attrs.site} - \${attrs.slug}\`);
                    failCount++;
                }
            }
        } catch (error) {
            console.error(\`  ❌ 錯誤: \${error.message}\`);
            failCount++;
        }
    }
    
    console.log(\`\\n📊 同步完成：成功 \${successCount}，失敗 \${failCount}\`);
})();
`;

    // 保存到檔案
    const outputPath = path.join(__dirname, 'browser-sync-script.js');
    fs.writeFileSync(outputPath, browserScript, 'utf-8');
    
    console.log(`✅ 瀏覽器腳本已生成：${outputPath}`);
    console.log('\n📋 下一步：');
    console.log('1. 登入雲端 Strapi 後台');
    console.log('2. 按 F12 打開開發者工具');
    console.log('3. 切換到 Console 標籤');
    console.log(`4. 打開檔案：${outputPath}`);
    console.log('5. 複製所有內容並貼到 Console 執行');
}

main().catch(console.error);

