// 通用版本：上傳任何網站到 Strapi
// 可以從任何位置讀取網站資料夾，支援任何網站名稱
// 自動確保 HTML 檔案包含正確的 CMS 腳本引用

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ensureSiteScripts } from './ensure-cms-scripts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

// 從命令列參數取得網站資料夾路徑
const siteFolderPath = process.argv[2];

if (!siteFolderPath) {
    console.log('使用方法：node upload-site-to-strapi.js <網站資料夾路徑>');
    console.log('範例：node upload-site-to-strapi.js "C:\\Users\\...\\site6"');
    console.log('範例：node upload-site-to-strapi.js "C:\\Users\\...\\my-website"');
    process.exit(1);
}

if (!fs.existsSync(siteFolderPath)) {
    console.error(`❌ 資料夾不存在: ${siteFolderPath}`);
    process.exit(1);
}

// 從資料夾路徑提取網站名稱（可以是任何名稱）
const siteName = path.basename(siteFolderPath);

// =========================================================
// 工具函數
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

function extractPageHtml(rawHtml) {
    if (!rawHtml) return null;

    let content = null;

    // 嘗試抓 <main>
    const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
        content = mainMatch[1].trim();
    } else {
        // 抓 <body>
        const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
            content = bodyMatch[1];
            content = content.replace(/<script[\s\S]*?<\/script>/gi, '');
            content = content.replace(/<header[\s\S]*?<\/header>/gi, '');
            content = content.replace(/<footer[\s\S]*?<\/footer>/gi, '');
            content = content.trim();
        }
    }
    
    if (!content) return null;

    // Pages 的 HTML 也限制長度（雖然通常不會超過，但為安全起見）
    // 如果超過 10000 字元，截斷到 10000（Pages 通常可以更長）
    if (content.length > 10000) {
        const lastP = content.lastIndexOf('</p>', 10000);
        if (lastP > 9500) {
            content = content.substring(0, lastP + 4);
        } else {
            content = content.substring(0, 10000);
        }
    }
    
    return content;
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
    const titleMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
        let title = titleMatch[1].trim();
        title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
        return title || fallback;
    }
    
    const h1Match = rawHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
        return h1Match[1].trim();
    }
    
    return fallback || '無標題';
}

function extractImageUrl(rawHtml) {
    const articleMatch = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        const imgMatch = articleMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
    }
    
    const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];
    
    return null;
}

function extractDateFromSlug(slug) {
    const dateMatch = slug.match(/(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
}

// =========================================================
// Strapi API 函數
// =========================================================

async function findExistingPage(site, type) {
    try {
        const url = `${STRAPI_URL}/api/pages?filters[site][$eq]=${site}&filters[type][$eq]=${type}`;
        const response = await fetch(url, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    } catch (e) {
        return null;
    }
}

async function findExistingPost(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        const response = await fetch(url, { headers });
        if (!response.ok) return null;
        const data = await response.json();
        return data.data?.[0] || null;
    } catch (e) {
        return null;
    }
}

async function savePage(existing, payload) {
    const url = existing
        ? `${STRAPI_URL}/api/pages/${existing.documentId || existing.id}`
        : `${STRAPI_URL}/api/pages`;
    
    const method = existing ? 'PUT' : 'POST';
    const body = JSON.stringify({ data: payload });
    
    const response = await fetch(url, {
        method,
        headers,
        body
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
}

async function savePost(existing, payload) {
    const url = existing
        ? `${STRAPI_URL}/api/posts/${existing.documentId || existing.id}`
        : `${STRAPI_URL}/api/posts`;
    
    const method = existing ? 'PUT' : 'POST';
    const body = JSON.stringify({ data: payload });
    
    const response = await fetch(url, {
        method,
        headers,
        body
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    return await response.json();
}

// =========================================================
// 上傳 Pages
// =========================================================

async function uploadPages(siteFolderPath, siteName) {
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
        const filePath = path.join(siteFolderPath, pageType.file);
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
            site: siteName,
            type: pageType.type,
            slug: pageType.slug,
            title,
            html: htmlContent
        };
        
        if (imageUrl) payload.imageUrl = imageUrl;

        try {
            const existing = await findExistingPage(siteName, pageType.type);
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

async function uploadPosts(siteFolderPath, siteName) {
    const articlesDir = path.join(siteFolderPath, 'articles');
    if (!fs.existsSync(articlesDir)) {
        console.log('  ⏭️  跳過 Posts（articles 資料夾不存在）');
        return { created: 0, updated: 0, failed: 0 };
    }

    const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
    if (files.length === 0) {
        console.log('  ⏭️  跳過 Posts（沒有文章檔案）');
        return { created: 0, updated: 0, failed: 0 };
    }

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (const file of files) {
        const slug = file.replace('.html', '');
        const filePath = path.join(articlesDir, file);
        const raw = readHtmlFile(filePath);
        
        if (!raw) continue;

        const title = extractTitle(raw, slug);
        const htmlContent = extractArticleHtml(raw);
        const imageUrl = extractImageUrl(raw);
        
        const isDaily = /^\d{4}-\d{2}-\d{2}$/.test(slug);
        const category = isDaily ? 'daily' : 'fixed';
        const dateString = isDaily ? extractDateFromSlug(slug) : null;

        if (!title || !htmlContent) {
            console.log(`  ⚠️  無法提取 ${slug} 內容`);
            continue;
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

        try {
            const existing = await findExistingPost(siteName, slug);
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
    console.log('🚀 開始上傳網站到 Strapi...\n');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);
    console.log(`📁 網站資料夾: ${siteFolderPath}`);
    console.log(`🏷️  網站名稱: ${siteName}\n`);

    // 步驟 1：確保 HTML 檔案有正確的腳本引用
    console.log('📋 [步驟 1/3] 檢查並更新 HTML 檔案的腳本引用...\n');
    const scriptResults = ensureSiteScripts(siteFolderPath, siteName);
    console.log('');

    // 步驟 2：上傳 Pages
    console.log('📄 [步驟 2/3] 上傳 Pages...');
    const pagesResult = await uploadPages(siteFolderPath, siteName);

    // 步驟 3：上傳 Posts
    console.log('\n📝 [步驟 3/3] 上傳 Posts...');
    const postsResult = await uploadPosts(siteFolderPath, siteName);

    console.log('\n========================================');
    console.log('📊 完成統計');
    console.log('========================================');
    console.log('\n📋 腳本引用更新:');
    console.log(`   index.html: ${scriptResults.indexUpdated ? '✅ 已更新' : '✓ 無需更新'}`);
    console.log(`   all-daily-articles.html: ${scriptResults.allDailyUpdated ? '✅ 已更新' : '✓ 無需更新'}`);
    console.log(`   文章頁面: ${scriptResults.articlesUpdated} 個已更新`);
    console.log('\n📄 Pages:');
    console.log(`   新增: ${pagesResult.created}`);
    console.log(`   更新: ${pagesResult.updated}`);
    console.log(`   失敗: ${pagesResult.failed}`);
    console.log('\n📝 Posts:');
    console.log(`   新增: ${postsResult.created}`);
    console.log(`   更新: ${postsResult.updated}`);
    console.log(`   失敗: ${postsResult.failed}`);
    console.log('========================================\n');
}

main().catch(console.error);
