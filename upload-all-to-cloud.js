// =========================================================
// 一次性上傳 site1-site5 所有內容到雲端 Strapi
// 使用方式：
//   $env:STRAPI_URL="https://effortless-whisper-83765d99df.strapiapp.com"
//   $env:STRAPI_TOKEN="你的API_TOKEN"
//   node upload-all-to-cloud.js
// =========================================================

// 修復 SSL/TLS 問題（必須在最前面）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 使用 Node.js 內建的 fetch（Node.js 18+）
// 如果 Node.js 版本較舊，請安裝 node-fetch: npm install node-fetch
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =========================================================
// 配置
// =========================================================

const STRAPI_URL = process.env.STRAPI_URL || 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';

if (!STRAPI_TOKEN) {
    console.error('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數');
    console.error('\n請執行：');
    console.error('  $env:STRAPI_URL="https://effortless-whisper-83765d99df.strapiapp.com"');
    console.error('  $env:STRAPI_TOKEN="你的API_TOKEN"');
    console.error('  node upload-all-to-cloud.js');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

// =========================================================
// 工具函數：讀取 HTML 檔案
// =========================================================

function readHtmlFile(filePath) {
    if (!fs.existsSync(filePath)) return null;
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // 移除 UTF-8 BOM (如果存在)
        if (content.charCodeAt(0) === 0xFEFF) {
            return content.slice(1);
        }
        return content;
    } catch (e) {
        console.error(`❌ 讀取檔案失敗: ${filePath}`, e.message);
        return null;
    }
}

// =========================================================
// 工具函數：提取頁面 HTML（從 <main> 或 <body>）
// =========================================================

function extractPageHtml(rawHtml) {
    if (!rawHtml) return null;

    // 嘗試抓 <main>
    const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
        return mainMatch[1].trim();
    }

    // 抓 <body>
    const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
        let body = bodyMatch[1];
        // 去掉 script / header / footer
        body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
        body = body.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
        body = body.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
        return body.trim();
    }

    return rawHtml.trim();
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
        // 移除網站名稱（例如 " | 像素時光"）
        title = title.replace(/\s*\|\s*[^|]+$/, '').trim();
        return title;
    }
    return fallback;
}

// =========================================================
// 工具函數：提取文章 HTML（從 <article>）
// =========================================================

function extractArticleHtml(rawHtml) {
    if (!rawHtml) return null;

    // 優先抓 <article class="article-content">
    const articleMatch = rawHtml.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        // 移除 <h1> 標題
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        // 移除發布日期資訊
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        
        // 移除圖片標籤（因為有 imageUrl 欄位）
        // 保留圖片的位置標記，方便前端插入
        content = content.replace(/<img[^>]*>/gi, '<!-- IMAGE_PLACEHOLDER -->');
        content = content.replace(/<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi, '<!-- HERO_IMAGE_PLACEHOLDER -->');
        
        // 清理多餘的空白
        content = content.replace(/\n{3,}/g, '\n\n');
        content = content.replace(/\s+$/gm, '');
        
        // 限制長度為 250 字元（安全邊界）
        if (content.length > 250) {
            // 嘗試在段落結尾截斷
            const lastP = content.lastIndexOf('</p>', 250);
            if (lastP > 200) {
                content = content.substring(0, lastP + 4);
            } else {
                // 如果沒有段落，直接截斷
                content = content.substring(0, 250);
            }
            content += '...';
        }
        
        return content.trim();
    }

    // 退而求其次：抓任意 <article>
    const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch2) {
        let content = articleMatch2[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        
        // 移除圖片標籤
        content = content.replace(/<img[^>]*>/gi, '<!-- IMAGE_PLACEHOLDER -->');
        content = content.replace(/<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi, '<!-- HERO_IMAGE_PLACEHOLDER -->');
        
        // 限制長度
        if (content.length > 250) {
            const lastP = content.lastIndexOf('</p>', 250);
            if (lastP > 200) {
                content = content.substring(0, lastP + 4);
            } else {
                content = content.substring(0, 250);
            }
            content += '...';
        }
        
        return content.trim();
    }

    return null;
}

// =========================================================
// 工具函數：提取圖片 URL
// =========================================================

function extractImageUrl(rawHtml) {
    if (!rawHtml) return null;
    
    // 嘗試從 <article> 內的第一個 <img> 提取
    const articleMatch = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        const imgMatch = articleMatch[1].match(/<img[^>]+src=["']([^"']+)["']/i);
        if (imgMatch) return imgMatch[1];
    }

    // 嘗試從整個 HTML 的第一個 <img> 提取
    const imgMatch = rawHtml.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) return imgMatch[1];

    return null;
}

// =========================================================
// 工具函數：從 slug 提取日期
// =========================================================

function extractDateFromSlug(slug) {
    const dateMatch = slug.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
        return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
    }
    return null;
}

// =========================================================
// API 函數：查詢現有 Page
// =========================================================

async function findExistingPage(site, type) {
    try {
        const qs = `filters[site][$eq]=${encodeURIComponent(site)}&filters[type][$eq]=${encodeURIComponent(type)}&pagination[limit]=1`;
        const url = `${STRAPI_URL}/api/pages?${qs}`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`查詢 Page 失敗 (${res.status}): ${await res.text()}`);
        }
        const data = await res.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        return null;
    } catch (error) {
        console.error(`❌ 查詢 Page 失敗:`, error.message);
        return null;
    }
}

// =========================================================
// API 函數：創建/更新 Page
// =========================================================

async function savePage(existing, payload) {
    const safePayload = {
        ...payload,
        title: String(payload.title || ''),
        html: String(payload.html || '')
    };
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
// API 函數：查詢現有 Post
// =========================================================

async function findExistingPost(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${encodeURIComponent(site)}&filters[slug][$eq]=${encodeURIComponent(slug)}&pagination[limit]=1`;
        const res = await fetch(url, { headers });
        if (!res.ok) {
            throw new Error(`查詢 Post 失敗 (${res.status}): ${await res.text()}`);
        }
        const data = await res.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        return null;
    } catch (error) {
        console.error(`❌ 查詢 Post 失敗:`, error.message);
        return null;
    }
}

// =========================================================
// API 函數：創建/更新 Post
// =========================================================

async function savePost(existing, payload) {
    // 清理 HTML 內容，確保格式正確
    let cleanHtml = String(payload.html || '');
    
    // 移除 Windows 換行符，統一使用 \n
    cleanHtml = cleanHtml.replace(/\r\n/g, '\n');
    cleanHtml = cleanHtml.replace(/\r/g, '\n');
    
    // 移除多餘的空白行（保留最多兩個連續換行）
    cleanHtml = cleanHtml.replace(/\n{3,}/g, '\n\n');
    
    // 移除開頭和結尾的空白
    cleanHtml = cleanHtml.trim();
    
    const safePayload = {
        ...payload,
        title: String(payload.title || '').trim(),
        html: cleanHtml
    };
    
    // 確保所有字串欄位都是有效的 UTF-8
    if (safePayload.slug) safePayload.slug = String(safePayload.slug).trim();
    if (safePayload.site) safePayload.site = String(safePayload.site).trim();
    if (safePayload.category) safePayload.category = String(safePayload.category).trim();
    if (safePayload.excerpt) safePayload.excerpt = String(safePayload.excerpt).trim();
    if (safePayload.date) safePayload.date = String(safePayload.date).trim();
    if (safePayload.imageUrl) safePayload.imageUrl = String(safePayload.imageUrl).trim();
    
    // 使用標準 JSON 序列化
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
// 上傳所有 Pages
// =========================================================

async function uploadAllPages() {
    console.log('\n📄 開始上傳所有 Pages...\n');

    const pageDefs = [
        { type: 'home', file: 'index.html', slug: 'index' },
        { type: 'contact', file: 'contact.html', slug: 'contact' },
        { type: 'about', file: 'about.html', slug: 'about' },
        { type: 'privacy', file: 'privacy.html', slug: 'privacy' }
    ];

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const siteDir = path.join(__dirname, site);

        if (!fs.existsSync(siteDir)) {
            console.log(`⚠️  找不到目錄：${site}，跳過`);
            continue;
        }

        console.log(`\n====== 處理 ${site} ======`);

        for (const def of pageDefs) {
            const filePath = path.join(siteDir, def.file);
            const raw = readHtmlFile(filePath);

            if (!raw) {
                console.log(`⏭️  找不到檔案：${site}/${def.file}，跳過`);
                continue;
            }

            const html = extractPageHtml(raw);
            if (!html) {
                console.log(`⏭️  無法從 ${site}/${def.file} 擷取內容，跳過`);
                continue;
            }

            const title = extractTitle(raw, `${site} ${def.type}`);

            const payload = {
                site,
                type: def.type,
                slug: def.slug,
                title,
                html
            };

            try {
                const existing = await findExistingPage(site, def.type);
                await savePage(existing, payload);
                
                if (existing) {
                    console.log(`  ✅ 更新：${def.type}`);
                    updated++;
                } else {
                    console.log(`  ✅ 建立：${def.type}`);
                    created++;
                }
            } catch (e) {
                console.error(`  ❌ 處理 ${site}/${def.file} (${def.type}) 失敗：`, e.message);
                failed++;
            }
        }
    }

    console.log('\n========================================');
    console.log(`📊 Pages 上傳完成 - 新增 ${created} 筆，更新 ${updated} 筆，失敗 ${failed} 筆`);
    console.log('========================================\n');

    return { created, updated, failed };
}

// =========================================================
// 上傳所有 Posts
// =========================================================

async function uploadAllPosts() {
    console.log('\n📝 開始上傳所有 Posts...\n');

    // 固定文章列表（每個站點）
    const fixedArticles = {
        site1: ['retro-vs-modern', 'collector-guide', 'cartridge-care'],
        site2: ['monitor-hz', 'keyboard-switches', 'aim-training'],
        site3: ['narrative-games', 'pixel-art', 'steam-wishlist'],
        site4: ['100-percent-guide', 'open-world-map', 'souls-like-combat'],
        site5: ['f2p-guide', 'phone-heating', 'portrait-games']
    };

    // 取得所有每日文章（從檔案系統掃描）
    function getDailyArticles(site) {
        const articlesDir = path.join(__dirname, site, 'articles');
        if (!fs.existsSync(articlesDir)) {
            return [];
        }
        const files = fs.readdirSync(articlesDir);
        return files
            .filter(file => /^\d{4}-\d{2}-\d{2}\.html$/.test(file))
            .map(file => file.replace('.html', ''))
            .sort()
            .reverse(); // 最新的在前
    }

    let created = 0;
    let updated = 0;
    let failed = 0;

    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const siteDir = path.join(__dirname, site);

        if (!fs.existsSync(siteDir)) {
            console.log(`⚠️  找不到目錄：${site}，跳過`);
            continue;
        }

        console.log(`\n====== 處理 ${site} ======`);

        // 上傳固定文章
        const fixed = fixedArticles[site] || [];
        if (fixed.length > 0) {
            console.log(`\n📌 上傳 ${fixed.length} 篇固定文章...`);
            for (const slug of fixed) {
                const filePath = path.join(siteDir, 'articles', `${slug}.html`);
                const raw = readHtmlFile(filePath);

                if (!raw) {
                    console.log(`  ⏭️  找不到檔案：${site}/articles/${slug}.html，跳過`);
                    continue;
                }

                const title = extractTitle(raw, slug);
                const htmlContent = extractArticleHtml(raw);
                const imageUrl = extractImageUrl(raw);

                if (!title || !htmlContent) {
                    console.log(`  ⚠️  無法提取內容：${slug}，跳過`);
                    continue;
                }

                const payload = {
                    site,
                    category: 'fixed',
                    slug,
                    title,
                    html: htmlContent
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
                    console.error(`  ❌ 處理 ${site}/${slug} 失敗：`, e.message);
                    failed++;
                }
            }
        }

        // 上傳每日文章
        const daily = getDailyArticles(site);
        if (daily.length > 0) {
            console.log(`\n📅 上傳 ${daily.length} 篇每日文章...`);
            for (const slug of daily) {
                const filePath = path.join(siteDir, 'articles', `${slug}.html`);
                const raw = readHtmlFile(filePath);

                if (!raw) {
                    console.log(`  ⏭️  找不到檔案：${site}/articles/${slug}.html，跳過`);
                    continue;
                }

                const title = extractTitle(raw, slug);
                const htmlContent = extractArticleHtml(raw);
                const imageUrl = extractImageUrl(raw);
                const dateString = extractDateFromSlug(slug);

                if (!title || !htmlContent) {
                    console.log(`  ⚠️  無法提取內容：${slug}，跳過`);
                    continue;
                }

                const payload = {
                    site,
                    category: 'daily',
                    slug,
                    title,
                    html: htmlContent,
                    isFeatured: true
                };
                // 只有在有日期時才添加 publishedAt
                if (dateString) {
                    payload.publishedAt = `${dateString}T09:00:00.000Z`;
                    payload.date = dateString;
                } else {
                    // 如果沒有日期，使用當前時間
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
                    console.error(`  ❌ 處理 ${site}/${slug} 失敗：`, e.message);
                    failed++;
                }
            }
        }
    }

    console.log('\n========================================');
    console.log(`📊 Posts 上傳完成 - 新增 ${created} 筆，更新 ${updated} 筆，失敗 ${failed} 筆`);
    console.log('========================================\n');

    return { created, updated, failed };
}

// =========================================================
// 主程序
// =========================================================

async function main() {
    console.log('🚀 開始上傳所有內容到雲端 Strapi...');
    console.log(`📍 Strapi URL: ${STRAPI_URL}\n`);

    // 測試連接（直接測試 pages API）
    try {
        console.log('🔍 測試連接到 Strapi...');
        const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=1`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        if (response.ok || response.status === 400) {
            // 400 也可能是正常的（可能是查詢參數問題，但至少 API 可訪問）
            console.log('✅ 連接成功！\n');
        } else if (response.status === 401 || response.status === 403) {
            const errorText = await response.text();
            console.error(`❌ 認證失敗: ${response.status}`);
            console.error(`   錯誤訊息: ${errorText.substring(0, 200)}`);
            console.error('\n💡 提示：請檢查 API Token 是否正確，並確認 Token 類型為 "Full access"');
            return;
        } else {
            console.warn(`⚠️  連接測試返回 ${response.status}，但會繼續嘗試上傳...\n`);
        }
    } catch (error) {
        console.warn(`⚠️  連接測試失敗: ${error.message}`);
        console.warn('   但會繼續嘗試上傳...\n');
    }

    // 上傳 Pages
    const pagesResult = await uploadAllPages();

    // 上傳 Posts
    const postsResult = await uploadAllPosts();

    // 總結
    console.log('\n' + '='.repeat(50));
    console.log('📊 上傳總結');
    console.log('='.repeat(50));
    console.log(`Pages: 新增 ${pagesResult.created}，更新 ${pagesResult.updated}，失敗 ${pagesResult.failed}`);
    console.log(`Posts: 新增 ${postsResult.created}，更新 ${postsResult.updated}，失敗 ${postsResult.failed}`);
    console.log('='.repeat(50));
    console.log('\n✅ 所有內容已上傳完成！');
    console.log(`   現在可以在 Strapi 後台查看：${STRAPI_URL}/admin\n`);
}

main().catch((err) => {
    console.error('❌ 執行失敗：', err);
    process.exit(1);
});

