// =========================================================
// 通用 Strapi CMS 動態內容載入腳本
// 支援所有網站，自動適配 HTML 結構
// =========================================================
// 根據環境自動選擇 Strapi URL
function getStrapiUrl() {
    const hostname = window.location.hostname;
    
    console.log('🔍 檢測環境，hostname:', hostname);
    
    // 正式環境：只有完全匹配標準網址才使用正式環境
    if (hostname === 'multi-site-static-strapi-front.vercel.app') {
        console.log('✅ 使用正式環境 Strapi');
        return 'https://effortless-whisper-83765d99df.strapiapp.com'; // 正式環境
    }
    
    // 開發環境：所有其他情況（預覽網址、本地開發等）
    console.log('✅ 使用開發環境 Strapi');
    return 'https://growing-dawn-18cd7440ad.strapiapp.com'; // 開發環境
}

// 動態獲取 Strapi URL（不使用固定值，避免緩存問題）
// const STRAPI_URL = getStrapiUrl(); // 已移除，改為在函數中動態獲取
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

// =========================================================
// 工具函數：統一處理 Strapi 資料結構
// =========================================================
function getPostAttributes(item) {
    if (item.attributes) {
        return item.attributes;
    }
    const { id, documentId, ...attrs } = item;
    return attrs;
}

// =========================================================
// 工具函數：從 HTML 內容中提取第一段文本作為描述
// =========================================================
function extractFirstParagraph(htmlContent, maxLength = 25) {
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

// =========================================================
// 工具函數：獲取文章描述
// =========================================================
function getArticleDescription(post, maxLength = 25) {
    const attrs = getPostAttributes(post);
    
    // 優先使用 excerpt（內文描述）
    if (attrs.excerpt && attrs.excerpt.trim()) {
        // 檢查是否與標題相同
        const excerptText = attrs.excerpt.trim();
        if (excerptText !== attrs.title && excerptText.length > 0) {
            return excerptText.length > maxLength ? excerptText.substring(0, maxLength) + '...' : excerptText;
        }
    }
    
    // 如果沒有 excerpt，從 html 提取第一段
    if (attrs.html) {
        const extracted = extractFirstParagraph(attrs.html, maxLength);
        if (extracted && extracted !== attrs.title && extracted.trim().length > 0) {
            return extracted;
        }
    }
    
    // 如果都沒有，嘗試從 description 欄位提取
    if (attrs.description && attrs.description.trim() && attrs.description !== attrs.title) {
        return attrs.description.length > maxLength ? attrs.description.substring(0, maxLength) + '...' : attrs.description;
    }
    
    return '';
}

// =========================================================
// 工具函數：從 Strapi 抓取文章
// =========================================================
async function fetchPostsFromStrapi(site, category, options = {}) {
    try {
        const { daysLimit = null, featuredOnly = false, limit = 100 } = options;
        
        // 動態獲取 Strapi URL（確保使用正確的環境）
        const strapiUrl = getStrapiUrl();
        let url = `${strapiUrl}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=${category}`;
        
        // 每日精選預設只抓 isFeatured=true 的文章
        if (category === 'daily' && featuredOnly) {
            url += `&filters[isFeatured][$eq]=true`;
        }
        
        // 多重排序：優先使用 date 欄位
        url += `&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc&pagination[limit]=${limit}`;
        
        // 如果指定了天數限制
        if (daysLimit && daysLimit > 0) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - daysLimit);
            const dateLimitISO = dateLimit.toISOString();
            url += `&filters[publishedAt][$gte]=${dateLimitISO}`;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        console.log(`🔍 [${site}] 請求 ${category} 文章:`);
        console.log(`   URL: ${url}`);
        console.log(`   Headers:`, headers);
        
        const response = await fetch(url, { headers });
        
        console.log(`📥 [${site}] 收到回應: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ [${site}] Strapi API 錯誤 (${response.status}):`, errorText);
            console.error(`   完整 URL: ${url}`);
            return [];
        }
        
        const data = await response.json();
        console.log(`📊 [${site}] API 回應數據:`, data);
        
        if (data.data && Array.isArray(data.data)) {
            console.log(`✅ [${site}] 成功獲取 ${data.data.length} 篇 ${category} 文章`);
            if (data.data.length > 0) {
                console.log(`   第一篇文章:`, {
                    id: data.data[0].id,
                    slug: getPostAttributes(data.data[0]).slug,
                    title: getPostAttributes(data.data[0]).title
                });
            }
            return data.data;
        }
        
        console.warn(`⚠️ [${site}] 數據結構不符合預期:`, data);
        return [];
    } catch (error) {
        console.error(`❌ [${site}] 抓取 ${category} 文章失敗:`, error);
        console.error(`   錯誤類型:`, error.name);
        console.error(`   錯誤訊息:`, error.message);
        console.error(`   錯誤堆疊:`, error.stack);
        return [];
    }
}

// =========================================================
// 工具函數：自動檢測容器結構類型
// =========================================================
function detectContainerStructure(container) {
    if (!container) return null;
    
    const containerClass = container.className || '';
    const parent = container.parentElement;
    const parentClass = parent ? (parent.className || '') : '';
    
    // 檢測每日精選結構
    if (containerClass.includes('daily-article-list') || 
        containerClass.includes('widget-list') ||
        containerClass.includes('daily-list') ||
        containerClass.includes('daily-articles-list') ||
        containerClass.includes('daily-cards-grid') ||
        containerClass.includes('daily-magazine-list')) {
        
        // 檢查是否有圖片
        const hasImage = container.querySelector('img') !== null;
        const hasWidget = parentClass.includes('widget') || containerClass.includes('widget');
        
        // site1: widget 風格
        if (hasWidget) {
            return { type: 'daily', style: 'widget', hasImage: true };
        }
        
        // site7: .daily-list（側邊欄列表）
        if (containerClass.includes('daily-list') && parentClass.includes('daily-sidebar')) {
            return { type: 'daily', style: 'sidebar-list', hasImage: false };
        }
        
        // site8: .daily-articles-list（section 列表，有圖片）
        if (containerClass.includes('daily-articles-list')) {
            // site8 應該有圖片，檢查結構
            const hasImageInStructure = container.querySelector('img') !== null;
            return { type: 'daily', style: 'section-list', hasImage: hasImageInStructure || true };
        }
        
        // site9: .daily-cards-grid（卡片網格，有圖片）
        if (containerClass.includes('daily-cards-grid')) {
            return { type: 'daily', style: 'card-grid', hasImage: true };
        }
        
        // site10: .daily-magazine-list（雜誌列表）
        if (containerClass.includes('daily-magazine-list')) {
            return { type: 'daily', style: 'magazine-list', hasImage: false };
        }
        
        // site2: .daily-articles .daily-article-list（有圖片）
        if (parentClass.includes('daily-articles') && containerClass.includes('daily-article-list')) {
            // site2 一定有圖片
            return { type: 'daily', style: 'card', hasImage: true };
        }
        
        // site4: .daily-article-list（有圖片）
        if (containerClass.includes('daily-article-list') && parentClass.includes('daily-articles')) {
            return { type: 'daily', style: 'simple-list', hasImage: true };
        }
        
        // site6: .daily-articles .daily-article-list（無圖片）
        if (parentClass.includes('daily-section')) {
            return { type: 'daily', style: 'simple-list', hasImage: false };
        }
        
        // 檢查是否有卡片結構
        const firstItem = container.querySelector('li, a, article');
        if (firstItem) {
            const itemClass = firstItem.className || '';
            if (itemClass.includes('card') || itemClass.includes('feed')) {
                return { type: 'daily', style: 'card', hasImage: hasImage };
            }
            if (itemClass.includes('item') || itemClass.includes('daily-item')) {
                return { type: 'daily', style: 'item', hasImage: true };
            }
        }
        
        return { type: 'daily', style: 'simple-list', hasImage: false };
    }
    
    // 檢測固定文章結構
    if (containerClass.includes('fixed-articles') || containerClass.includes('fixed-cards-grid') || containerClass.includes('fixed-magazine-grid') || containerClass.includes('featured') || containerClass.includes('masonry') || containerClass.includes('card-grid')) {
        const hasGrid = containerClass.includes('grid') || containerClass.includes('masonry');
        const hasCard = containerClass.includes('card') || container.querySelector('.card, .post-entry, .article-row, .card-item, .fixed-article-card');
        
        // site9: .fixed-cards-grid（卡片網格）
        if (containerClass.includes('fixed-cards-grid')) {
            return { type: 'fixed', style: 'fixed-cards-grid', hasImage: true };
        }
        
        // site10: .fixed-magazine-grid（雜誌網格）
        if (containerClass.includes('fixed-magazine-grid')) {
            return { type: 'fixed', style: 'fixed-magazine-grid', hasImage: true };
        }
        
        // site7: .fixed-articles-zone
        if (containerClass.includes('fixed-articles-zone')) {
            return { type: 'fixed', style: 'fixed-zone', hasImage: true };
        }
        
        // site8: .fixed-articles-list
        if (containerClass.includes('fixed-articles-list')) {
            return { type: 'fixed', style: 'fixed-list', hasImage: true };
        }
        
        if (hasGrid) {
            return { type: 'fixed', style: 'grid', hasImage: true };
        }
        if (hasCard) {
            return { type: 'fixed', style: 'card', hasImage: true };
        }
        
        return { type: 'fixed', style: 'list', hasImage: true };
    }
    
    return null;
}

// =========================================================
// 工具函數：生成文章 HTML（根據結構類型）
// =========================================================
function generateArticleHTML(post, structure, site, index = 0) {
    const attrs = getPostAttributes(post);
    const title = attrs.title || attrs.slug || '無標題';
    const slug = attrs.slug;
    // 描述長度限制：25個字
    const descMaxLength = 25;
    const description = getArticleDescription(post, descMaxLength);
    
    // 日期處理
    let date = '';
    const dateSource = attrs.date || attrs.publishedAt || attrs.createdAt;
    if (dateSource) {
        const d = new Date(dateSource);
        if (!isNaN(d.getTime())) {
            date = d.toISOString().split('T')[0];
        }
    }
    
    // 圖片 URL
    let imgUrl = attrs.imageUrl || '';
    if (!imgUrl && structure.hasImage) {
        // 根據站點和索引生成預設圖片
        const imgIndex = (index % 3) + 1;
        const imgType = structure.type === 'daily' ? 'daily' : 'fixed';
        imgUrl = `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgType}${imgIndex}.webp?raw=true`;
    }
    
    // 根據結構類型生成 HTML
    if (structure.type === 'daily') {
        if (structure.style === 'widget') {
            // Widget 風格（site1）
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
        } else if (structure.style === 'card') {
            // 卡片風格（site2, site5）
            const cardClass = structure.hasImage ? 'daily-card' : 'feed-item';
            return `
                <li>
                    <a href="articles/${slug}.html">
                        ${structure.hasImage ? `<img src="${imgUrl}" class="daily-card-img" alt="${title}" loading="lazy">` : ''}
                        <div class="${structure.hasImage ? 'daily-card-content' : 'feed-content'}">
                            <h3>${title}</h3>
                            <p>${description}</p>
                            ${date ? `<span class="publish-date">${date}</span>` : ''}
                        </div>
                    </a>
                </li>
            `;
        } else if (structure.style === 'item') {
            // Item 風格（site3）
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
        } else if (structure.style === 'sidebar-list') {
            // site7 風格：側邊欄列表
            return `
                <li class="daily-item">
                    <div class="daily-item-header">
                        <a href="articles/${slug}.html" class="daily-item-title">${title}</a>
                        ${date ? `<span class="daily-item-date">${date}</span>` : ''}
                    </div>
                    ${description ? `<p class="daily-item-excerpt">${description}</p>` : ''}
                </li>
            `;
        } else if (structure.style === 'section-list') {
            // site8 風格：section 列表（有圖片）
            return `
                <li class="daily-list-item">
                    ${structure.hasImage ? `
                    <a href="articles/${slug}.html" class="daily-item-image">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    ` : ''}
                    <div class="daily-item-top">
                        <a href="articles/${slug}.html" class="daily-item-title">${title}</a>
                        ${date ? `<span class="daily-item-date">${date}</span>` : ''}
                    </div>
                    ${description ? `<p class="daily-item-text">${description}</p>` : ''}
                </li>
            `;
        } else if (structure.style === 'card-grid') {
            // site9 風格：卡片網格（有圖片）
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
        } else if (structure.style === 'magazine-list') {
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
        } else {
            // 簡單列表風格（site4, site6）
            if (structure.hasImage) {
                // site4 風格：有圖片，圖片在左，文字在右
                return `
                    <li class="daily-article-item">
                        <div class="daily-article-link">
                            <img src="${imgUrl}" alt="${title}" loading="lazy">
                            <div class="daily-content">
                                <h3><a href="articles/${slug}.html">${title}</a></h3>
                                ${description ? `<p class="daily-snippet">${description}</p>` : ''}
                                ${date ? `<span class="publish-date">${date}</span>` : ''}
                            </div>
                        </div>
                    </li>
                `;
            } else {
                // site6 風格：無圖片
                return `
                    <li class="daily-article-item">
                        <div class="daily-article-link">
                            <a href="articles/${slug}.html">${title}</a>
                            ${date ? `<span class="publish-date">${date}</span>` : ''}
                        </div>
                        ${description ? `<p class="daily-snippet">${description}</p>` : ''}
                    </li>
                `;
            }
        }
    } else if (structure.type === 'fixed') {
        // 固定文章結構
        if (structure.style === 'fixed-cards-grid') {
            // site9 風格：固定卡片網格
            return `
                <article class="card-item">
                    <a href="articles/${slug}.html" class="card-image">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    <div class="card-body">
                        <h3><a href="articles/${slug}.html">${title}</a></h3>
                        <a href="articles/${slug}.html">
                            <p>${description}</p>
                        </a>
                    </div>
                </article>
            `;
        } else if (structure.style === 'fixed-magazine-grid') {
            // site10 風格：雜誌網格
            return `
                <article class="magazine-card">
                    <a href="articles/${slug}.html" class="magazine-image">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    <div class="magazine-content">
                        <h3><a href="articles/${slug}.html">${title}</a></h3>
                        <a href="articles/${slug}.html">
                            <p>${description}</p>
                        </a>
                    </div>
                </article>
            `;
        } else if (structure.style === 'fixed-list') {
            // site8 風格：固定文章列表
            return `
                <article class="fixed-article-item">
                    <a href="articles/${slug}.html" class="fixed-article-image">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    <div class="fixed-article-content">
                        <h3><a href="articles/${slug}.html">${title}</a></h3>
                        <a href="articles/${slug}.html">
                            <p>${description}</p>
                        </a>
                    </div>
                </article>
            `;
        } else if (structure.style === 'fixed-zone') {
            // site7 風格：固定文章區域
            return `
                <article class="fixed-article-card">
                    <a href="articles/${slug}.html" class="fixed-article-media">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    <div class="fixed-article-body">
                        <h3><a href="articles/${slug}.html">${title}</a></h3>
                        <a href="articles/${slug}.html">
                            <p>${description}</p>
                        </a>
                    </div>
                </article>
            `;
        } else if (structure.style === 'grid' || structure.style === 'card') {
            // site6 風格：固定文章網格
            return `
                <article class="fixed-article-card">
                    <a href="articles/${slug}.html" class="fixed-article-media">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                    </a>
                    <div class="fixed-article-body">
                        <h3><a href="articles/${slug}.html">${title}</a></h3>
                        <a href="articles/${slug}.html">
                            <p>${description}</p>
                        </a>
                    </div>
                </article>
            `;
        } else {
            return `
                <div class="post-entry">
                    <a href="articles/${slug}.html">
                        <img src="${imgUrl}" alt="${title}" loading="lazy">
                        <h3>${title}</h3>
                        <p>${description}</p>
                    </a>
                </div>
            `;
        }
    }
    
    return '';
}

// =========================================================
// 載入「每日精選」文章
// =========================================================
async function loadDailyForSite(site) {
    console.log(`🔍 [${site}] 開始尋找每日精選容器...`);
    
    // 自動尋找每日精選容器
    const selectors = [
        '.daily-article-list',        // site2, site4, site6
        '.daily-widget .widget-list', // site1
        '.daily-picks .daily-grid',   // site3
        '.feed-section .feed-list',   // site5
        '.daily-list',                // site7
        '.daily-articles-list',       // site8
        '.daily-cards-grid',          // site9
        '.daily-magazine-list',       // site10
        '[class*="daily"] ul',
        '[class*="daily"] ol',
        '[class*="daily"] div'
    ];
    
    let dailyContainer = null;
    for (const selector of selectors) {
        dailyContainer = document.querySelector(selector);
        if (dailyContainer) {
            console.log(`✅ [${site}] 找到每日精選容器: ${selector}`);
            console.log(`   容器內容:`, dailyContainer.innerHTML.substring(0, 100));
            break;
        }
    }
    
    if (!dailyContainer) {
        console.error(`❌ [${site}] 找不到每日精選容器`);
        console.error(`   嘗試的選擇器:`, selectors);
        console.error(`   當前頁面所有元素數量:`, document.querySelectorAll('*').length);
        console.error(`   包含 'daily' 的元素:`, Array.from(document.querySelectorAll('[class*="daily"]')).map(el => el.className));
        return;
    }
    
    // 檢測容器結構
    const structure = detectContainerStructure(dailyContainer);
    if (!structure) {
        console.warn(`⚠️ [${site}] 無法識別容器結構`);
        return;
    }
    
    console.log(`📋 [${site}] 檢測到結構類型:`, structure);
    
    // 獲取文章（最近 7 天，只取 isFeatured=true）
    // site8 暫時不限制 featuredOnly，因為可能沒有設定
    const featuredOnly = site !== 'site8';
    const posts = await fetchPostsFromStrapi(site, 'daily', { daysLimit: 7, featuredOnly: featuredOnly, limit: 10 });
    
    if (posts.length === 0) {
        console.log(`⚠️ [${site}] 沒有找到每日精選文章`);
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
    
    // 只顯示前 3 篇
    const postsToDisplay = uniquePosts.slice(0, 3);
    
    // 清空容器並生成 HTML
    dailyContainer.innerHTML = '';
    
    postsToDisplay.forEach((post, index) => {
        const html = generateArticleHTML(post, structure, site, index);
        if (html) {
            if (structure.style === 'item') {
                // site3 風格，直接添加 <a> 元素
                dailyContainer.insertAdjacentHTML('beforeend', html);
            } else {
                // 其他風格，添加 <li> 元素
                dailyContainer.insertAdjacentHTML('beforeend', html);
            }
        }
    });
    
    console.log(`✅ [${site}] 已更新每日精選，顯示 ${postsToDisplay.length} 篇文章`);
}

// =========================================================
// 載入「固定文章」
// =========================================================
async function loadFixedForSite(site) {
    // 自動尋找固定文章容器
    const selectors = [
        '.fixed-cards-grid',           // site9
        '.fixed-articles-grid',        // site6
        '.fixed-articles-zone',        // site7
        '.fixed-articles-list',        // site8
        '.fixed-magazine-grid',        // site10
        '.fixed-articles',
        '.featured-posts',
        '.featured-works .masonry-grid',
        '.grid-section .card-grid',
        '[class*="fixed"] [class*="grid"]',
        '[class*="featured"] [class*="grid"]'
    ];
    
    let fixedContainer = null;
    for (const selector of selectors) {
        fixedContainer = document.querySelector(selector);
        if (fixedContainer) {
            console.log(`✅ [${site}] 找到固定文章容器: ${selector}`);
            break;
        }
    }
    
    if (!fixedContainer) {
        console.warn(`⚠️ [${site}] 找不到固定文章容器`);
        return;
    }
    
    // 檢測容器結構
    const structure = detectContainerStructure(fixedContainer);
    if (!structure) {
        console.warn(`⚠️ [${site}] 無法識別固定文章容器結構`);
        return;
    }
    
    console.log(`📋 [${site}] 檢測到固定文章結構類型:`, structure);
    
    // 獲取固定文章
    const posts = await fetchPostsFromStrapi(site, 'fixed', { limit: 10 });
    
    if (posts.length === 0) {
        console.log(`⚠️ [${site}] 沒有找到固定文章`);
        return;
    }
    
    // 查找現有的文章元素
    const existingItems = fixedContainer.querySelectorAll('article, .post-entry, .article-row, .masonry-item, .feature-card, .fixed-article-card');
    
    if (existingItems.length === 0) {
        // 如果沒有現有元素，直接生成
        fixedContainer.innerHTML = '';
        posts.slice(0, 3).forEach((post, index) => {
            const html = generateArticleHTML(post, structure, site, index);
            if (html) {
                fixedContainer.insertAdjacentHTML('beforeend', html);
            }
        });
    } else {
        // 更新現有元素
        existingItems.forEach((entry, index) => {
            if (index >= posts.length) {
                entry.style.display = 'none';
                return;
            }
            
            const post = posts[index];
            const p = getPostAttributes(post);
            
            // 更新連結
            const link = entry.querySelector('a') || entry;
            if (link) {
                link.href = `articles/${p.slug}.html`;
                
                // 更新圖片
                const img = link.querySelector('img');
                if (img) {
                    img.src = p.imageUrl || img.src;
                    img.alt = p.title || '';
                }
                
                // 更新標題
                const h3 = link.querySelector('h3');
                if (h3) {
                    const h3Link = h3.querySelector('a');
                    if (h3Link) {
                        h3Link.textContent = p.title || '無標題';
                        h3Link.href = `articles/${p.slug}.html`;
                    } else {
                        h3.textContent = p.title || '無標題';
                    }
                }
                
                // 更新描述
                const pTag = link.querySelector('p');
                if (pTag) {
                    pTag.textContent = getArticleDescription(post, 25);
                }
            }
        });
    }
    
    console.log(`✅ [${site}] 已更新固定文章`);
}

// =========================================================
// 更新導覽列中的「每日精選文章」連結
// =========================================================
async function updateNavDailyLink(site) {
    try {
        const posts = await fetchPostsFromStrapi(site, 'daily', { featuredOnly: true, limit: 1 });
        
        if (posts.length === 0) {
            console.warn(`⚠️ [${site}] 沒有找到每日精選文章，跳過更新導覽列`);
            return;
        }
        
        const post = posts[0];
        const attrs = getPostAttributes(post);
        const latestSlug = attrs.slug;
        
        if (!latestSlug) {
            return;
        }
        
        // 查找所有導覽列連結
        const navLinks = document.querySelectorAll('nav a, .nav-menu a, .nav-links a, header a, .header a');
        let updatedCount = 0;
        
        navLinks.forEach(link => {
            const linkText = link.textContent.trim();
            if (linkText === '每日精選文章' || linkText.includes('每日精選') || linkText.includes('每日')) {
                const currentHref = link.getAttribute('href');
                if (!currentHref) return;
                
                let newHref;
                if (currentHref.includes('articles/')) {
                    newHref = currentHref.replace(/articles\/[^/]+\.html/, `articles/${latestSlug}.html`);
                } else if (/[^/]+\.html$/.test(currentHref)) {
                    const pathPrefix = currentHref.replace(/[^/]+\.html$/, '');
                    newHref = pathPrefix + `${latestSlug}.html`;
                } else {
                    const isInArticlesDir = window.location.pathname.includes('/articles/');
                    newHref = isInArticlesDir ? `${latestSlug}.html` : `articles/${latestSlug}.html`;
                }
                
                if (currentHref !== newHref) {
                    link.setAttribute('href', newHref);
                    updatedCount++;
                }
            }
        });
        
        if (updatedCount > 0) {
            console.log(`✅ [${site}] 已更新 ${updatedCount} 個導覽列連結`);
        }
    } catch (error) {
        console.error(`❌ [${site}] 更新導覽列連結失敗:`, error);
    }
}

// =========================================================
// 主程序：自動執行
// =========================================================

// 立即執行，不等待 DOMContentLoaded（確保腳本已載入）
console.log('📋 home-cms.js 腳本已載入');
// 顯示當前環境資訊
const currentStrapiUrl = getStrapiUrl();
console.log('🔍 檢測環境，hostname:', window.location.hostname);
console.log('📍 STRAPI_URL (動態):', currentStrapiUrl);
console.log('📍 當前 URL:', window.location.href);
console.log('📍 當前路徑:', window.location.pathname);
console.log('✅ 所有 API 請求將使用動態 Strapi URL:', currentStrapiUrl);

function initCMS() {
    // 從 script 標籤的 data-site 屬性獲取網站名稱
    const scriptTag = document.querySelector('script[data-site]');
    let site = null;
    
    if (scriptTag) {
        site = scriptTag.getAttribute('data-site');
        console.log('✅ 從 data-site 屬性獲取網站名稱:', site);
    } else {
        // 嘗試從 URL 路徑提取
        const path = window.location.pathname;
        console.log('🔍 嘗試從 URL 路徑提取網站名稱:', path);
        const match = path.match(/\/(site\d+)\//);
        if (match) {
            site = match[1];
            console.log('✅ 從 URL 路徑提取到網站名稱:', site);
        } else {
            // 嘗試其他路徑格式
            const pathParts = path.split('/').filter(p => p);
            for (const part of pathParts) {
                if (/^site\d+$/.test(part)) {
                    site = part;
                    console.log('✅ 從路徑部分提取到網站名稱:', site);
                    break;
                }
            }
        }
    }
    
    if (!site) {
        console.error('❌ 無法識別網站名稱');
        console.error('   當前路徑:', window.location.pathname);
        console.error('   所有 script 標籤:', Array.from(document.querySelectorAll('script')).map(s => ({
            src: s.src,
            'data-site': s.getAttribute('data-site')
        })));
        return;
    }
    
    console.log(`🚀 [${site}] 開始載入 Strapi 內容...`);
    const strapiUrl = getStrapiUrl();
    console.log(`   目標 Strapi URL: ${strapiUrl}`);
    
    // 同時載入每日精選和固定文章
    Promise.all([
        loadDailyForSite(site),
        loadFixedForSite(site)
    ]).then(() => {
        console.log(`✅ [${site}] Strapi 內容載入完成！`);
        updateNavDailyLink(site);
    }).catch((error) => {
        console.error(`❌ [${site}] Strapi 內容載入失敗:`, error);
        console.error('   錯誤詳情:', error.stack);
    });
}

// 如果 DOM 已經載入完成，立即執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCMS);
    console.log('⏳ 等待 DOMContentLoaded 事件...');
} else {
    // DOM 已經載入完成，立即執行
    console.log('✅ DOM 已載入，立即執行');
    initCMS();
}
