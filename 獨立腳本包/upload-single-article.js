// 單篇文章上傳腳本
// 只上傳單個文章檔案到 Strapi

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

// 從命令列參數取得文章檔案路徑和網站名稱
const articleFilePath = process.argv[2];
const siteName = process.argv[3];

if (!articleFilePath || !siteName) {
    console.log('使用方法：node upload-single-article.js <文章檔案路徑> <網站名稱>');
    console.log('範例：node upload-single-article.js "C:\\Users\\...\\site6\\articles\\2025-12-07.html" site6');
    process.exit(1);
}

if (!fs.existsSync(articleFilePath)) {
    console.error(`❌ 檔案不存在: ${articleFilePath}`);
    process.exit(1);
}

// =========================================================
// 工具函數（與主腳本相同）
// =========================================================

function readHtmlFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (content.charCodeAt(0) === 0xFEFF) {
            return content.slice(1);
        }
        return content;
    } catch (e) {
        return null;
    }
}

function extractArticleHtml(rawHtml) {
    if (!rawHtml) return null;

    let content = null;

    // 優先提取 <article class="article-content">
    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        content = articleMatch[1].trim();
    } else {
        // 退而求其次：提取任意 <article>
        const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
        if (articleMatch2) {
            content = articleMatch2[1].trim();
        }
    }

    if (!content) return null;

    // 清理內容
    content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
    content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
    content = content.replace(/<img[^>]*>/gi, '');
    content = content.replace(/<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi, '');
    content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    content = content.replace(/\n{3,}/g, '\n\n');
    
    // 限制在 250 字元以內（Strapi Cloud 免費版限制）
    if (content.length > 250) {
        // 嘗試在完整的 </p> 標籤處截斷
        const lastP = content.lastIndexOf('</p>', 250);
        if (lastP > 200) {
            content = content.substring(0, lastP + 4);
        } else {
            // 如果找不到 </p>，嘗試在空格處截斷
            const lastSpace = content.lastIndexOf(' ', 240);
            if (lastSpace > 200) {
                content = content.substring(0, lastSpace);
            } else {
                // 最後手段：直接截斷到 250 字元
                content = content.substring(0, 250);
            }
        }
    }
    
    return content.trim();
}

function extractTitle(rawHtml, fallback) {
    if (!rawHtml) return fallback;
    
    const h1Match = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
        return h1Match[1].replace(/<[^>]+>/g, '').trim();
    }
    
    const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
        let title = titleMatch[1].replace(/<[^>]+>/g, '').trim();
        title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
        return title;
    }
    
    return fallback;
}

function extractImageUrl(rawHtml) {
    if (!rawHtml) return null;
    
    const articleMatch = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        const imgMatch = articleMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
    }
    
    const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    return imgMatch ? imgMatch[1] : null;
}

function extractDateFromSlug(slug) {
    const dateMatch = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    return dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null;
}

function extractExcerpt(rawHtml) {
    if (!rawHtml) return null;
    
    // 提取 <article> 內容
    let articleContent = null;
    const articleMatch = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        articleContent = articleMatch[1];
    }
    
    if (!articleContent) return null;
    
    // 移除標題和元數據
    articleContent = articleContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    articleContent = articleContent.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
    articleContent = articleContent.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
    
    // 提取第一個 <p> 標籤的內容
    const firstPMatch = articleContent.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (firstPMatch) {
        let text = firstPMatch[1];
        // 移除 HTML 標籤
        text = text.replace(/<[^>]+>/g, '');
        // 清理空白
        text = text.trim().replace(/\s+/g, ' ');
        // 限制長度為 150 字元
        if (text.length > 150) {
            text = text.substring(0, 147) + '...';
        }
        return text || null;
    }
    
    // 如果沒有 <p>，嘗試提取純文字
    const textContent = articleContent.replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (textContent.length > 0) {
        if (textContent.length > 150) {
            return textContent.substring(0, 147) + '...';
        }
        return textContent;
    }
    
    return null;
}

async function findExistingPost(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${encodeURIComponent(site)}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`;
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data?.[0] || null;
    } catch (error) {
        return null;
    }
}

async function savePost(existing, payload) {
    const safePayload = {
        ...payload,
        title: String(payload.title || '').trim(),
        html: String(payload.html || '').trim()
    };
    
    if (safePayload.slug) safePayload.slug = String(safePayload.slug).trim();
    if (safePayload.site) safePayload.site = String(safePayload.site).trim();
    if (safePayload.category) safePayload.category = String(safePayload.category).trim();
    if (safePayload.date) safePayload.date = String(safePayload.date).trim();
    if (safePayload.imageUrl) safePayload.imageUrl = String(safePayload.imageUrl).trim();
    
    const jsonBody = JSON.stringify({ data: safePayload });
    const buffer = Buffer.from(jsonBody, 'utf-8');

    const url = existing
        ? `${STRAPI_URL}/api/posts/${existing.documentId || existing.id}`
        : `${STRAPI_URL}/api/posts`;
    const method = existing ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers,
        body: buffer
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${method === 'POST' ? '建立' : '更新'} Post 失敗 (${res.status}): ${errorText}`);
    }

    return await res.json();
}

// =========================================================
// 上傳單篇文章
// =========================================================

async function uploadSingleArticle(articleFilePath, siteName) {
    const raw = readHtmlFile(articleFilePath);
    if (!raw) {
        throw new Error('無法讀取檔案');
    }

    const fileName = path.basename(articleFilePath, '.html');
    const slug = fileName;
    
    const title = extractTitle(raw, slug);
    const htmlContent = extractArticleHtml(raw);
    const imageUrl = extractImageUrl(raw);
    const excerpt = extractExcerpt(raw);
    
    const isDaily = /^\d{4}-\d{2}-\d{2}$/.test(slug);
    const category = isDaily ? 'daily' : 'fixed';
    const dateString = isDaily ? extractDateFromSlug(slug) : null;

    if (!title || !htmlContent) {
        throw new Error('無法提取文章內容');
    }

    const payload = {
        site: siteName,
        category,
        slug,
        title,
        html: htmlContent
    };
    
    if (dateString) {
        payload.publishedAt = `${dateString}T09:00:00.000Z`;
        payload.date = dateString;
        payload.isFeatured = true;
    } else {
        payload.publishedAt = new Date().toISOString();
    }
    
    if (imageUrl) payload.imageUrl = imageUrl;
    if (excerpt) payload.excerpt = excerpt;

    const existing = await findExistingPost(siteName, slug);
    await savePost(existing, payload);
    
    if (existing) {
        console.log(`✅ 更新：${slug}`);
        return { action: 'updated', slug };
    } else {
        console.log(`✅ 建立：${slug}`);
        return { action: 'created', slug };
    }
}

// =========================================================
// 主程序
// =========================================================

async function main() {
    console.log('🚀 開始上傳單篇文章到 Strapi...\n');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
    console.log(`📁 文章檔案: ${articleFilePath}`);
    console.log(`🏷️  網站名稱: ${siteName}\n`);

    try {
        const result = await uploadSingleArticle(articleFilePath, siteName);
        console.log('\n========================================');
        console.log('✅ 完成！');
        console.log('========================================');
        console.log(`動作：${result.action === 'created' ? '建立' : '更新'}`);
        console.log(`文章：${result.slug}`);
        console.log('========================================\n');
    } catch (error) {
        console.error(`\n❌ 錯誤：${error.message}\n`);
        process.exit(1);
    }
}

main().catch(console.error);

