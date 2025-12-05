// 使用 content 欄位上傳（如果新增了 Long text 欄位）
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

// 使用與 upload-all-to-cloud.js 相同的函數
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
    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        // 清理換行符
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return content.trim();
    }
    const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch2) {
        let content = articleMatch2[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        return content.trim();
    }
    return null;
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
        // 使用 content 欄位儲存完整 HTML（如果欄位存在）
        // 同時保留 html 欄位（存前 255 字元作為預覽）
        content: String(payload.content || payload.html || ''),
        html: String(payload.html || '').substring(0, 255) // 保留前 255 字元
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

async function uploadPosts() {
    console.log('🚀 開始上傳 Posts（使用 content 欄位）...\n');
    
    const fixedArticles = {
        site1: ['retro-vs-modern', 'collector-guide', 'cartridge-care'],
        site2: ['monitor-hz', 'keyboard-switches', 'aim-training'],
        site3: ['narrative-games', 'pixel-art', 'steam-wishlist'],
        site4: ['100-percent-guide', 'open-world-map', 'souls-like-combat'],
        site5: ['f2p-guide', 'phone-heating', 'portrait-games']
    };

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const siteDir = path.join(__dirname, site);
        
        if (!fs.existsSync(siteDir)) continue;
        
        console.log(`\n====== 處理 ${site} ======`);

        // 固定文章
        const fixed = fixedArticles[site] || [];
        if (fixed.length > 0) {
            console.log(`\n📌 上傳 ${fixed.length} 篇固定文章...`);
            for (const slug of fixed) {
                const filePath = path.join(siteDir, 'articles', `${slug}.html`);
                const raw = readHtmlFile(filePath);
                
                if (!raw) {
                    console.log(`  ⏭️  找不到：${slug}`);
                    continue;
                }

                const title = extractTitle(raw, slug);
                const htmlContent = extractArticleHtml(raw);
                const imageUrl = extractImageUrl(raw);

                if (!title || !htmlContent) {
                    console.log(`  ⚠️  無法提取內容：${slug}`);
                    continue;
                }

                const payload = {
                    site,
                    category: 'fixed',
                    slug,
                    title,
                    content: htmlContent, // 使用 content 欄位
                    html: htmlContent.substring(0, 255) // 保留 html 作為預覽
                };
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
        }

        // 每日文章
        const articlesDir = path.join(siteDir, 'articles');
        if (fs.existsSync(articlesDir)) {
            const files = fs.readdirSync(articlesDir)
                .filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
                .sort()
                .reverse();
            
            if (files.length > 0) {
                console.log(`\n📅 上傳 ${files.length} 篇每日文章...`);
                for (const file of files) {
                    const slug = file.replace('.html', '');
                    const filePath = path.join(articlesDir, file);
                    const raw = readHtmlFile(filePath);
                    
                    if (!raw) continue;

                    const title = extractTitle(raw, slug);
                    const htmlContent = extractArticleHtml(raw);
                    const imageUrl = extractImageUrl(raw);
                    const dateString = extractDateFromSlug(slug);

                    if (!title || !htmlContent) continue;

                    const payload = {
                        site,
                        category: 'daily',
                        slug,
                        title,
                        content: htmlContent, // 使用 content 欄位
                        html: htmlContent.substring(0, 255), // 保留 html 作為預覽
                        publishedAt: dateString ? `${dateString}T09:00:00.000Z` : new Date().toISOString(),
                        date: dateString || null,
                        isFeatured: true
                    };
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
            }
        }
    }

    console.log('\n========================================');
    console.log(`📊 完成 - 新增 ${created}，更新 ${updated}，失敗 ${failed}`);
    console.log('========================================\n');
}

uploadPosts().catch(console.error);



