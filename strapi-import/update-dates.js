// =========================================================
// ?��??�新?��??��?工具
// =========================================================
// ?�途�?
// 1. ?��??�新?�?��?章�??��?
// 2. ?�据 slug 中�??��?（�? 2025-12-01）自?�设置日??
// 3. ?�动?��??��??�新

import fetch from 'node-fetch';
import readline from 'readline';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        // 例�?: "2025-12-01" -> "2025-12-01T00:00:00.000Z"
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
        
        // ?�新 createdAt（Strapi ?�日?��?段�?
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
// 工具?�數：�? slug ?��??��?
// =========================================================

function extractDateFromSlug(slug) {
    // ?��??��?: 2025-12-01
    const match = slug.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
        return match[1];
    }
    return null;
}

// =========================================================
// 主函?��??��??�新?��?
// =========================================================

async function updateDates() {
    console.log('\n?? ?��??�新?��??��?工具\n');
    console.log('?��?�?);
    console.log('1. ?��? slug ?��??��??��?（�?如�?2025-12-01.html -> 2025-12-01�?);
    console.log('2. ?��??��??��??�新?�??daily ?��?');
    console.log('3. ?��??��??��??�新?�?��?�?);
    console.log('4. ?��??�?��?章�??��??��?\n');
    
    return new Promise((resolve) => {
        rl.question('請選?�選??(1-4): ', async (choice) => {
            const posts = await getAllPosts();
            
            if (posts.length === 0) {
                console.log('??沒�??�到?��?');
                rl.close();
                resolve();
                return;
            }
            
            console.log(`\n?? ?�到 ${posts.length} 篇�?章\n`);
            
            if (choice === '1') {
                // ?��? 1: ?��? slug ?��??��??��?
                console.log('?? ?��? slug ?��??��??��?...\n');
                
                let updated = 0;
                let skipped = 0;
                
                for (const post of posts) {
                    const attrs = post.attributes || post;
                    const postId = post.documentId || post.id;
                    const slug = attrs.slug;
                    
                    const dateFromSlug = extractDateFromSlug(slug);
                    
                    if (dateFromSlug) {
                        console.log(`?? ${attrs.title} (${slug}) -> ${dateFromSlug}`);
                        const success = await updatePostDate(postId, dateFromSlug);
                        if (success) {
                            updated++;
                            console.log(`  ??已更?�\n`);
                        } else {
                            console.log(`  ???�新失�?\n`);
                        }
                    } else {
                        console.log(`?��?  跳�? ${attrs.title} (${slug}) - ?��?�?slug ?��??��?\n`);
                        skipped++;
                    }
                }
                
                console.log(`\n??完�?！已?�新 ${updated} 篇�?章�?跳�? ${skipped} 篇\n`);
                
            } else if (choice === '2') {
                // ?��? 2: ?��??��??��??�新?�??daily ?��?
                rl.question('請輸?�日??(?��?: YYYY-MM-DD，�?�? 2025-12-02): ', async (dateInput) => {
                    if (!dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        console.log('???��??��??�誤，�???YYYY-MM-DD');
                        rl.close();
                        resolve();
                        return;
                    }
                    
                    console.log(`\n?? ?�新?�??daily ?��??��???${dateInput}...\n`);
                    
                    const dailyPosts = posts.filter(p => {
                        const attrs = p.attributes || p;
                        return attrs.category === 'daily';
                    });
                    
                    let updated = 0;
                    
                    for (const post of dailyPosts) {
                        const attrs = post.attributes || post;
                        const postId = post.documentId || post.id;
                        
                        console.log(`?? ${attrs.title} (${attrs.site})`);
                        const success = await updatePostDate(postId, dateInput);
                        if (success) {
                            updated++;
                            console.log(`  ??已更?�\n`);
                        } else {
                            console.log(`  ???�新失�?\n`);
                        }
                    }
                    
                    console.log(`\n??完�?！已?�新 ${updated} �?daily ?��?\n`);
                    rl.close();
                    resolve();
                });
                return;
                
            } else if (choice === '3') {
                // ?��? 3: ?��??��??��??�新?�?��?�?
                rl.question('請輸?�日??(?��?: YYYY-MM-DD，�?�? 2025-12-02): ', async (dateInput) => {
                    if (!dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        console.log('???��??��??�誤，�???YYYY-MM-DD');
                        rl.close();
                        resolve();
                        return;
                    }
                    
                    console.log(`\n?? ?�新?�?��?章日?�為 ${dateInput}...\n`);
                    
                    let updated = 0;
                    
                    for (const post of posts) {
                        const attrs = post.attributes || post;
                        const postId = post.documentId || post.id;
                        
                        console.log(`?? ${attrs.title} (${attrs.site})`);
                        const success = await updatePostDate(postId, dateInput);
                        if (success) {
                            updated++;
                            console.log(`  ??已更?�\n`);
                        } else {
                            console.log(`  ???�新失�?\n`);
                        }
                    }
                    
                    console.log(`\n??完�?！已?�新 ${updated} 篇�?章\n`);
                    rl.close();
                    resolve();
                });
                return;
                
            } else if (choice === '4') {
                // ?��? 4: ?��??�?��?章�??��??��?
                console.log('?? ?�?��?章�??��??��?：\n');
                
                for (const post of posts) {
                    const attrs = post.attributes || post;
                    const createdAt = attrs.createdAt || post.createdAt || '?�知';
                    const dateFromSlug = extractDateFromSlug(attrs.slug);
                    
                    console.log(`?? ${attrs.title}`);
                    console.log(`   Slug: ${attrs.slug}`);
                    console.log(`   ?��??��?: ${createdAt}`);
                    if (dateFromSlug) {
                        console.log(`   Slug 中�??��?: ${dateFromSlug}`);
                    }
                    console.log(`   站�?: ${attrs.site}, ?��?: ${attrs.category}\n`);
                }
                
            } else {
                console.log('???��??�選??);
            }
            
            rl.close();
            resolve();
        });
    });
}

// =========================================================
// ?��?
// =========================================================

updateDates().catch(error => {
    console.error('???��??�誤:', error);
    process.exit(1);
});





