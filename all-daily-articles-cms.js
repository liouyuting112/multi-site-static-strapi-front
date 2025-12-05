// =========================================================
// 通用所有每日文章頁面 CMS
// 自動適配各網站原始樣式，保留圖片和佈局
// =========================================================
// 根據環境自動選擇 Strapi URL
function getStrapiUrl() {
    const hostname = window.location.hostname;
    
    // 開發環境：預覽網址（包含 git- 或隨機字串的 vercel.app）
    // 正式環境：標準專案名稱的 vercel.app（如 multi-site-static-strapi-front.vercel.app）
    if (hostname.includes('vercel.app')) {
        // 如果是標準格式（專案名稱.vercel.app），使用正式環境
        if (hostname === 'multi-site-static-strapi-front.vercel.app' || 
            hostname.match(/^[a-z0-9-]+\.vercel\.app$/)) {
            return 'https://effortless-whisper-83765d99df.strapiapp.com'; // 正式環境
        }
        // 其他格式（包含 git- 或隨機字串），使用開發環境
        return 'https://growing-dawn-18cd7440ad.strapiapp.com'; // 開發環境
    }
    
    // 本地開發或其他環境，預設使用開發環境
    return 'https://growing-dawn-18cd7440ad.strapiapp.com'; // 開發環境
}

const STRAPI_URL = getStrapiUrl();
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

function extractFirstParagraph(htmlContent, maxLength = 100) {
    if (!htmlContent) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const firstP = tempDiv.querySelector('p');
    if (!firstP) {
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const cleanText = text.trim().replace(/\s+/g, ' ');
        if (cleanText.length > maxLength) {
            return cleanText.substring(0, maxLength) + '...';
        }
        return cleanText;
    }
    
    let text = firstP.textContent || firstP.innerText || '';
    text = text.trim().replace(/\s+/g, ' ');
    
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }
    
    return text;
}

function getArticleDescription(post, maxLength = 100) {
    const attrs = getPostAttributes(post);
    
    if (attrs.excerpt && attrs.excerpt.trim() && attrs.excerpt !== attrs.title) {
        return attrs.excerpt.length > maxLength ? attrs.excerpt.substring(0, maxLength) + '...' : attrs.excerpt;
    }
    
    if (attrs.html) {
        const extracted = extractFirstParagraph(attrs.html, maxLength);
        if (extracted && extracted !== attrs.title) {
            return extracted;
        }
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
// 自動檢測網站結構類型（根據網站名稱和 CSS 類別）
// =========================================================
function detectSiteStructure(site, container) {
    const containerClass = container.className || '';
    
    // 根據網站名稱判斷結構類型
    if (site === 'site1') {
        // site1: widget 風格，圖片在左，文字在右，垂直列表
        return { type: 'widget', hasImage: true, layout: 'vertical', containerTag: 'ul' };
    }
    
    if (site === 'site2') {
        // site2: 網格卡片，圖片在上，文字在下，兩欄或三欄網格
        return { type: 'card-grid', hasImage: true, layout: 'grid', containerTag: 'ul' };
    }
    
    if (site === 'site3') {
        // site3: 網格卡片，圖片在上，文字在下
        return { type: 'grid-card', hasImage: true, layout: 'grid', containerTag: 'div' };
    }
    
    if (site === 'site4') {
        // site4: 純文字列表（但我們加上圖片），垂直列表
        return { type: 'text-list', hasImage: true, layout: 'vertical', containerTag: 'ul' };
    }
    
    if (site === 'site5') {
        // site5: feed 風格，圖片在左，文字在右
        return { type: 'feed', hasImage: true, layout: 'horizontal', containerTag: 'div' };
    }
    
    if (site === 'site9') {
        // site9: 卡片網格，圖片在上，文字在下（與首頁格式一致）
        return { type: 'card-grid', hasImage: true, layout: 'grid', containerTag: 'div' };
    }
    
    if (site === 'site10') {
        // site10: 雜誌列表
        return { type: 'magazine-list', hasImage: true, layout: 'vertical', containerTag: 'ul' };
    }
    
    if (site === 'site6' || site === 'site7' || site === 'site8') {
        // site6-8: 簡單列表，圖片在左，文字在右
        return { type: 'simple-list', hasImage: true, layout: 'horizontal', containerTag: 'ul' };
    }
    
    // 預設：根據容器類別判斷
    if (containerClass.includes('widget') || containerClass.includes('all-daily-articles-list')) {
        return { type: 'widget', hasImage: true, layout: 'vertical', containerTag: 'ul' };
    }
    
    if (containerClass.includes('grid') || containerClass.includes('daily-grid')) {
        return { type: 'grid-card', hasImage: true, layout: 'grid', containerTag: 'div' };
    }
    
    // 預設：簡單列表，圖片在左，文字在右
    return { type: 'simple-list', hasImage: true, layout: 'horizontal', containerTag: 'ul' };
}

// =========================================================
// 根據結構類型生成 HTML
// =========================================================
function generateArticleHTML(post, structure, site, index) {
    const attrs = getPostAttributes(post);
    const title = attrs.title || attrs.slug || '無標題';
    const slug = attrs.slug;
    const description = getArticleDescription(post, 150);
    
    // 日期處理
    let date = '';
    const dateSource = attrs.date || attrs.publishedAt || attrs.createdAt;
    if (dateSource) {
        const d = new Date(dateSource);
        if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
        }
    }
    
    // 圖片 URL（優先使用 Strapi 的 imageUrl）
    let imgUrl = attrs.imageUrl || '';
    if (!imgUrl) {
        // 根據索引循環使用圖片
        const imgIndex = (index % 3) + 1;
        imgUrl = `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-daily${imgIndex}.webp?raw=true`;
    }
    
    // 根據結構類型生成 HTML
    switch (structure.type) {
        case 'widget':
            // site1 風格：垂直列表，圖片在上，文字在下
            return `
                <li>
                    <a href="articles/${slug}.html">
                        <div class="widget-img">
                            <img src="${imgUrl}" alt="${title}" loading="lazy">
                        </div>
                        <div class="widget-text">
                            <h4>${title}</h4>
                            <p>${description}</p>
                            ${date ? `<span class="date">${date}</span>` : ''}
                        </div>
                    </a>
                </li>
            `;
        
        case 'card-grid':
            // site2, site9 風格：網格卡片，圖片在上，文字在下
            if (site === 'site9') {
                // site9 風格：卡片網格（與首頁格式一致）
                return `
                    <article class="daily-card">
                        <a href="articles/${slug}.html" class="daily-card-image">
                            <img src="${imgUrl}" alt="${title}" loading="lazy">
                        </a>
                        <div class="daily-card-content">
                            ${date ? `<div class="daily-date">${date}</div>` : ''}
                            <h3><a href="articles/${slug}.html" style="color: #ffffff;">${title}</a></h3>
                            ${description ? `<p>${description}</p>` : ''}
                        </div>
                    </article>
                `;
            } else {
                // site2 風格：網格卡片
                return `
                    <li>
                        <a href="articles/${slug}.html">
                            <img src="${imgUrl}" class="daily-card-img" alt="${title}" loading="lazy">
                            <div class="daily-card-content">
                                <h3>${title}</h3>
                                <p>${description}</p>
                                ${date ? `<span class="publish-date">${date}</span>` : ''}
                            </div>
                        </a>
                    </li>
                `;
            }
        
        case 'grid-card':
            // site3 風格：網格卡片
            return `
                <a href="articles/${slug}.html" class="daily-item">
                    <div class="item-image">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </div>
                    <div class="item-info">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        ${date ? `<span class="meta-date">${date}</span>` : ''}
                    </div>
                </a>
            `;
        
        case 'feed':
            // site5 風格：feed 風格，圖片在左，文字在右
            return `
                <a href="articles/${slug}.html" class="feed-item">
                    <div class="feed-icon">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </div>
                    <div class="feed-content">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        ${date ? `<span class="time-ago">${date}</span>` : ''}
                    </div>
                </a>
            `;
        
        case 'text-list':
            // site4 風格：列表，圖片在左，文字在右
            return `
                <li>
                    <a href="articles/${slug}.html" class="daily-link" style="display: flex; gap: 1.5rem; align-items: flex-start; padding: 1rem 0; border-bottom: 1px solid #e5e7eb;">
                        <div style="flex-shrink: 0; width: 200px; height: 150px; overflow: hidden; border-radius: 8px; background: #f3f4f6;">
                            <img src="${imgUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div class="daily-content" style="flex: 1;">
                            <h3 style="margin: 0 0 0.5rem 0; font-size: 1.2rem;">${title}</h3>
                            <p style="margin: 0 0 0.5rem 0; color: #666; line-height: 1.6;">${description}</p>
                            ${date ? `<span class="publish-date" style="font-size: 0.9rem; color: #999;">${date}</span>` : ''}
                        </div>
                    </a>
                </li>
            `;
        
        case 'magazine-list':
            // site10 風格：雜誌列表
            return `
                <li class="daily-magazine-item">
                    <div class="daily-item-header">
                        <a href="articles/${slug}.html" class="daily-item-title">${title}</a>
                        ${date ? `<span class="daily-item-date">${date}</span>` : ''}
                    </div>
                    ${description ? `<p class="daily-item-text">${description}</p>` : ''}
                </li>
            `;
        
        case 'card':
            // 通用卡片風格
            return `
                <article class="article-card">
                    <a href="articles/${slug}.html">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                        <h3>${title}</h3>
                        <p>${description}</p>
                        ${date ? `<span class="publish-date">${date}</span>` : ''}
                    </a>
                </article>
            `;
        
        default:
            // site6-8 風格：簡單列表，圖片在左，文字在右
            return `
                <li class="all-daily-item">
                    <div class="daily-article-link" style="display: flex; gap: 16px; align-items: flex-start; padding: 16px 0; border-top: 1px solid rgba(148, 163, 184, 0.35);">
                        <div style="flex-shrink: 0; width: 200px; height: 150px; overflow: hidden; border-radius: 8px; background: #f3f4f6;">
                            <img src="${imgUrl}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy">
                        </div>
                        <div style="flex: 1;">
                            <a href="articles/${slug}.html" style="color: #f9fafb; text-decoration: none; font-size: 17px; font-weight: 500; display: block; margin-bottom: 8px;">${title}</a>
                            ${date ? `<span class="publish-date" style="font-size: 12px; color: #9ca3af; display: block; margin-bottom: 8px;">${date}</span>` : ''}
                            ${description ? `<p class="daily-snippet" style="margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.6;">${description}</p>` : ''}
                        </div>
                    </div>
                </li>
            `;
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
        '.daily-article-list',
        '.article-list',
        'ul[class*="daily"]',
        'ul[class*="article"]',
        'div[class*="daily"]'
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
    
    // 檢測網站結構
    const structure = detectSiteStructure(site, container);
    console.log(`📋 [${site}] 檢測到結構類型:`, structure);
    
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
    
    // 按日期排序（最新的在前）
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
    
    // 清空容器
    container.innerHTML = '';
    
    // 根據結構類型決定容器標籤
    if (structure.containerTag === 'ul' && container.tagName !== 'UL') {
        // 如果應該是 <ul> 但容器是 <div>，需要轉換
        const ul = document.createElement('ul');
        ul.className = container.className;
        container.parentNode.replaceChild(ul, container);
        container = ul;
    } else if (structure.containerTag === 'div' && container.tagName !== 'DIV') {
        // 如果應該是 <div> 但容器是 <ul>，需要轉換
        const div = document.createElement('div');
        div.className = container.className;
        container.parentNode.replaceChild(div, container);
        container = div;
    }
    
    // 生成 HTML
    uniquePosts.forEach((post, index) => {
        const html = generateArticleHTML(post, structure, site, index);
        if (html) {
            container.insertAdjacentHTML('beforeend', html);
        }
    });
    
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
console.log('📋 all-daily-articles-cms.js 腳本已載入');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadAllDailyArticles();
        updateNavDailyLink(getSiteFromPath());
    });
} else {
    loadAllDailyArticles();
    updateNavDailyLink(getSiteFromPath());
}
