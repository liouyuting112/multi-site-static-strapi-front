// =========================================================
// ?��??�新每日?��???slug：�??��?�?2025 ?�为 2025
// 每个网�???篇�??��?章�??�设置为�?
// 2025-12-01, 2025-11-30, 2025-11-29
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// ?��??��?（�??�?�到?�?��?
const TARGET_DATES = [
    '2025-12-01',  // ?�??
    '2025-11-30',  // 第�???
    '2025-11-29'   // 第�???
];

// =========================================================
// 工具?�數：獲?��??��??��?�?
// =========================================================

async function getAllDailyPosts() {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[category][$eq]=daily&pagination[limit]=1000&sort=publishedAt:desc`;
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
// 工具?�數：更?��?章�? slug ??publishedAt
// =========================================================

async function updatePostSlugAndDate(postId, newSlug, dateString) {
    try {
        // 設置?��???UTC ?��???00:00:00
        const date = new Date(dateString + 'T00:00:00.000Z');
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
        
        const payload = {
            data: {
                slug: newSlug,
                publishedAt: isoDate
            }
        };
        
        console.log(`     ?? ?�送更?��?求到: ${url}`);
        console.log(`     ?�� ?�新?�容:`, JSON.stringify(payload, null, 2));
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`     ?�� ?��??�?? ${response.status}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`     ???�新失�? (${response.status}):`, errorText);
            return false;
        }
        
        // 驗�??�新?�否?��?
        const result = await response.json();
        const updatedSlug = result.data?.attributes?.slug || result.data?.slug;
        const updatedDate = result.data?.attributes?.publishedAt || result.data?.publishedAt;
        console.log(`     ???�新?��?`);
        console.log(`        ??slug: ${updatedSlug}`);
        console.log(`        ?�日?? ${updatedDate}`);
        
        return true;
    } catch (error) {
        console.error(`     ???�新失�?:`, error.message);
        return false;
    }
}

// =========================================================
// 工具?�數：更??slug 中�??��?
// =========================================================

function updateSlugDate(oldSlug, newDate) {
    // �?slug 中�??��?�?023-12-01）替?�為?�日?��?2025-12-01�?
    // 例�?: "2025-12-01.html" -> "2025-12-01.html"
    // ?��? "2025-12-01" -> "2025-12-01"
    
    // ?��??��??��??��?�?023-12-01 ??2025-12-01.html�?
    const datePattern = /\d{4}-\d{2}-\d{2}/;
    
    if (datePattern.test(oldSlug)) {
        return oldSlug.replace(datePattern, newDate);
    }
    
    // 如�?沒�??�到?��?，直?��??�新?��?
    return newDate;
}

// =========================================================
// 主函??
// =========================================================

async function main() {
    console.log('\n?? ?��??�新每日?��???slug ?�日?�\n');
    console.log('?��??��?�?);
    console.log(`  ?�?? ${TARGET_DATES[0]}`);
    console.log(`  第�?: ${TARGET_DATES[1]}`);
    console.log(`  第�?: ${TARGET_DATES[2]}\n`);
    
    // ?��??�?��??��?�?
    console.log('?? �?��?��??�?��??��?�?..');
    const posts = await getAllDailyPosts();
    
    if (posts.length === 0) {
        console.log('??沒�??�到每日?��?');
        return;
    }
    
    console.log(`???�到 ${posts.length} 篇�??��?章\n`);
    
    // ?�網站�?�?
    const postsBySite = {};
    
    for (const post of posts) {
        const attrs = post.attributes || post;
        const site = attrs.site || 'unknown';
        
        if (!postsBySite[site]) {
            postsBySite[site] = [];
        }
        
        postsBySite[site].push(post);
    }
    
    console.log(`?? ?�網站�?組�?\n`);
    for (const site in postsBySite) {
        console.log(`  ${site}: ${postsBySite[site].length} 篇`);
    }
    console.log('');
    
    // ?�新每個網站�?每日?��?
    let totalUpdated = 0;
    let totalFailed = 0;
    
    for (const site in postsBySite) {
        const sitePosts = postsBySite[site];
        
        console.log(`\n${'='.repeat(50)}`);
        console.log(`?? ?��? ${site} (??${sitePosts.length} �?`);
        console.log('='.repeat(50));
        
        // ?��???篇�?如�?超�?3篇�?
        const postsToUpdate = sitePosts.slice(0, 3);
        
        if (postsToUpdate.length > TARGET_DATES.length) {
            console.warn(`?��?  ${site} ?��???${TARGET_DATES.length} 篇�??��?章�??�更?��? ${TARGET_DATES.length} 篇`);
        }
        
        for (let i = 0; i < postsToUpdate.length && i < TARGET_DATES.length; i++) {
            const post = postsToUpdate[i];
            const attrs = post.attributes || post;
            const postId = post.documentId || post.id;
            const title = attrs.title || '?��?�?;
            const oldSlug = attrs.slug || '';
            const targetDate = TARGET_DATES[i];
            
            // ?�新 slug 中�??��?
            const newSlug = updateSlugDate(oldSlug, targetDate);
            
            console.log(`\n  ?? ${i + 1}. ${title}`);
            console.log(`     ??slug: ${oldSlug}`);
            console.log(`     ??slug: ${newSlug}`);
            console.log(`     ?��??��?: ${targetDate}`);
            console.log(`     Post ID: ${postId}`);
            
            const success = await updatePostSlugAndDate(postId, newSlug, targetDate);
            
            if (success) {
                totalUpdated++;
            } else {
                totalFailed++;
            }
            
            // 稍微延遲，避?��?求�?�?
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        if (postsToUpdate.length < TARGET_DATES.length) {
            console.warn(`\n  ?��?  ${site} ?��? ${postsToUpdate.length} 篇�??��?章�?少於?��???${TARGET_DATES.length} 篇`);
        }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`??完�?！`);
    console.log(`   ?��??�新: ${totalUpdated} 篇`);
    if (totalFailed > 0) {
        console.log(`   失�?: ${totalFailed} 篇`);
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






