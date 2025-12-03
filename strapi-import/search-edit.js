// =========================================================
// ?�能?�索并�?辑�?章工??
// ?�以?��??��??��?容�?段、�?述�??�索?��?
// =========================================================

import fetch from 'node-fetch';
import readline from 'readline';

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

// �?HTML 中�??��??��?
function extractTextFromHtml(html) {
    if (!html) return '';
    // 移除 HTML 標籤
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ?�索?��?
function searchPosts(posts, query) {
    const lowerQuery = query.toLowerCase();
    const results = [];
    
    posts.forEach(post => {
        const attrs = getPostAttributes(post);
        const postId = post.documentId || post.id;
        
        // ?�索標�?
        const titleMatch = attrs.title && attrs.title.toLowerCase().includes(lowerQuery);
        
        // ?�索 slug
        const slugMatch = attrs.slug && attrs.slug.toLowerCase().includes(lowerQuery);
        
        // ?�索?�述
        const excerptMatch = attrs.excerpt && attrs.excerpt.toLowerCase().includes(lowerQuery);
        
        // ?�索 HTML ?�容（�??��??��?�?
        const htmlText = extractTextFromHtml(attrs.html);
        const contentMatch = htmlText.toLowerCase().includes(lowerQuery);
        
        if (titleMatch || slugMatch || excerptMatch || contentMatch) {
            // 計�??��??�數（�?題匹?��??��?高�?
            let score = 0;
            if (titleMatch) score += 10;
            if (slugMatch) score += 5;
            if (excerptMatch) score += 3;
            if (contentMatch) score += 1;
            
            // ?�到?��??�內容�?�?
            let matchSnippet = '';
            if (contentMatch) {
                const index = htmlText.toLowerCase().indexOf(lowerQuery);
                const start = Math.max(0, index - 30);
                const end = Math.min(htmlText.length, index + query.length + 30);
                matchSnippet = htmlText.substring(start, end);
                if (start > 0) matchSnippet = '...' + matchSnippet;
                if (end < htmlText.length) matchSnippet = matchSnippet + '...';
            }
            
            results.push({
                post,
                postId,
                attrs,
                score,
                matchType: titleMatch ? '標�?' : slugMatch ? 'Slug' : excerptMatch ? '?�述' : '?�容',
                matchSnippet
            });
        }
    });
    
    // ?��??��?�?
    results.sort((a, b) => b.score - a.score);
    
    return results;
}

// 顯示?�索結�?
function displayResults(results, query) {
    console.log('\n' + '='.repeat(80));
    console.log(`?? ?�索結�?: "${query}"`);
    console.log('='.repeat(80) + '\n');
    
    if (results.length === 0) {
        console.log('??沒�??�到?��??��?章\n');
        return;
    }
    
    console.log(`?�到 ${results.length} 篇匹?��??��?:\n`);
    
    results.forEach((result, index) => {
        const { attrs, matchType, matchSnippet } = result;
        console.log(`${index + 1}. ${attrs.title}`);
        console.log(`   站�?: ${attrs.site} | ?��?: ${attrs.category} | Slug: ${attrs.slug}`);
        console.log(`   ?��?: ${matchType}`);
        if (matchSnippet) {
            console.log(`   ?�容?�段: ${matchSnippet}`);
        }
        if (attrs.excerpt) {
            const excerptPreview = attrs.excerpt.length > 60 
                ? attrs.excerpt.substring(0, 60) + '...' 
                : attrs.excerpt;
            console.log(`   ?�述: ${excerptPreview}`);
        }
        console.log('');
    });
}

// 編輯?��?（調?�現?��?編輯工具�?
async function editArticle(site, slug) {
    const { spawn } = await import('child_process');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const editScript = path.join(__dirname, 'edit-article.js');
    
    return new Promise((resolve) => {
        console.log(`\n?? �?��?��?編輯工具...\n`);
        
        const child = spawn('node', [editScript, 'edit', site, slug], {
            stdio: 'inherit',
            shell: true,
            cwd: __dirname
        });
        
        child.on('close', (code) => {
            resolve(code === 0);
        });
        
        child.on('error', (error) => {
            console.error('???��?編輯工具失�?:', error.message);
            console.log(`\n?�� 請�??�執�? node edit-article.js edit ${site} ${slug}\n`);
            resolve(false);
        });
    });
}

// 主函??
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
?? ?�能?�索并�?辑�?章工??

使用?��?:
  node search-edit.js <?�索?�鍵�?

範�?:
  node search-edit.js "??��下�?，�?外�??��?"
  node search-edit.js "?�利�?
  node search-edit.js "retro-vs-modern"
  node search-edit.js "2025-12-01"

?�能:
  - ?�以?�索?��?標�?
  - ?�以?�索?��??�容（任何�?字�?段�?
  - ?�以?�索?�述
  - ?�以?�索 slug
  - ?�索?��??�以?��?要編輯�??��?
        `);
        return;
    }
    
    const query = args.join(' ');
    
    console.log('?? �?��?�索?��?...\n');
    
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
        console.log('?��?  沒�??�到任�??��?');
        return;
    }
    
    const results = searchPosts(posts, query);
    
    displayResults(results, query);
    
    if (results.length === 0) {
        return;
    }
    
    // 如�??��?一篇�?章�??�接編輯
    if (results.length === 1) {
        const result = results[0];
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        rl.question(`?�否要編輯這�??��?�?Y/n): `, async (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'n' || answer.toLowerCase() === 'no') {
                console.log('已�?�?);
                return;
            }
            
            await editArticle(result.attrs.site, result.attrs.slug);
        });
        return;
    }
    
    // 多�??��?，�??�戶?��?
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question(`請輸?��?編輯?��?章編??(1-${results.length})，�???Enter ?��?: `, async (answer) => {
        rl.close();
        
        const index = parseInt(answer) - 1;
        
        if (isNaN(index) || index < 0 || index >= results.length) {
            console.log('已�?�?);
            return;
        }
        
        const result = results[index];
        await editArticle(result.attrs.site, result.attrs.slug);
    });
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});



