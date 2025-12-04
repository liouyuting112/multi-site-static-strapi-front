// =========================================================
// ?��??�?��?章工?��??��??��?
// ?�示?�?��?章�?详�?信息，支?��??��??�索
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

async function getAllPosts() {
    try {
        const url = `${STRAPI_URL}/api/posts?pagination[limit]=1000&sort=createdAt:desc`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`???��??��??�表失�? (${response.status}):`, await response.text());
            return [];
        }
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('???��??��??�表失�?:', error.message);
        return [];
    }
}

function getPostAttributes(post) {
    if (post.attributes) {
        return post.attributes;
    }
    const { id, documentId, ...attrs } = post;
    return attrs;
}

function displayAllPosts(posts, filterSite = null) {
    console.log('\n' + '='.repeat(80));
    console.log('?? ?�?��?章�?�?);
    console.log('='.repeat(80) + '\n');
    
    if (posts.length === 0) {
        console.log('?��?  沒�??�到任�??��?\n');
        return;
    }
    
    // ?��?點�?�?
    const bySite = {};
    posts.forEach(post => {
        const attrs = getPostAttributes(post);
        const site = attrs.site || 'unknown';
        if (!bySite[site]) {
            bySite[site] = [];
        }
        bySite[site].push({
            id: post.documentId || post.id,
            title: attrs.title,
            slug: attrs.slug,
            category: attrs.category,
            excerpt: attrs.excerpt || '(?��?�?',
            htmlLength: (attrs.html || '').length
        });
    });
    
    // 顯示統�?
    console.log(`?? 總�?: ${posts.length} 篇�?章\n`);
    
    // ?��?點顯�?
    Object.keys(bySite).sort().forEach(site => {
        if (filterSite && site !== filterSite) {
            return;
        }
        
        const sitePosts = bySite[site];
        const dailyCount = sitePosts.filter(p => p.category === 'daily').length;
        const fixedCount = sitePosts.filter(p => p.category === 'fixed').length;
        
        console.log('?�'.repeat(80));
        console.log(`?? ${site.toUpperCase()} (??${sitePosts.length} �?`);
        console.log(`   ?? 每日?��?: ${dailyCount} �? |  ?? ?��??��?: ${fixedCount} 篇`);
        console.log('?�'.repeat(80));
        
        // ?��?類�?組顯�?
        const daily = sitePosts.filter(p => p.category === 'daily').sort((a, b) => b.slug.localeCompare(a.slug));
        const fixed = sitePosts.filter(p => p.category === 'fixed');
        
        if (fixed.length > 0) {
            console.log(`\n?? ?��??��? (${fixed.length} �?:`);
            fixed.forEach((article, index) => {
                const excerptPreview = article.excerpt.length > 60 
                    ? article.excerpt.substring(0, 60) + '...' 
                    : article.excerpt;
                console.log(`   ${index + 1}. ${article.title}`);
                console.log(`      Slug: ${article.slug}`);
                console.log(`      ?�述: ${excerptPreview}`);
                console.log(`      HTML: ${article.htmlLength} 字符`);
                console.log(`      編輯: node edit-article.js edit ${site} ${article.slug}`);
                console.log('');
            });
        }
        
        if (daily.length > 0) {
            console.log(`\n?? 每日?��? (${daily.length} �?:`);
            daily.forEach((article, index) => {
                const excerptPreview = article.excerpt.length > 60 
                    ? article.excerpt.substring(0, 60) + '...' 
                    : article.excerpt;
                console.log(`   ${index + 1}. ${article.title}`);
                console.log(`      Slug: ${article.slug}`);
                console.log(`      ?�述: ${excerptPreview}`);
                console.log(`      HTML: ${article.htmlLength} 字符`);
                console.log(`      編輯: node edit-article.js edit ${site} ${article.slug}`);
                console.log('');
            });
        }
        
        console.log('');
    });
    
    console.log('='.repeat(80));
    console.log('\n?�� 快速編輯命�?');
    console.log('   node edit-article.js edit <site> <slug>     # 完整編輯');
    console.log('   node edit-parts.js edit <site> <slug>       # ?�部?�編�?);
    console.log('   node edit-excerpt.js edit <site> <slug>    # 編輯?�述\n');
}

async function main() {
    const args = process.argv.slice(2);
    const filterSite = args[0] || null; // ?�選?��?點篩??
    
    console.log('?? �?��?��??�?��?�?..\n');
    
    const posts = await getAllPosts();
    
    displayAllPosts(posts, filterSite);
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});






