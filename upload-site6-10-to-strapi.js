// 自動化上傳 site6-10 到 Strapi
// 自動提取 HTML 內容並轉換成 Strapi 格式

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

// 從命令列參數取得要處理的網站
const sitesToProcess = process.argv.slice(2);
if (sitesToProcess.length === 0) {
    console.log('使用方法：node upload-site6-10-to-strapi.js site6 [site7 site8 ...]');
    console.log('範例：node upload-site6-10-to-strapi.js site6 site7');
    process.exit(1);
}

// =========================================================
// 工具函數：讀取 HTML 檔案
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

// =========================================================
// 工具函數：提取頁面 HTML 內容
// =========================================================

function extractPageHtml(rawHtml) {
    if (!rawHtml) return null;
    
    // 優先抓 <main> 標籤
    const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
        return mainMatch[1].trim();
    }
    
    // 退而求其次：抓 <body> 內容（排除 header, footer, script）
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        let content = bodyMatch[1];
        // 移除 script 標籤
        content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
        // 移除 header
        content = content.replace(/<header[\s\S]*?<\/header>/gi, '');
        // 移除 footer
        content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');
        return content.trim();
    }
    
    return null;
}

// =========================================================
// 工具函數：提取文章 HTML 內容
// =========================================================

function extractArticleHtml(rawHtml) {
    if (!rawHtml) return null;

    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        
        // 移除圖片標籤（因為有 imageUrl 欄位）
        content = content.replace(/<img[^>]*>/gi, '');
        content = content.replace(/<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi, '');
        
        // 清理換行符
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        content = content.replace(/\n{3,}/g, '\n\n');
        
        // 限制長度為 250 字元
        if (content.length > 250) {
            const lastP = content.lastIndexOf('</p>', 250);
            if (lastP > 200) {
                content = content.substring(0, lastP + 4);
            } else {
                content = content.substring(0, 250);
            }
        }
        
        return content.trim();
    }

    const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch2) {
        let content = articleMatch2[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/<img[^>]*>/gi, '');
        content = content.replace(/<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi, '');
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        
        if (content.length > 250) {
            const lastP = content.lastIndexOf('</p>', 250);
            if (lastP > 200) {
                content = content.substring(0, lastP + 4);
            } else {
                content = content.substring(0, 250);
            }
        }
        
        return content.trim();
    }

    return null;
}

// =========================================================
// 工具函數：提取標題
// =========================================================

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

// =========================================================
// 工具函數：提取圖片 URL
// =========================================================

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

// =========================================================
// 工具函數：從 slug 提取日期
// =========================================================

function extractDateFromSlug(slug) {
    const dateMatch = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    return dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : null;
}

// =========================================================
// 工具函數：查找現有 Post
// =========================================================

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

// =========================================================
// 工具函數：查找現有 Page
// =========================================================

async function findExistingPage(site, type) {
    try {
        const url = `${STRAPI_URL}/api/pages?filters[site][$eq]=${encodeURIComponent(site)}&filters[type][$eq]=${encodeURIComponent(type)}&pagination[limit]=1`;
        const res = await fetch(url, { headers });
        if (!res.ok) return null;
        const data = await res.json();
        return data.data?.[0] || null;
    } catch (error) {
        return null;
    }
}

// =========================================================
// 工具函數：儲存 Post
// =========================================================

async function savePost(existing, payload) {
    const safePayload = {
        ...payload,
        title: String(payload.title || '').trim(),
        html: String(payload.html || '').trim()
    };
    
    if (safePayload.slug) safePayload.slug = String(safePayload.slug).trim();
    if (safePayload.site) safePayload.site = String(safePayload.site).trim();
    if (safePayload.category) safePayload.category = String(safePayload.category).trim();
    if (safePayload.excerpt) safePayload.excerpt = String(safePayload.excerpt).trim();
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
// 工具函數：儲存 Page
// =========================================================

async function savePage(existing, payload) {
    const safePayload = {
        ...payload,
        title: String(payload.title || '').trim(),
        html: String(payload.html || '').trim()
    };
    
    if (safePayload.slug) safePayload.slug = String(safePayload.slug).trim();
    if (safePayload.site) safePayload.site = String(safePayload.site).trim();
    if (safePayload.type) safePayload.type = String(safePayload.type).trim();
    if (safePayload.imageUrl) safePayload.imageUrl = String(safePayload.imageUrl).trim();
    
    const jsonBody = JSON.stringify({ data: safePayload });
    const buffer = Buffer.from(jsonBody, 'utf-8');

    const url = existing
        ? `${STRAPI_URL}/api/pages/${existing.documentId || existing.id}`
        : `${STRAPI_URL}/api/pages`;
    const method = existing ? 'PUT' : 'POST';

    const res = await fetch(url, {
        method,
        headers,
        body: buffer
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${method === 'POST' ? '建立' : '更新'} Page 失敗 (${res.status}): ${errorText}`);
    }

    return await res.json();
}

// =========================================================
// 上傳 Pages
// =========================================================

async function uploadPages(site) {
    const siteDir = path.join(__dirname, site);
    if (!fs.existsSync(siteDir)) {
        console.log(`  ⏭️  跳過 ${site}（目錄不存在）`);
        return { created: 0, updated: 0, failed: 0 };
    }

    const pageTypes = [
        { type: 'home', file: 'index.html', slug: 'index' },
        { type: 'about', file: 'about.html', slug: 'about' },
        { type: 'contact', file: 'contact.html', slug: 'contact' },
        { type: 'privacy', file: 'privacy.html', slug: 'privacy' }
    ];

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const pageType of pageTypes) {
        const filePath = path.join(siteDir, pageType.file);
        if (!fs.existsSync(filePath)) {
            console.log(`  ⏭️  跳過 ${pageType.type}（檔案不存在）`);
            continue;
        }

        const raw = readHtmlFile(filePath);
        if (!raw) continue;

        const title = extractTitle(raw, pageType.type);
        const htmlContent = extractPageHtml(raw);
        const imageUrl = extractImageUrl(raw);

        if (!title || !htmlContent) {
            console.log(`  ⚠️  無法提取 ${pageType.type} 內容`);
            continue;
        }

        const payload = {
            site,
            type: pageType.type,
            slug: pageType.slug,
            title,
            html: htmlContent
        };
        
        if (imageUrl) payload.imageUrl = imageUrl;

        try {
            const existing = await findExistingPage(site, pageType.type);
            await savePage(existing, payload);
            
            if (existing) {
                console.log(`  ✅ 更新：${pageType.type}`);
                updated++;
            } else {
                console.log(`  ✅ 建立：${pageType.type}`);
                created++;
            }
        } catch (e) {
            console.error(`  ❌ 失敗：${pageType.type} - ${e.message}`);
            failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return { created, updated, failed };
}

// =========================================================
// 上傳 Posts
// =========================================================

async function uploadPosts(site) {
    const siteDir = path.join(__dirname, site);
    const articlesDir = path.join(siteDir, 'articles');
    
    if (!fs.existsSync(articlesDir)) {
        console.log(`  ⏭️  跳過 Posts（articles 目錄不存在）`);
        return { created: 0, updated: 0, failed: 0 };
    }

    const files = fs.readdirSync(articlesDir)
        .filter(f => f.endsWith('.html'))
        .sort();

    if (files.length === 0) {
        console.log(`  ⏭️  沒有文章檔案`);
        return { created: 0, updated: 0, failed: 0 };
    }

    let created = 0;
    let updated = 0;
    let failed = 0;

    // 判斷是固定文章還是每日文章
    for (const file of files) {
        const slug = file.replace('.html', '');
        const filePath = path.join(articlesDir, file);
        const raw = readHtmlFile(filePath);
        
        if (!raw) continue;

        const title = extractTitle(raw, slug);
        const htmlContent = extractArticleHtml(raw);
        const imageUrl = extractImageUrl(raw);
        
        // 判斷類別：日期格式的是 daily，其他是 fixed
        const isDaily = /^\d{4}-\d{2}-\d{2}$/.test(slug);
        const category = isDaily ? 'daily' : 'fixed';
        const dateString = isDaily ? extractDateFromSlug(slug) : null;

        if (!title || !htmlContent) {
            console.log(`  ⚠️  無法提取 ${slug} 內容`);
            continue;
        }

        const payload = {
            site,
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

        try {
            const existing = await findExistingPost(site, slug);
            await savePost(existing, payload);
            
            if (existing) {
                console.log(`  ✅ 更新：${slug}`);
                updated++;
            } else {
                console.log(`  ✅ 建立：${slug}`);
                created++;
            }
        } catch (e) {
            console.error(`  ❌ 失敗：${slug} - ${e.message}`);
            failed++;
        }
        
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return { created, updated, failed };
}

// =========================================================
// 主程序
// =========================================================

async function main() {
    console.log('🚀 開始上傳 site6-10 到 Strapi...\n');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
    console.log(`📋 將處理：${sitesToProcess.join(', ')}\n`);

    let totalPagesCreated = 0;
    let totalPagesUpdated = 0;
    let totalPagesFailed = 0;
    let totalPostsCreated = 0;
    let totalPostsUpdated = 0;
    let totalPostsFailed = 0;

    for (const site of sitesToProcess) {
        console.log(`\n====== 處理 ${site} ======\n`);

        // 上傳 Pages
        console.log('📄 上傳 Pages...');
        const pagesResult = await uploadPages(site);
        totalPagesCreated += pagesResult.created;
        totalPagesUpdated += pagesResult.updated;
        totalPagesFailed += pagesResult.failed;

        // 上傳 Posts
        console.log('\n📝 上傳 Posts...');
        const postsResult = await uploadPosts(site);
        totalPostsCreated += postsResult.created;
        totalPostsUpdated += postsResult.updated;
        totalPostsFailed += postsResult.failed;
    }

    console.log('\n========================================');
    console.log('📊 完成統計');
    console.log('========================================');
    console.log(`Pages: 新增 ${totalPagesCreated}，更新 ${totalPagesUpdated}，失敗 ${totalPagesFailed}`);
    console.log(`Posts: 新增 ${totalPostsCreated}，更新 ${totalPostsUpdated}，失敗 ${totalPostsFailed}`);
    console.log('========================================\n');
}

main().catch(console.error);


