// 測試上傳單一 Post
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

// 讀取一個簡單的文章
const filePath = path.join(__dirname, 'site1', 'articles', '2025-12-01.html');
const html = fs.readFileSync(filePath, 'utf-8');

// 提取標題
const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
const title = titleMatch ? titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim() : '測試文章';

// 提取內容
const articleMatch = html.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
let htmlContent = articleMatch ? articleMatch[1].trim() : '';
htmlContent = htmlContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();

console.log('📝 測試上傳 Post...');
console.log(`標題: ${title}`);
console.log(`內容長度: ${htmlContent.length} 字元\n`);

// 測試不同的 payload
const testPayloads = [
    {
        name: '最簡單版本（只有必填欄位）',
        payload: {
            site: 'site1',
            category: 'daily',
            slug: '2025-12-01-test',
            title: title,
            html: htmlContent.substring(0, 500) // 先測試短內容
        }
    },
    {
        name: '加上 publishedAt',
        payload: {
            site: 'site1',
            category: 'daily',
            slug: '2025-12-01-test2',
            title: title,
            html: htmlContent.substring(0, 500),
            publishedAt: '2025-12-01T09:00:00.000Z'
        }
    },
    {
        name: '加上 isFeatured',
        payload: {
            site: 'site1',
            category: 'daily',
            slug: '2025-12-01-test3',
            title: title,
            html: htmlContent.substring(0, 500),
            publishedAt: '2025-12-01T09:00:00.000Z',
            isFeatured: true
        }
    }
];

async function testUpload(payload, name) {
    console.log(`\n🧪 測試: ${name}`);
    console.log(`Payload:`, JSON.stringify(payload, null, 2).substring(0, 300));
    
    try {
        const jsonBody = JSON.stringify({ data: payload });
        const buffer = Buffer.from(jsonBody, 'utf-8');
        
        const response = await fetch(`${STRAPI_URL}/api/posts`, {
            method: 'POST',
            headers,
            body: buffer
        });
        
        const responseText = await response.text();
        console.log(`狀態碼: ${response.status}`);
        
        if (response.ok) {
            console.log('✅ 成功！');
            const result = JSON.parse(responseText);
            console.log(`ID: ${result.data?.id || result.data?.documentId}`);
            return true;
        } else {
            console.log('❌ 失敗');
            console.log(`錯誤: ${responseText.substring(0, 500)}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ 錯誤: ${error.message}`);
        return false;
    }
}

async function main() {
    for (const test of testPayloads) {
        const success = await testUpload(test.payload, test.name);
        if (success) {
            console.log('\n✅ 找到可用的格式！');
            break;
        }
        await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
    }
}

main().catch(console.error);



