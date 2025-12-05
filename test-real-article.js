// 測試實際文章內容
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

function extractArticleHtml(rawHtml) {
    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        return content;
    }
    return null;
}

function extractTitle(rawHtml) {
    const titleMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
        return titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim();
    }
    return null;
}

async function testRealArticle() {
    const filePath = path.join(__dirname, 'site1', 'articles', '2025-12-01.html');
    const raw = fs.readFileSync(filePath, 'utf-8');
    
    const title = extractTitle(raw);
    const htmlContent = extractArticleHtml(raw);
    
    console.log('📝 測試實際文章...');
    console.log(`標題: ${title}`);
    console.log(`HTML 長度: ${htmlContent.length} 字元\n`);
    
    // 測試不同長度的內容
    const tests = [
        { name: '前 100 字元', content: htmlContent.substring(0, 100) },
        { name: '前 500 字元', content: htmlContent.substring(0, 500) },
        { name: '前 1000 字元', content: htmlContent.substring(0, 1000) },
        { name: '完整內容', content: htmlContent }
    ];
    
    for (const test of tests) {
        console.log(`\n🧪 測試: ${test.name}`);
        
        const payload = {
            data: {
                site: 'site1',
                category: 'daily',
                slug: `test-real-${test.name.replace(/\s/g, '-')}`,
                title: title,
                html: test.content
            }
        };
        
        try {
            const response = await fetch(`${STRAPI_URL}/api/posts`, {
                method: 'POST',
                headers,
                body: JSON.stringify(payload)
            });
            
            const responseText = await response.text();
            
            if (response.ok) {
                console.log(`✅ 成功！`);
            } else {
                console.log(`❌ 失敗 (${response.status})`);
                try {
                    const error = JSON.parse(responseText);
                    console.log('錯誤:', JSON.stringify(error, null, 2).substring(0, 300));
                } catch (e) {
                    console.log('錯誤:', responseText.substring(0, 300));
                }
                
                // 如果這個長度失敗，就不測試更長的了
                if (test.name !== '前 100 字元') {
                    break;
                }
            }
        } catch (error) {
            console.log(`❌ 錯誤: ${error.message}`);
            break;
        }
        
        // 等待一下避免太快
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

testRealArticle().catch(console.error);



