// =========================================================
// 快速更?�已编�??��?章到 Strapi
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';
const EDIT_DIR = path.join(__dirname, 'editing');

async function updatePostToStrapi(postId, updates) {
    try {
        const url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const payload = { data: updates };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`???�新失�? (${response.status}):`, errorText);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('???�新失�?:', error.message);
        return false;
    }
}

async function main() {
    if (!fs.existsSync(EDIT_DIR)) {
        console.log('?��?  ?��???editing ?��?');
        return;
    }
    
    const files = fs.readdirSync(EDIT_DIR).filter(f => f.endsWith('.html'));
    
    if (files.length === 0) {
        console.log('?��?  沒�??�到已編輯�?檔�?');
        return;
    }
    
    console.log(`\n?? ?�到 ${files.length} ?�已編輯?��?�?\n`);
    
    for (const htmlFile of files) {
        const baseName = path.basename(htmlFile, '.html');
        const jsonFile = path.join(EDIT_DIR, `${baseName}.json`);
        const htmlPath = path.join(EDIT_DIR, htmlFile);
        
        if (!fs.existsSync(jsonFile)) {
            console.log(`?��?  跳�? ${htmlFile}（找不到對�???.json 檔�?）`);
            continue;
        }
        
        const metadata = JSON.parse(fs.readFileSync(jsonFile, 'utf-8'));
        const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
        
        console.log(`?? �?��?�新: ${metadata.title} (${metadata.site} - ${metadata.slug})...`);
        
        const updates = {
            html: htmlContent
        };
        
        const success = await updatePostToStrapi(metadata.id, updates);
        
        if (success) {
            console.log(`??已更?? ${metadata.title}\n`);
        } else {
            console.log(`???�新失�?: ${metadata.title}\n`);
        }
    }
    
    console.log('???�?��?案�??��??��?');
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});






