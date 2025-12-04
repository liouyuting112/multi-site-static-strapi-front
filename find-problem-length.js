// 找出導致問題的內容長度
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

async function testLength(length) {
    const filePath = path.join(__dirname, 'site1', 'articles', '2025-12-01.html');
    const raw = fs.readFileSync(filePath, 'utf-8');
    
    const titleMatch = raw.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim() : '測試';
    
    const articleMatch = raw.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    let htmlContent = articleMatch ? articleMatch[1].trim() : '';
    htmlContent = htmlContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    
    // 清理換行符
    htmlContent = htmlContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    const testContent = htmlContent.substring(0, length);
    
    const payload = {
        data: {
            site: 'site1',
            category: 'daily',
            slug: `test-length-${length}`,
            title: title,
            html: testContent
        }
    };
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/posts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });
        
        return response.ok;
    } catch (error) {
        return false;
    }
}

async function binarySearch() {
    console.log('🔍 使用二分搜尋找出問題長度...\n');
    
    let min = 100;  // 已知可以
    let max = 2000; // 假設上限
    let lastSuccess = 100;
    
    while (min < max) {
        const mid = Math.floor((min + max) / 2);
        console.log(`測試長度: ${mid} 字元...`);
        
        const success = await testLength(mid);
        
        if (success) {
            console.log(`  ✅ 成功`);
            lastSuccess = mid;
            min = mid + 1;
        } else {
            console.log(`  ❌ 失敗`);
            max = mid;
        }
        
        // 避免太快
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 結果：`);
    console.log(`  最大成功長度: ${lastSuccess} 字元`);
    console.log(`  失敗長度: ${min} 字元`);
    
    // 測試臨界點附近
    console.log(`\n🧪 測試臨界點附近...`);
    for (let len = lastSuccess; len <= lastSuccess + 50; len += 10) {
        console.log(`測試 ${len} 字元...`);
        const success = await testLength(len);
        console.log(`  ${success ? '✅' : '❌'}`);
        if (!success) {
            console.log(`\n⚠️  問題出現在 ${len} 字元附近`);
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }
}

binarySearch().catch(console.error);


