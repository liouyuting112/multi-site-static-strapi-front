// =========================================================
// 導入「固定文章」(fixed) 到 Strapi（覆蓋後台內容）
// 用法: node import-fixed-article.js <site> <slug>
// 例如: node import-fixed-article.js site1 retro-vs-modern
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
// 工具函數：從 HTML 檔提取 <article class="article-content"> 內文
// =========================================================

function extractArticleHtml(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');

        // 1) 優先抓 <article class="article-content">
        const articleMatch = html.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            return articleMatch[1].trim();
        }

        // 2) 退而求其次：抓任意 <article> 內容
        const articleMatch2 = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch2) {
            return articleMatch2[1].trim();
        }

        console.warn(`⚠️  無法從 ${filePath} 提取 <article> 內容`);
        return null;
    } catch (error) {
        console.error(`❌ 讀取檔案失敗 ${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 工具函數：提取 <title> 文本作為標題
// =========================================================

function extractTitle(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');

        const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            let title = titleMatch[1].trim();
            // 去掉後面網站名稱「 | xxx」
            title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
            return title;
        }

        // 備援：抓第一個 <h1>
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
// 工具函數：提取第一張圖片 URL
// =========================================================

function extractImageUrl(filePath) {
    try {
        const html = fs.readFileSync(filePath, 'utf-8');

        const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch) {
            const imgMatch = articleMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
            if (imgMatch) return imgMatch[1];
        }

        const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];

        return null;
    } catch (error) {
        console.error(`❌ 讀取檔案失敗 ${filePath}:`, error.message);
        return null;
    }
}

// =========================================================
// 查詢已存在的 Post（固定文章）
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
        return posts[0] || null;
    } catch (error) {
        console.error('❌ 查詢文章失敗:', error.message);
        return null;
    }
}

// =========================================================
// 建立／更新 Post
// =========================================================

async function savePost(idOrDocumentId, payload) {
    const safePayload = {
        ...payload,
        title: String(payload.title || ''),
        html: String(payload.html || '')
    };

    const jsonBody = JSON.stringify({ data: safePayload });
    const buffer = Buffer.from(jsonBody, 'utf-8');

    const url = idOrDocumentId
        ? `${STRAPI_URL}/api/posts/${idOrDocumentId}`
        : `${STRAPI_URL}/api/posts`;

    const method = idOrDocumentId ? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers,
        body: buffer
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`儲存 Post 失敗 (${response.status}): ${text}`);
    }

    return await response.json();
}

// =========================================================
// 主流程：將固定文章匯入 / 覆蓋到 Strapi
// =========================================================

async function importFixedArticle(site, slug) {
    console.log(`\n📝 開始導入固定文章: ${site} - ${slug}\n`);

    const filePath = path.join(__dirname, '..', site, 'articles', `${slug}.html`);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 檔案不存在: ${filePath}`);
        return;
    }
    console.log(`✅ 找到檔案: ${filePath}`);

    const title = extractTitle(filePath);
    const htmlContent = extractArticleHtml(filePath);
    const imageUrl = extractImageUrl(filePath);

    if (!title) {
        console.error('❌ 無法提取標題');
        return;
    }
    if (!htmlContent) {
        console.error('❌ 無法提取文章內容（<article> 內文）');
        return;
    }

    console.log(`📄 標題: ${title}`);
    console.log(`🖼️  圖片: ${imageUrl || '未找到'}`);
    console.log(`📝 HTML 長度: ${htmlContent.length} 字符\n`);

    const existing = await findExistingPost(site, slug);

    const payload = {
        site,
        category: 'fixed',
        slug,
        title,
        html: htmlContent
    };
    if (imageUrl) payload.imageUrl = imageUrl;

    try {
        if (existing) {
            const idOrDoc = existing.documentId || existing.id;
            console.log(`📝 固定文章已存在，更新中... (ID: ${idOrDoc})`);
            await savePost(idOrDoc, payload);
            console.log('✅ 已更新固定文章到 Strapi');
        } else {
            console.log('➕ 固定文章尚未存在，創建中...');
            const result = await savePost(null, payload);
            const createdId = result.data?.documentId || result.data?.id;
            console.log(`✅ 已建立固定文章，ID: ${createdId}`);
        }

        console.log('\n🎉 完成！固定文章內容已與本機 HTML 同步到 Strapi\n');
    } catch (error) {
        console.error('❌ 導入固定文章失敗:', error.message);
    }
}

// =========================================================
// CLI 入口
// =========================================================

const args = process.argv.slice(2);

if (args.length < 2) {
    console.log('用法: node import-fixed-article.js <site> <slug>');
    console.log('例如: node import-fixed-article.js site1 retro-vs-modern');
    process.exit(1);
}

const [site, slug] = args;

if (!/^site[1-5]$/.test(site)) {
    console.error(`❌ 無效的網站名稱: ${site}`);
    console.error('   請使用 site1, site2, site3, site4 或 site5');
    process.exit(1);
}

await importFixedArticle(site, slug);



