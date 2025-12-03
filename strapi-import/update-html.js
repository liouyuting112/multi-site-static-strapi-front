// =========================================================
// ?�新 Strapi ?��???html 欄�?
// 從本??HTML 檔�??��??�容並更?�到 Strapi
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// ?�置
// =========================================================

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
// ?��? 請在?�裡填入你�? Strapi Full Access API Token
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// =========================================================
// 工具?�數：�??��?�?HTML ?�容
// =========================================================

function extractArticleHtml(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // ?��? 1: ?�試?��? <article class="article-content"> ?��??�容
        const articleMatch = html.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            let content = articleMatch[1].trim();
            // 移除 <h1> 標�?（�??��?�?title 欄�?載入�?
            content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            return content;
        }
        
        // ?��? 2: ?�試?��?任�? <article> 標籤?��??�容
        const articleMatch2 = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch2) {
            // 移除 <h1> 標�?（�??��?�?title 欄�?載入�?
            let content = articleMatch2[1].trim();
            content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            return content;
        }
        
        // ?��? 3: ?��? <body> ?��??�容（�???header, footer, script�?
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            let bodyContent = bodyMatch[1];
            // 移除 script 標籤
            bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            // 移除 header
            bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
            // 移除 footer
            bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
            // 移除 main 標籤，�??�內�?
            bodyContent = bodyContent.replace(/<main[^>]*>/gi, '').replace(/<\/main>/gi, '');
            // 移除 container 標籤，�??�內�?
            bodyContent = bodyContent.replace(/<div[^>]*class="container"[^>]*>/gi, '').replace(/<\/div>/gi, '');
            // 移除 article 標籤，�??�內�?
            bodyContent = bodyContent.replace(/<article[^>]*>/gi, '').replace(/<\/article>/gi, '');
            // 移除 <h1> 標�?
            bodyContent = bodyContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            return bodyContent;
        }
        
        console.warn(`?��? ?��?�?${filePath} ?��??��??�容`);
        return null;
    } catch (error) {
        console.error(`??讀?��?案失??${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 工具?�數：�? Strapi ?��??�?��?�?
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
            console.error(`???��??��??�表失�? (${response.status}):`, await response.text());
            return [];
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        // 調試：顯示�?幾�??��??��?�?
        if (posts.length > 0) {
            console.log('?? ?��?資�?結�?範�?:', {
                id: posts[0].id,
                documentId: posts[0].documentId,
                attributes: Object.keys(posts[0].attributes || posts[0])
            });
        }
        
        return posts;
    } catch (error) {
        console.error('???��??��??�表失�?:', error.message);
        return [];
    }
}

// =========================================================
// 工具?�數：更?�單篇�?章�? html 欄�?
// =========================================================

async function updatePostHtml(postId, htmlContent) {
    try {
        // ?�試使用 documentId（Strapi v4 ?�能使用?�個�?
        let url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        // 檢查 html 字段類�?：�??�是 Rich Text，�?要特殊�???
        // ?�獲?�當?��?章�?檢查 html 字段?��???
        const getResponse = await fetch(url, { headers });
        if (getResponse.ok) {
            const currentPost = await getResponse.json();
            const currentHtml = currentPost.data?.attributes?.html || currentPost.data?.html;
            
            // 如�? html ?��?象�?Rich Text ?��?）�??�要�???
            if (currentHtml && typeof currentHtml === 'object') {
                console.log(`    ?��? 檢測??html 字段??Rich Text 類�?，�?要�??�格式`);
                // Rich Text ?��?：�? HTML 轉�???Strapi Rich Text ?��?
                // 但這�?複�?，�??��??�試?�接?��?HTML 字符�?
                // 如�? Strapi ??Rich Text 編輯?�支?�「�?�?��?�模式�??�該?�以?��? HTML
            }
        }
        
        // ?�送更?��?�?
        const payload = {
            data: {
                html: htmlContent
            }
        };
        
        console.log(`    ?�� ?�送更?��?求到: ${url}`);
        console.log(`    ?? ?�送內容長�? ${htmlContent.length} 字符`);
        console.log(`    ?? ?�送內容�?�? ${htmlContent.substring(0, 100)}...`);
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        console.log(`    ?�� ?��??�?? ${response.status}`);
        
        // 如�? 404，�?試使??id ?��???documentId
        if (response.status === 404) {
            // ?�新?��??��?，使??id
            const allPosts = await getAllPosts();
            const post = allPosts.find(p => (p.documentId || p.id) === postId);
            if (post && post.id && post.id !== postId) {
                url = `${STRAPI_URL}/api/posts/${post.id}`;
                response = await fetch(url, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify(payload)
                });
            }
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`???�新?��?失�? (${response.status}):`, errorText);
            return false;
        }
        
        // 檢查?�新?�否?��??��?
        const result = await response.json();
        console.log(`    ?? ?�新?��?:`, JSON.stringify(result).substring(0, 200) + '...');
        
        const updatedHtml = result.data?.attributes?.html || result.data?.html || result.attributes?.html;
        
        if (updatedHtml) {
            console.log(`  ??確�??�新?��?，html ?�容?�度: ${updatedHtml.length} 字符`);
            return true;
        } else {
            console.warn(`  ?��? ?�新?��?中�???html ?�容`);
            console.warn(`    ?��?結�?:`, Object.keys(result));
            return false;
        }
    } catch (error) {
        console.error('???�新?��?失�?:', error.message);
        return false;
    }
}

// =========================================================
// 主函?��??��??�新?�?��?章�? html 欄�?
// =========================================================

async function updateAllPostsHtml() {
    console.log('?? ?��??�新 Strapi ?��???html 欄�?...\n');
    
    // ?��??�?��?�?
    const posts = await getAllPosts();
    console.log(`?? ?�到 ${posts.length} 篇�?章\n`);
    
    if (posts.length === 0) {
        console.log('?��? 沒�??�到任�??��?');
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    // ?�歷?�?��?�?(site1-site5)
    for (let siteNum = 1; siteNum <= 5; siteNum++) {
        const siteName = `site${siteNum}`;
        const articlesDir = path.join(__dirname, siteName, 'articles');
        
        if (!fs.existsSync(articlesDir)) {
            console.log(`?��? ?��???${siteName}/articles ?��?，跳?�`);
            continue;
        }
        
        console.log(`\n?? ?��? ${siteName}...`);
        
        // 讀?�該站�??��???HTML 檔�?
        const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
        
        for (const file of files) {
            const filePath = path.join(articlesDir, file);
            const slug = path.basename(file, '.html');
            
            // ?�到對�???Strapi ?��?
            const post = posts.find(p => {
                const attrs = p.attributes || p;
                const postSlug = attrs.slug;
                const postSite = attrs.site;
                return postSlug === slug && postSite === siteName;
            });
            
            if (!post) {
                console.log(`  ?��? ?��???Strapi ?��?: ${siteName} - ${slug}`);
                // 調試：顯示�??�該站�??��?�?
                const sitePosts = posts.filter(p => {
                    const attrs = p.attributes || p;
                    return attrs.site === siteName;
                });
                if (sitePosts.length > 0) {
                    console.log(`    該�?點現?��?�?`, sitePosts.map(p => {
                        const attrs = p.attributes || p;
                        return attrs.slug;
                    }).join(', '));
                }
                failCount++;
                continue;
            }
            
            // ?��??��? ID（優?�使??documentId，�??��??��?使用 id�?
            const postId = post.documentId || post.id;
            if (!postId) {
                console.log(`  ?��? ?��??��??��? ID: ${siteName} - ${slug}`, {
                    hasId: !!post.id,
                    hasDocumentId: !!post.documentId,
                    keys: Object.keys(post)
                });
                failCount++;
                continue;
            }
            
            // ?��? HTML ?�容
            const htmlContent = extractArticleHtml(filePath);
            
            if (!htmlContent) {
                console.log(`  ?��? ?��??��? HTML ?�容: ${file}`);
                failCount++;
                continue;
            }
            
            // ?�新 Strapi
            console.log(`  ?? �?��?�新: ${siteName} - ${slug} (ID: ${postId})`);
            console.log(`     HTML ?�容?�度: ${htmlContent.length} 字符`);
            const success = await updatePostHtml(postId, htmlContent);
            
            if (success) {
                console.log(`  ??已更?? ${siteName} - ${slug}`);
                successCount++;
            } else {
                console.log(`  ???�新失�?: ${siteName} - ${slug}`);
                failCount++;
            }
        }
    }
    
    console.log(`\n\n?? ?�新完�?！`);
    console.log(`???��?: ${successCount} 篇`);
    console.log(`??失�?: ${failCount} 篇`);
}

// =========================================================
// ?��?
// =========================================================

if (!STRAPI_TOKEN) {
    console.error('??請設�?STRAPI_TOKEN ?��?變數?�修?�腳?�中??STRAPI_TOKEN');
    console.log('\n使用?��?:');
    console.log('  STRAPI_TOKEN=你�?token node strapi-import/update-html.js');
    console.log('  ??);
    console.log('  ?�腳?�中?�接設�? STRAPI_TOKEN');
    process.exit(1);
}

updateAllPostsHtml().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});



