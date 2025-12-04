// =========================================================
// 導入新文章到 Strapi
// 用法: node import-new-article.js <site> <slug>
// 例如: node import-new-article.js site1 2025-12-03
// =========================================================

// 修復 SSL/TLS 問題（必須在最前面）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import './ssl-fix.js';

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// 配置
// =========================================================

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const headers = {
    'Content-Type': 'application/json'
};

if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

// =========================================================
// 工具函數：提取文章 HTML 內容
// =========================================================

function extractArticleHtml(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // 嘗試 1: 提取 <article class="article-content"> 內的內容
        const articleMatch = html.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            let content = articleMatch[1].trim();
            // 移除 <h1> 標題（因為會從 title 欄位載入）
            content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            // 移除日期/發布資訊
            content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
            content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
            return content;
        }
        
        // 嘗試 2: 提取任何 <article> 標籤內的內容
        const articleMatch2 = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch2) {
            let content = articleMatch2[1].trim();
            content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
            content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
            return content;
        }
        
        // 嘗試 3: 提取 <main> 內的內容（排除 header, footer, script）
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            let bodyContent = bodyMatch[1];
            // 移除 script 標籤
            bodyContent = bodyContent.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
            // 移除 header
            bodyContent = bodyContent.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
            // 移除 footer
            bodyContent = bodyContent.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
            // 移除 main 標籤，保留內容
            bodyContent = bodyContent.replace(/<main[^>]*>/gi, '').replace(/<\/main>/gi, '');
            // 移除 container 標籤，保留內容
            bodyContent = bodyContent.replace(/<div[^>]*class="container"[^>]*>/gi, '').replace(/<\/div>/gi, '');
            // 移除 article 標籤，保留內容
            bodyContent = bodyContent.replace(/<article[^>]*>/gi, '').replace(/<\/article>/gi, '');
            // 移除 <h1> 標題
            bodyContent = bodyContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
            bodyContent = bodyContent.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
            bodyContent = bodyContent.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
            return bodyContent;
        }
        
        console.warn(`⚠️  無法從 ${filePath} 提取文章內容`);
        return null;
    } catch (error) {
        console.error(`❌ 讀取檔案失敗 ${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 工具函數：提取標題
// =========================================================

function extractTitle(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // 嘗試從 <title> 提取
        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            let title = titleMatch[1].trim();
            // 移除網站名稱（例如 " | 像素時光"）
            title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
            return title;
        }
        
        // 嘗試從 <h1> 提取
        const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        if (h1Match) {
            return h1Match[1].trim();
        }
        
        return null;
    } catch (error) {
        console.error(`❌ 讀取檔案失敗 ${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 工具函數：提取圖片 URL
// =========================================================

function extractImageUrl(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');
        
        // 嘗試從 <article> 內的第一個 <img> 提取
        const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            const imgMatch = articleMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) {
                return imgMatch[1];
            }
        }
        
        // 嘗試從整個 HTML 的第一個 <img> 提取
        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) {
            return imgMatch[1];
        }
        
        return null;
    } catch (error) {
        console.error(`❌ 讀取檔案失敗 ${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 工具函數：從 slug 提取日期
// =========================================================

function extractDateFromSlug(slug) {
    // 嘗試匹配 YYYY-MM-DD 格式
    const dateMatch = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
        const year = dateMatch[1];
        const month = dateMatch[2];
        const day = dateMatch[3];
        return `${year}-${month}-${day}`;
    }
    return null;
}

// =========================================================
// 工具函數：檢查文章是否存在
// =========================================================

async function findExistingPost(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ 查詢文章失敗 (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        if (posts.length > 0) {
            return posts[0];
        }
        
        return null;
    } catch (error) {
        console.error('❌ 查詢文章失敗:', error.message);
        return null;
    }
}

// =========================================================
// 工具函數：創建新文章
// =========================================================

async function createPost(payload) {
    try {
        const url = `${STRAPI_URL}/api/posts`;
        const safePayload = {
            ...payload,
            title: String(payload.title || ''),
            html: String(payload.html || '')
        };
        
        const jsonBody = JSON.stringify({ data: safePayload });
        const buffer = Buffer.from(jsonBody, 'utf-8');
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: buffer
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`建立 Post 失敗 (${response.status}): ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('❌ 創建文章失敗:', error.message);
        throw error;
    }
}

// =========================================================
// 工具函數：更新文章
// =========================================================

async function updatePost(idOrDocumentId, payload) {
    try {
        const url = `${STRAPI_URL}/api/posts/${idOrDocumentId}`;
        const safePayload = {
            ...payload,
            title: String(payload.title || ''),
            html: String(payload.html || '')
        };
        
        const jsonBody = JSON.stringify({ data: safePayload });
        const buffer = Buffer.from(jsonBody, 'utf-8');
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: buffer
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`更新 Post 失敗 (${response.status}): ${errorText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('❌ 更新文章失敗:', error.message);
        throw error;
    }
}

// =========================================================
// 主函數：導入新文章
// =========================================================

async function importNewArticle(site, slug) {
    console.log(`\n📝 開始導入文章: ${site} - ${slug}\n`);
    
    // 檢查檔案是否存在
    const filePath = path.join(__dirname, '..', site, 'articles', `${slug}.html`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 檔案不存在: ${filePath}`);
        console.error(`   請確認檔案路徑是否正確`);
        return;
    }
    
    console.log(`✅ 找到檔案: ${filePath}`);
    
    // 提取內容
    const title = extractTitle(filePath);
    const htmlContent = extractArticleHtml(filePath);
    const imageUrl = extractImageUrl(filePath);
    const dateString = extractDateFromSlug(slug);
    
    if (!title) {
        console.error(`❌ 無法提取標題`);
        return;
    }
    
    if (!htmlContent) {
        console.error(`❌ 無法提取文章內容`);
        return;
    }
    
    console.log(`📄 標題: ${title}`);
    console.log(`📅 日期: ${dateString || '未指定'}`);
    console.log(`🖼️  圖片: ${imageUrl || '未找到'}`);
    console.log(`📝 HTML 長度: ${htmlContent.length} 字符\n`);
    
    // 檢查文章是否已存在
    const existing = await findExistingPost(site, slug);
    
    // 準備 payload（預設 isFeatured 先設為 true，後面再用規則調整）
    const payload = {
        site,
        category: 'daily', // 每日精選文章
        slug,
        title,
        html: htmlContent,
        publishedAt: dateString ? `${dateString}T09:00:00.000Z` : new Date().toISOString(),
        date: dateString || null, // 自定義日期欄位
        isFeatured: true
    };
    
    // 如果有圖片，添加到 imageUrl 欄位
    if (imageUrl) {
        payload.imageUrl = imageUrl;
    }
    
    try {
        if (existing) {
            console.log(`📝 文章已存在，更新中...`);
            const idOrDoc = existing.documentId || existing.id;
            const result = await updatePost(idOrDoc, payload);
            console.log(`✅ 已更新文章: ${site} - ${slug}`);
            console.log(`   ID: ${idOrDoc}`);
        } else {
            console.log(`➕ 創建新文章...`);
            const result = await createPost(payload);
            const createdId = result.data?.documentId || result.data?.id;
            console.log(`✅ 已創建文章: ${site} - ${slug}`);
            console.log(`   ID: ${createdId}`);
        }
        
        console.log(`\n🎉 完成！文章已導入到 Strapi`);
        console.log(`   現在可以在首頁看到這篇文章了（如果日期在 7 天內）\n`);
        
    } catch (error) {
        console.error(`❌ 導入失敗:`, error.message);
    }
}

// =========================================================
// 主程序
// =========================================================

const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('用法: node import-new-article.js <site> <slug>');
    console.log('例如: node import-new-article.js site1 2025-12-03');
    console.log('\n說明:');
    console.log('  <site>  - 網站名稱 (site1, site2, site3, site4, site5)');
    console.log('  <slug>  - 文章 slug (例如: 2025-12-03)');
    process.exit(1);
}

const [site, slug] = args;

if (!site.match(/^site[1-5]$/)) {
    console.error(`❌ 無效的網站名稱: ${site}`);
    console.error(`   請使用 site1, site2, site3, site4, 或 site5`);
    process.exit(1);
}

importNewArticle(site, slug).catch((err) => {
    console.error('❌ 執行失敗：', err);
    process.exit(1);
});

