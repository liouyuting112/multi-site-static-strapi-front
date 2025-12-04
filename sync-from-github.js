// =========================================================
// 從 GitHub 同步內容到 Strapi 雲端
// 使用方式：
//   $env:STRAPI_URL="https://effortless-whisper-83765d99df.strapiapp.com"
//   $env:STRAPI_TOKEN="你的API_TOKEN"
//   $env:GITHUB_REPO="liouyuting112/static-sites-monorepo-1"  (可選，有預設值)
//   $env:GITHUB_BRANCH="main"  (可選，有預設值)
//   node sync-from-github.js
// =========================================================

// 修復 SSL/TLS 問題（必須在最前面）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 使用 Node.js 內建的 fetch（Node.js 18+）
// 如果 Node.js 版本較舊，請安裝 node-fetch: npm install node-fetch

// =========================================================
// 配置
// =========================================================

const STRAPI_URL = process.env.STRAPI_URL || 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '';
const GITHUB_REPO = process.env.GITHUB_REPO || 'liouyuting112/static-sites-monorepo-1';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

if (!STRAPI_TOKEN) {
    console.error('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數');
    console.error('\n請執行：');
    console.error('  $env:STRAPI_URL="https://effortless-whisper-83765d99df.strapiapp.com"');
    console.error('  $env:STRAPI_TOKEN="你的API_TOKEN"');
    console.error('  node sync-from-github.js');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

// GitHub API 基礎 URL
const GITHUB_API_BASE = `https://api.github.com/repos/${GITHUB_REPO}`;
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}`;

// =========================================================
// 工具函數：從 GitHub 抓取檔案內容
// =========================================================

async function fetchFromGitHub(filePath) {
    try {
        const url = `${GITHUB_RAW_BASE}/${filePath}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return null; // 檔案不存在
            }
            throw new Error(`GitHub API 錯誤 (${response.status}): ${await response.text()}`);
        }
        
        const content = await response.text();
        // 移除 UTF-8 BOM (如果存在)
        if (content.charCodeAt(0) === 0xFEFF) {
            return content.slice(1);
        }
        return content;
    } catch (error) {
        console.error(`❌ 從 GitHub 抓取檔案失敗 ${filePath}:`, error.message);
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
        return content;
    }

    // 退而求其次：抓任意 <article>
    const articleMatch2 = rawHtml.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch2) {
        let content = articleMatch2[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        content = content.replace(/發布於[\s\S]*?<\/p>/i, '').trim();
        content = content.replace(/發布日期[\s\S]*?<\/p>/i, '').trim();
        return content;
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

// =========================================================
// 從 GitHub 獲取檔案列表（使用 GitHub API）
// =========================================================

async function getGitHubFileList(site, subPath = '') {
    try {
        const path = subPath ? `${site}/${subPath}` : site;
        const url = `${GITHUB_API_BASE}/contents/${path}?ref=${GITHUB_BRANCH}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                return []; // 目錄不存在
            }
            throw new Error(`GitHub API 錯誤 (${response.status}): ${await response.text()}`);
        }
        
        const data = await response.json();
        // 只返回檔案（type === 'file'）
        return (Array.isArray(data) ? data : [data])
            .filter(item => item.type === 'file')
            .map(item => item.name);
    } catch (error) {
        console.error(`❌ 獲取 GitHub 檔案列表失敗 ${site}/${subPath}:`, error.message);
        return [];
    }
}

// =========================================================
// 上傳所有 Pages（從 GitHub）
// =========================================================

async function uploadAllPagesFromGitHub() {
    console.log('\n📄 開始從 GitHub 同步所有 Pages...\n');

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
        console.log(`\n====== 處理 ${site} ======`);

        for (const def of pageDefs) {
            const filePath = `${site}/${def.file}`;
            const raw = await fetchFromGitHub(filePath);

            if (!raw) {
                console.log(`⏭️  找不到檔案：${filePath}，跳過`);
                continue;
            }

            const html = extractPageHtml(raw);
            if (!html) {
                console.log(`⏭️  無法從 ${filePath} 擷取內容，跳過`);
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
                console.error(`  ❌ 處理 ${filePath} (${def.type}) 失敗：`, e.message);
                failed++;
            }
        }
    }

    console.log('\n========================================');
    console.log(`📊 Pages 同步完成 - 新增 ${created} 筆，更新 ${updated} 筆，失敗 ${failed} 筆`);
    console.log('========================================\n');

    return { created, updated, failed };
}

// =========================================================
// 上傳所有 Posts（從 GitHub）
// =========================================================

async function uploadAllPostsFromGitHub() {
    console.log('\n📝 開始從 GitHub 同步所有 Posts...\n');

    // 固定文章列表（每個站點）
    const fixedArticles = {
        site1: ['retro-vs-modern', 'collector-guide', 'cartridge-care'],
        site2: ['monitor-hz', 'keyboard-switches', 'aim-training'],
        site3: ['narrative-games', 'pixel-art', 'steam-wishlist'],
        site4: ['100-percent-guide', 'open-world-map', 'souls-like-combat'],
        site5: ['f2p-guide', 'phone-heating', 'portrait-games']
    };

    // 從 GitHub 獲取所有每日文章（掃描 articles 目錄）
    async function getDailyArticles(site) {
        const files = await getGitHubFileList(site, 'articles');
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
        console.log(`\n====== 處理 ${site} ======`);

        // 上傳固定文章
        const fixed = fixedArticles[site] || [];
        if (fixed.length > 0) {
            console.log(`\n📌 同步 ${fixed.length} 篇固定文章...`);
            for (const slug of fixed) {
                const filePath = `${site}/articles/${slug}.html`;
                const raw = await fetchFromGitHub(filePath);

                if (!raw) {
                    console.log(`  ⏭️  找不到檔案：${filePath}，跳過`);
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
        const daily = await getDailyArticles(site);
        if (daily.length > 0) {
            console.log(`\n📅 同步 ${daily.length} 篇每日文章...`);
            for (const slug of daily) {
                const filePath = `${site}/articles/${slug}.html`;
                const raw = await fetchFromGitHub(filePath);

                if (!raw) {
                    console.log(`  ⏭️  找不到檔案：${filePath}，跳過`);
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
                    console.error(`  ❌ 處理 ${site}/${slug} 失敗：`, e.message);
                    failed++;
                }
            }
        }
    }

    console.log('\n========================================');
    console.log(`📊 Posts 同步完成 - 新增 ${created} 筆，更新 ${updated} 筆，失敗 ${failed} 筆`);
    console.log('========================================\n');

    return { created, updated, failed };
}

// =========================================================
// 主程序
// =========================================================

async function main() {
    console.log('🚀 開始從 GitHub 同步內容到 Strapi 雲端...');
    console.log(`📍 Strapi URL: ${STRAPI_URL}`);
    console.log(`📍 GitHub Repo: ${GITHUB_REPO}`);
    console.log(`📍 GitHub Branch: ${GITHUB_BRANCH}\n`);

    // 測試連接（直接測試 pages API）
    try {
        console.log('🔍 測試連接到 Strapi...');
        const response = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=1`, {
            headers: { 'Authorization': `Bearer ${STRAPI_TOKEN}` }
        });
        if (response.ok || response.status === 400) {
            console.log('✅ Strapi 連接成功！\n');
        } else if (response.status === 401 || response.status === 403) {
            const errorText = await response.text();
            console.error(`❌ 認證失敗: ${response.status}`);
            console.error(`   錯誤訊息: ${errorText.substring(0, 200)}`);
            console.error('\n💡 提示：請檢查 API Token 是否正確，並確認 Token 類型為 "Full access"');
            return;
        } else {
            console.warn(`⚠️  連接測試返回 ${response.status}，但會繼續嘗試同步...\n`);
        }
    } catch (error) {
        console.warn(`⚠️  連接測試失敗: ${error.message}`);
        console.warn('   但會繼續嘗試同步...\n');
    }

    // 測試 GitHub 連接
    try {
        console.log('🔍 測試連接到 GitHub...');
        const testFile = await fetchFromGitHub('site1/index.html');
        if (testFile) {
            console.log('✅ GitHub 連接成功！\n');
        } else {
            console.warn('⚠️  無法從 GitHub 讀取測試檔案，但會繼續嘗試...\n');
        }
    } catch (error) {
        console.warn(`⚠️  GitHub 連接測試失敗: ${error.message}`);
        console.warn('   但會繼續嘗試同步...\n');
    }

    // 同步 Pages
    const pagesResult = await uploadAllPagesFromGitHub();

    // 同步 Posts
    const postsResult = await uploadAllPostsFromGitHub();

    // 總結
    console.log('\n' + '='.repeat(50));
    console.log('📊 同步總結');
    console.log('='.repeat(50));
    console.log(`Pages: 新增 ${pagesResult.created}，更新 ${pagesResult.updated}，失敗 ${pagesResult.failed}`);
    console.log(`Posts: 新增 ${postsResult.created}，更新 ${postsResult.updated}，失敗 ${postsResult.failed}`);
    console.log('='.repeat(50));
    console.log('\n✅ 所有內容已從 GitHub 同步完成！');
    console.log(`   現在可以在 Strapi 後台查看：${STRAPI_URL}/admin\n`);
}

main().catch((err) => {
    console.error('❌ 執行失敗：', err);
    process.exit(1);
});

