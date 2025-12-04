// =========================================================
// Strapi ?��?編輯工具
// �?Strapi ?��??��? ???�本?�編�????�新??Strapi
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// ?�置
// =========================================================

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';
const EDIT_DIR = path.join(__dirname, 'editing'); // 編輯檔�?存放?��?

// 確�?編輯?��?存在
if (!fs.existsSync(EDIT_DIR)) {
    fs.mkdirSync(EDIT_DIR, { recursive: true });
}

// =========================================================
// 工具?�數：�? Strapi ?��??��?
// =========================================================

async function getPostFromStrapi(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`???��??��?失�? (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('???��??��?失�?:', error.message);
        return null;
    }
}

// =========================================================
// 工具?�數：更?��?章到 Strapi
// =========================================================

async function updatePostToStrapi(postId, updates) {
    try {
        const url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const payload = {
            data: updates
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`???�新?��?失�? (${response.status}):`, errorText);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('???�新?��?失�?:', error.message);
        return false;
    }
}

// =========================================================
// 工具?�數：獲?��??��?章�?�?
// =========================================================

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

// =========================================================
// 主函?��?編輯?��??��?
// =========================================================

async function editArticle(site, slug) {
    console.log(`\n?? �?��?��??��?: ${site} - ${slug}...\n`);
    
    // �?Strapi ?��??��?
    const post = await getPostFromStrapi(site, slug);
    
    if (!post) {
        console.error(`???��??��?�? ${site} - ${slug}`);
        return;
    }
    
    const attrs = post.attributes || post;
    const postId = post.documentId || post.id;
    
    console.log(`???�到?��?:`);
    console.log(`   標�?: ${attrs.title}`);
    console.log(`   Slug: ${attrs.slug}`);
    console.log(`   站�?: ${attrs.site}`);
    console.log(`   ?��?: ${attrs.category}`);
    console.log(`   HTML ?�度: ${(attrs.html || '').length} 字符\n`);
    
    // ?�建編輯檔�?
    const editFile = path.join(EDIT_DIR, `${site}-${slug}.html`);
    const editMetaFile = path.join(EDIT_DIR, `${site}-${slug}.json`);
    
    // 保�??��??�容?��?�?
    fs.writeFileSync(editFile, attrs.html || '', 'utf-8');
    
    // 保�??�數??
    const metadata = {
        id: postId,
        title: attrs.title,
        slug: attrs.slug,
        site: attrs.site,
        category: attrs.category,
        html: attrs.html
    };
    fs.writeFileSync(editMetaFile, JSON.stringify(metadata, null, 2), 'utf-8');
    
    console.log(`?? ?��??�容已�?存到:`);
    console.log(`   ${editFile}`);
    console.log(`\n?�� 請用你�?歡�?編輯?��??�這個�?案進�?編輯`);
    console.log(`?�� 編輯完�?後�???Enter 繼�??�新??Strapi...\n`);
    
    // 等�??�戶編輯
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('??Enter 繼�??�新??Strapi（�?輸入 "skip" 跳�?�? ', async (answer) => {
            rl.close();
            
            if (answer.toLowerCase() === 'skip') {
                console.log('?��?  已跳?�更??);
                resolve(false);
                return;
            }
            
            // 讀?�編輯�??�內�?
            if (!fs.existsSync(editFile)) {
                console.error('??編輯檔�?不�???);
                resolve(false);
                return;
            }
            
            const editedHtml = fs.readFileSync(editFile, 'utf-8');
            const editedMeta = JSON.parse(fs.readFileSync(editMetaFile, 'utf-8'));
            
            // 準�??�新?�容
            const updates = {
                html: editedHtml
            };
            
            // 如�??�數?��?修改，�?一起更??
            if (editedMeta.title !== attrs.title) {
                updates.title = editedMeta.title;
            }
            if (editedMeta.slug !== attrs.slug) {
                updates.slug = editedMeta.slug;
            }
            if (editedMeta.category !== attrs.category) {
                updates.category = editedMeta.category;
            }
            
            console.log(`\n?? �?��?�新??Strapi...`);
            
            const success = await updatePostToStrapi(postId, updates);
            
            if (success) {
                console.log(`???��?已�??�更?�到 Strapi！\n`);
                resolve(true);
            } else {
                console.log(`???�新失�?\n`);
                resolve(false);
            }
        });
    });
}

// =========================================================
// 主函?��??�出?�?��?�?
// =========================================================

async function listArticles() {
    console.log('\n?? �?��?��??�?��?�?..\n');
    
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
        console.log('?��?  沒�??�到任�??��?');
        return;
    }
    
    console.log(`?�到 ${posts.length} 篇�?�?\n`);
    
    // ?��?點�?�?
    const bySite = {};
    posts.forEach(post => {
        const attrs = post.attributes || post;
        const site = attrs.site || 'unknown';
        if (!bySite[site]) {
            bySite[site] = [];
        }
        bySite[site].push({
            id: post.documentId || post.id,
            title: attrs.title,
            slug: attrs.slug,
            category: attrs.category
        });
    });
    
    // 顯示?�表
    Object.keys(bySite).sort().forEach(site => {
        console.log(`\n?? ${site} (${bySite[site].length} �?:`);
        bySite[site].forEach((article, index) => {
            console.log(`   ${index + 1}. ${article.title} (${article.slug}) [${article.category}]`);
        });
    });
    
    console.log('\n');
}

// =========================================================
// ?�令行�???
// =========================================================

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.log(`
?? Strapi ?��?編輯工具

使用?��?:
  node edit-article.js list                    # ?�出?�?��?�?
  node edit-article.js edit <site> <slug>      # 編輯?��??��?
  node edit-article.js edit-all                 # ?��?編輯?�?��?�?

範�?:
  node edit-article.js list
  node edit-article.js edit site1 2025-12-01
  node edit-article.js edit-all
        `);
        return;
    }
    
    const command = args[0];
    
    if (command === 'list') {
        await listArticles();
    } else if (command === 'edit') {
        if (args.length < 3) {
            console.error('??請�?�?site ??slug');
            console.log('範�?: node edit-article.js edit site1 2025-12-01');
            return;
        }
        await editArticle(args[1], args[2]);
    } else if (command === 'edit-all') {
        console.log('?? ?��?編輯模�?\n');
        const posts = await getAllPosts();
        
        for (const post of posts) {
            const attrs = post.attributes || post;
            await editArticle(attrs.site, attrs.slug);
        }
        
        console.log('\n???�?��?章�??��??��?');
    } else {
        console.error(`???�知?�令: ${command}`);
    }
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});






