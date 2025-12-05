// 修復版：上傳 Posts，處理特殊字元和編碼問題
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

// 清理 HTML 內容，移除可能有問題的字元
function cleanHtml(html) {
    if (!html) return '';
    
    // 移除 Windows 換行符（\r\n）改為 \n
    html = html.replace(/\r\n/g, '\n');
    
    // 移除多餘的空白
    html = html.replace(/\n{3,}/g, '\n\n');
    
    // 確保所有引號都是標準的
    // 但保留 HTML 屬性中的引號
    
    return html.trim();
}

function extractArticleHtml(rawHtml) {
    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        return cleanHtml(content);
    }
    
    const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch2) {
        let content = articleMatch2[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        return cleanHtml(content);
    }
    
    return null;
}

function extractTitle(rawHtml) {
    const titleMatch = rawHtml.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
        return titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim();
    }
    return null;
}

function extractImageUrl(rawHtml) {
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
    // 確保 HTML 內容是乾淨的
    if (payload.html) {
        payload.html = cleanHtml(payload.html);
    }
    
    const safePayload = {
        ...payload,
        title: String(payload.title || ''),
        html: String(payload.html || '')
    };
    
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

async function uploadPost(site, slug, filePath, category) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const title = extractTitle(raw);
    const htmlContent = extractArticleHtml(raw);
    const imageUrl = extractImageUrl(raw);
    const dateString = extractDateFromSlug(slug);

    if (!title || !htmlContent) {
        throw new Error('無法提取標題或內容');
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
    } else {
        payload.publishedAt = new Date().toISOString();
    }
    
    if (category === 'daily') {
        payload.isFeatured = true;
    }
    
    if (imageUrl) {
        payload.imageUrl = imageUrl;
    }

    const existing = await findExistingPost(site, slug);
    await savePost(existing, payload);
    
    return existing ? 'updated' : 'created';
}

async function main() {
    console.log('🚀 開始上傳 Posts（修復版）...\n');
    
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

    // 先測試上傳一篇每日文章
    console.log('🧪 測試上傳一篇每日文章...\n');
    try {
        const result = await uploadPost('site1', '2025-12-01', path.join(__dirname, 'site1', 'articles', '2025-12-01.html'), 'daily');
        console.log(`✅ 測試成功：${result}\n`);
    } catch (error) {
        console.error(`❌ 測試失敗：${error.message}\n`);
        console.error('這表示問題可能在於 HTML 內容的特定部分');
        return;
    }

    // 如果測試成功，繼續上傳所有文章
    console.log('📝 開始上傳所有文章...\n');

    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        console.log(`\n====== 處理 ${site} ======`);

        // 固定文章
        const fixed = fixedArticles[site] || [];
        if (fixed.length > 0) {
            console.log(`\n📌 上傳 ${fixed.length} 篇固定文章...`);
            for (const slug of fixed) {
                const filePath = path.join(__dirname, site, 'articles', `${slug}.html`);
                if (!fs.existsSync(filePath)) {
                    console.log(`  ⏭️  找不到：${slug}`);
                    continue;
                }
                try {
                    const result = await uploadPost(site, slug, filePath, 'fixed');
                    if (result === 'created') {
                        console.log(`  ✅ 建立：${slug}`);
                        created++;
                    } else {
                        console.log(`  ✅ 更新：${slug}`);
                        updated++;
                    }
                } catch (e) {
                    console.error(`  ❌ 失敗：${slug} - ${e.message}`);
                    failed++;
                }
                await new Promise(resolve => setTimeout(resolve, 200)); // 避免太快
            }
        }

        // 每日文章
        const articlesDir = path.join(__dirname, site, 'articles');
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
                    try {
                        const result = await uploadPost(site, slug, filePath, 'daily');
                        if (result === 'created') {
                            console.log(`  ✅ 建立：${slug}`);
                            created++;
                        } else {
                            console.log(`  ✅ 更新：${slug}`);
                            updated++;
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

main().catch(console.error);



