// =========================================================
// 通用所有每日文章頁面 CMS
// 支援所有網站，自動適配 HTML 結構
// =========================================================
// 配置：請根據你的 Strapi 設定修改
const STRAPI_URL = 'https://effortless-whisper-83765d99df.strapiapp.com'; // Strapi Cloud URL
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

// =========================================================
// 工具函數
// =========================================================
function getSiteFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(site\d+)\//);
    if (match) {
        return match[1];
    }
    return 'site1';
}

function getPostAttributes(post) {
    if (post.attributes) return post.attributes;
    const { id, documentId, ...rest } = post;
    return rest;
}

function extractFirstParagraph(html) {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const p = div.querySelector('p');
    return p ? p.textContent.trim() : '';
}

function getArticleDescription(post) {
    const attrs = getPostAttributes(post);
    if (attrs.description) return attrs.description;
    if (attrs.html) {
        return extractFirstParagraph(attrs.html);
    }
    return '';
}

// =========================================================
// 從 Strapi 獲取所有每日文章
// =========================================================
async function fetchAllDailyPosts(site) {
    try {
        const url = `${STRAPI_URL}/api/posts` +
            `?filters[site][$eq]=${site}` +
            `&filters[category][$eq]=daily` +
            `&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc` +
            `&pagination[limit]=1000`;
        
        console.log(`🔍 [${site}] 請求所有每日文章: ${url}`);
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ [${site}] 獲取文章失敗 (${response.status}):`, await response.text());
            return [];
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            console.log(`✅ [${site}] 獲取到 ${data.data.length} 篇文章`);
            return data.data;
        }
        
        return [];
    } catch (error) {
        console.error(`❌ [${site}] 獲取文章失敗:`, error);
        return [];
    }
}

// =========================================================
// 載入所有每日文章
// =========================================================
async function loadAllDailyArticles() {
    const site = getSiteFromPath();
    console.log(`🚀 [${site}] 開始載入所有每日文章...`);
    
    // 自動尋找文章列表容器
    const selectors = [
        '.all-daily-list',
        '.all-daily-articles-list',
        '.daily-list',
        '.article-list',
        'ul[class*="daily"]',
        'ul[class*="article"]'
    ];
    
    let container = null;
    for (const selector of selectors) {
        container = document.querySelector(selector);
        if (container) {
            console.log(`✅ [${site}] 找到文章列表容器: ${selector}`);
            break;
        }
    }
    
    if (!container) {
        console.warn(`⚠️ [${site}] 找不到文章列表容器`);
        return;
    }
    
    const posts = await fetchAllDailyPosts(site);
    
    if (posts.length === 0) {
        container.innerHTML = '<li><p>暫無文章</p></li>';
        return;
    }
    
    // 去重並排序
    const seenSlugs = new Set();
    const uniquePosts = [];
    
    for (const item of posts) {
        if (!item) continue;
        const p = getPostAttributes(item);
        if (p.slug && !seenSlugs.has(p.slug)) {
            seenSlugs.add(p.slug);
            uniquePosts.push(item);
        }
    }
    
    // 按日期排序
    uniquePosts.sort((a, b) => {
        const attrsA = getPostAttributes(a);
        const attrsB = getPostAttributes(b);
        
        let dateA = attrsA.date || attrsA.publishedAt || attrsA.createdAt || '';
        let dateB = attrsB.date || attrsB.publishedAt || attrsB.createdAt || '';
        
        // 從 slug 提取日期
        if (!dateA || !dateB) {
            const slugA = attrsA.slug || '';
            const slugB = attrsB.slug || '';
            const dateMatchA = slugA.match(/(\d{4}-\d{2}-\d{2})/);
            const dateMatchB = slugB.match(/(\d{4}-\d{2}-\d{2})/);
            
            if (dateMatchA && !dateA) dateA = dateMatchA[1] + 'T00:00:00.000Z';
            if (dateMatchB && !dateB) dateB = dateMatchB[1] + 'T00:00:00.000Z';
        }
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
    
    // 生成 HTML（通用格式）
    container.innerHTML = uniquePosts.map(post => {
        const attrs = getPostAttributes(post);
        const title = attrs.title || attrs.slug;
        const slug = attrs.slug;
        const description = getArticleDescription(post);
        
        // 日期處理
        let date = '';
        const dateSource = attrs.date || attrs.publishedAt || attrs.createdAt;
        if (dateSource) {
            const d = new Date(dateSource);
            if (!isNaN(d.getTime())) {
                date = d.toISOString().split('T')[0];
            }
        }
        
        // 通用 HTML 結構（自動適配）
        return `
            <li class="all-daily-item">
                <a href="articles/${slug}.html">
                    <h2>${title}</h2>
                    ${date ? `<span class="publish-date">${date}</span>` : ''}
                </a>
                ${description ? `<p>${description}</p>` : ''}
            </li>
        `;
    }).join('');
    
    console.log(`✅ [${site}] 已載入 ${uniquePosts.length} 篇文章`);
}

// =========================================================
// 更新導覽列連結
// =========================================================
async function updateNavDailyLink(site) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc&pagination[limit]=1`;
        const headers = { 'Content-Type': 'application/json' };
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) return;
        
        const data = await response.json();
        const posts = data.data || [];
        if (posts.length === 0) return;
        
        const post = posts[0];
        const attrs = getPostAttributes(post);
        const latestSlug = attrs.slug;
        
        if (!latestSlug) return;
        
        // 更新導覽列連結
        document.querySelectorAll('nav a, .nav-menu a, .nav-links a').forEach(link => {
            const linkText = link.textContent.trim();
            if (linkText === '每日精選文章' || linkText.includes('每日精選')) {
                const currentHref = link.getAttribute('href');
                if (currentHref && currentHref.includes('articles/')) {
                    link.setAttribute('href', currentHref.replace(/articles\/[^/]+\.html/, `articles/${latestSlug}.html`));
                }
            }
        });
    } catch (error) {
        console.error(`❌ [${site}] 更新導覽列連結失敗:`, error);
    }
}

// =========================================================
// 頁面載入完成後執行
// =========================================================
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAllDailyArticles();
        updateNavDailyLink(getSiteFromPath());
    });
} else {
    loadAllDailyArticles();
    updateNavDailyLink(getSiteFromPath());
}
