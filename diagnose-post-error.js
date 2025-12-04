// 診斷 Post 上傳錯誤
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

async function testMinimalPost() {
    console.log('🧪 測試最簡單的 Post...\n');
    
    // 最簡單的 payload
    const payload = {
        data: {
            site: 'site1',
            category: 'daily',
            slug: 'test-minimal-001',
            title: '測試文章',
            html: '<p>這是一篇測試文章</p>'
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
        console.log(`回應: ${responseText}\n`);
        
        if (response.ok) {
            console.log('✅ 最簡單的 Post 可以上傳！');
            return true;
        } else {
            console.log('❌ 失敗，錯誤詳情：');
            try {
                const error = JSON.parse(responseText);
                console.log(JSON.stringify(error, null, 2));
            } catch (e) {
                console.log(responseText);
            }
            return false;
        }
    } catch (error) {
        console.error('❌ 請求錯誤:', error.message);
        return false;
    }
}

async function checkExistingPosts() {
    console.log('🔍 檢查現有的 Posts...\n');
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/posts?pagination[limit]=5`, {
            headers
        });
        
        const data = await response.json();
        console.log(`找到 ${data.data?.length || 0} 篇現有文章`);
        
        if (data.data && data.data.length > 0) {
            console.log('\n範例文章結構：');
            const post = data.data[0];
            console.log(JSON.stringify(post, null, 2).substring(0, 500));
        }
        
        return data.data || [];
    } catch (error) {
        console.error('❌ 查詢錯誤:', error.message);
        return [];
    }
}

async function testWithAllFields() {
    console.log('\n🧪 測試包含所有欄位的 Post...\n');
    
    const payload = {
        data: {
            site: 'site1',
            category: 'daily',
            slug: 'test-full-001',
            title: '完整測試文章',
            html: '<p>這是完整的測試內容</p><h2>小標題</h2><p>更多內容</p>',
            excerpt: '這是摘要',
            date: '2025-12-01',
            imageUrl: 'https://example.com/image.jpg',
            isFeatured: true
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
            console.log('✅ 完整欄位的 Post 可以上傳！');
            return true;
        } else {
            console.log('❌ 失敗');
            try {
                const error = JSON.parse(responseText);
                console.log('錯誤詳情：', JSON.stringify(error, null, 2));
            } catch (e) {
                console.log('錯誤:', responseText);
            }
            return false;
        }
    } catch (error) {
        console.error('❌ 請求錯誤:', error.message);
        return false;
    }
}

async function main() {
    console.log('🔍 開始診斷 Post 上傳問題...\n');
    console.log('='.repeat(50));
    
    // 1. 檢查現有文章
    await checkExistingPosts();
    
    // 2. 測試最簡單的 Post
    const minimalSuccess = await testMinimalPost();
    
    if (minimalSuccess) {
        // 3. 如果簡單的可以，測試完整的
        await testWithAllFields();
    } else {
        console.log('\n⚠️  連最簡單的 Post 都無法上傳，可能是：');
        console.log('   1. Strapi 服務器配置問題');
        console.log('   2. API Token 權限不足');
        console.log('   3. Post Content Type 有驗證規則限制');
        console.log('\n建議：');
        console.log('   1. 檢查 Strapi 後台的錯誤日誌');
        console.log('   2. 嘗試在後台手動建立一篇 Post');
        console.log('   3. 檢查 API Token 是否有 Full access 權限');
    }
}

main().catch(console.error);


