// 比對手動建立和腳本發送的格式差異
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = '446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

async function getManualPost() {
    const response = await fetch(`${STRAPI_URL}/api/posts?pagination[limit]=1&sort=createdAt:desc`, {
        headers
    });
    const data = await response.json();
    return data.data?.[0] || null;
}

async function testWithManualFormat() {
    console.log('🔍 獲取手動建立的 Post 格式...\n');
    
    const manualPost = await getManualPost();
    if (!manualPost) {
        console.log('⚠️  請先在 Strapi 後台手動建立一篇 Post');
        return;
    }
    
    const attrs = manualPost.attributes || manualPost;
    console.log('📋 手動建立的 Post 格式：');
    console.log(JSON.stringify({
        site: attrs.site,
        category: attrs.category,
        slug: attrs.slug,
        title: attrs.title,
        htmlLength: attrs.html?.length || 0,
        isFeatured: attrs.isFeatured,
        publishedAt: attrs.publishedAt
    }, null, 2));
    
    // 讀取實際文章
    const filePath = path.join(__dirname, 'site1', 'articles', '2025-12-01.html');
    const raw = fs.readFileSync(filePath, 'utf-8');
    
    const titleMatch = raw.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim() : '測試';
    
    const articleMatch = raw.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    let htmlContent = articleMatch ? articleMatch[1].trim() : '';
    htmlContent = htmlContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    
    // 測試：使用與手動建立完全相同的格式
    console.log('\n🧪 測試使用相同格式上傳完整內容...\n');
    
    const payload = {
        data: {
            site: 'site1',
            category: 'daily',
            slug: 'test-same-format-001',
            title: title,
            html: htmlContent  // 直接使用，不清理
        }
    };
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/posts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        const responseText = await response.text();
        console.log(`狀態碼: ${response.status}`);
        
        if (response.ok) {
            console.log('✅ 成功！使用原始格式可以上傳');
            const result = JSON.parse(responseText);
            console.log(`ID: ${result.data?.id || result.data?.documentId}`);
        } else {
            console.log('❌ 失敗');
            console.log('錯誤:', responseText.substring(0, 500));
            
            // 嘗試清理後再上傳
            console.log('\n🧪 嘗試清理 HTML 後上傳...\n');
            let cleanHtml = htmlContent;
            cleanHtml = cleanHtml.replace(/\r\n/g, '\n');
            cleanHtml = cleanHtml.replace(/\r/g, '\n');
            cleanHtml = cleanHtml.trim();
            
            payload.data.html = cleanHtml;
            payload.data.slug = 'test-cleaned-format-001';
            
            const response2 = await fetch(`${STRAPI_URL}/api/posts`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            
            const responseText2 = await response2.text();
            console.log(`狀態碼: ${response2.status}`);
            
            if (response2.ok) {
                console.log('✅ 成功！清理後可以上傳');
            } else {
                console.log('❌ 清理後仍然失敗');
                console.log('錯誤:', responseText2.substring(0, 500));
            }
        }
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    }
}

testWithManualFormat().catch(console.error);


