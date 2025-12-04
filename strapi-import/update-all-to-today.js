// =========================================================
// 快速批?�更?��??��?章日?�为今天?�日?��?2025年�?
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// =========================================================
// 工具?�數：獲?��??��?�?
// =========================================================

async function getAllPosts() {
    try {
        const url = `${STRAPI_URL}/api/posts?pagination[limit]=1000`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`???��??��?失�? (${response.status}):`, await response.text());
            return [];
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            return data.data;
        }
        
        return [];
    } catch (error) {
        console.error('???��??��?失�?:', error.message);
        return [];
    }
}

// =========================================================
// 工具?�數：更?��?章�??��?
// =========================================================

async function updatePostDate(postId, dateString) {
    try {
        // 將日?��?符串轉�???ISO ?��?
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error(`???��??�日?�格�? ${dateString}`);
            return false;
        }
        
        const isoDate = date.toISOString();
        
        const url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        // ?�新 createdAt ??publishedAt
        const payload = {
            data: {
                createdAt: isoDate,
                publishedAt: isoDate
            }
        };
        
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

// =========================================================
// 主函??
// =========================================================

async function main() {
    console.log('\n?? ?��??�新?�?��?章日?�為今天�?025年�?\n');
    
    // ?��?今天?�日?��?2025年�?
    const today = new Date();
    today.setFullYear(2025); // 設置??025�?
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log(`?? ?��??��?: ${todayString} (${today.toLocaleDateString('zh-TW')})\n`);
    
    // ?��??�?��?�?
    console.log('?? �?��?��??�?��?�?..');
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
        console.log('??沒�??�到?��?');
        return;
    }
    
    console.log(`???�到 ${posts.length} 篇�?章\n`);
    
    // ?��??�新
    let updated = 0;
    let failed = 0;
    
    for (const post of posts) {
        const attrs = post.attributes || post;
        const postId = post.documentId || post.id;
        const title = attrs.title || '?��?�?;
        const site = attrs.site || '?�知';
        
        console.log(`?? ?�新: ${title} (${site})`);
        
        const success = await updatePostDate(postId, todayString);
        
        if (success) {
            updated++;
            console.log(`  ??已更?�\n`);
        } else {
            failed++;
            console.log(`  ???�新失�?\n`);
        }
        
        // 稍微延遲，避?��?求�?�?
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`??完�?！`);
    console.log(`   ?��??�新: ${updated} 篇`);
    if (failed > 0) {
        console.log(`   失�?: ${failed} 篇`);
    }
    console.log('='.repeat(50) + '\n');
}

// =========================================================
// ?��?
// =========================================================

main().catch(error => {
    console.error('???��??�誤:', error);
    process.exit(1);
});






