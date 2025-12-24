/**
 * Contentful 整合腳本 - 數位生活館 (dlh011)
 * 這個文件用於從Contentful載入內容並顯示在網站上
 */

// 確保Contentful加載器已載入
if (typeof ContentfulLoader === 'undefined') {
    console.error('ContentfulLoader未載入，請確保已引入contentful-loader.js');
}

// 初始化Contentful加載器
const loader = new ContentfulLoader(CONTENTFUL_CONFIG);

// 當前網站代碼
const SITE_CODE = 'dlh011';

// ============================================
// 每日文章相關函數
// ============================================

/**
 * 載入並顯示每日文章列表（首頁用）
 */
async function loadDailyArticles() {
    try {
        const container = document.getElementById('ai-auto-update-area');
        
        if (!container) {
            console.warn('找不到每日文章容器');
            return;
        }
        
        // 顯示載入中（包含API连接状态）
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="color: #007bff; margin-bottom: 10px;">🔄 正在連接 Contentful API...</div>
                <div style="color: #666; font-size: 14px;">載入每日文章中...</div>
            </div>
        `;
        container.innerHTML = '';
        container.appendChild(loadingDiv);
        
        // 從Contentful獲取文章（按日期倒序，最新的在前）
        // 简化模式：使用POST模型，通过category='daily'区分
        console.log('📡 正在從Contentful獲取每日文章...', { siteCode: SITE_CODE });
        // 注意：Contentful API查询可能不会完全过滤，所以我们在客户端再次过滤
        const result = await loader.getEntries('post', {
            'fields.category': 'daily', // 通过category区分每日文章
            order: '-fields.date',
            limit: 100 // 获取更多以便客户端过滤
        });
        
        // 客户端二次过滤：确保只显示当前网站的文章（防止API查询问题）
        // 参考Strapi：统一使用site字段
        const siteFilteredItems = result.items.filter(item => {
            const itemData = item.fields || {};
            // 尝试多种字段名格式（优先使用简单的site）
            let itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
            // 处理本地化字段
            const siteCodeValue = typeof itemSiteCode === 'object' && itemSiteCode !== null && 'en-US' in itemSiteCode
                ? itemSiteCode['en-US']
                : itemSiteCode;
            
            // 同时检查category字段，确保是daily类型
            let itemCategory = itemData.category || '';
            if (typeof itemCategory === 'object' && itemCategory !== null && 'en-US' in itemCategory) {
                itemCategory = itemCategory['en-US'];
            }
            
            return siteCodeValue === SITE_CODE && itemCategory === 'daily';
        });
        
        // 去重：根据articleSlug或title去重
        const uniqueArticles = [];
        const seenSlugs = new Set();
        const seenTitles = new Set();
        
        for (const article of siteFilteredItems) {
            const articleData = article.fields;
            // 参考Strapi：统一使用slug字段
            let slug = articleData.slug || articleData.articleSlug || articleData.article_slug || '';
            if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
                slug = slug['en-US'];
            }
            
            let title = articleData.title || '';
            if (typeof title === 'object' && title !== null && 'en-US' in title) {
                title = title['en-US'];
            }
            
            // 如果slug或title已存在，跳过（但允许没有slug/title的文章通过）
            if (slug && seenSlugs.has(slug)) continue;
            if (title && seenTitles.has(title)) continue;
            
            // 记录已见过的slug和title
            if (slug) seenSlugs.add(slug);
            if (title) seenTitles.add(title);
            
            // 添加到列表（即使没有slug或title也添加）
            uniqueArticles.push(article);
            
            // 只取前3篇
            if (uniqueArticles.length >= 3) break;
        }
        
        console.log('✅ 成功獲取文章:', uniqueArticles.length, '篇（已去重，原始:', result.items.length, '篇，过滤后:', siteFilteredItems.length, '篇）');
        
        if (uniqueArticles.length === 0) {
            console.log('⚠️ 沒有從Contentful獲取到文章，保留原始HTML');
            // 保留原始HTML内容（不做任何修改）
            return;
        }
        
        // 只在有数据时才替换内容
        renderDailyArticles(container, uniqueArticles);
        
    } catch (error) {
        console.error('❌ 載入每日文章失敗:', error);
        console.log('⚠️ Contentful載入失敗，保留原始HTML內容');
        // 出错时保留原始HTML内容（不做任何修改）
    }
}

/**
 * 渲染每日文章列表
 */
function renderDailyArticles(container, articles) {
    container.innerHTML = '';
    
    // 創建section-header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = '<h2>每日精選文章</h2>';
    container.appendChild(sectionHeader);
    
    // 創建daily-staggered容器
    const staggeredDiv = document.createElement('div');
    staggeredDiv.className = 'daily-staggered';
    
    articles.forEach((article, index) => {
        const articleData = article.fields;
        
        // 安全地获取图片URL（参考Strapi：统一使用imageUrl字段）
        let imageUrl = '';
        let imageField = articleData.imageUrl || articleData.coverImage || articleData.image_url || '';
        
        // 处理本地化字段
        if (typeof imageField === 'object' && imageField !== null && 'en-US' in imageField) {
            imageField = imageField['en-US'];
        }
        
        if (imageField) {
            if (typeof imageField === 'string') {
                // 如果是URL字符串，直接使用
                imageUrl = imageField;
            } else if (imageField.url) {
                // 如果是对象（Media类型），使用getImageUrl处理
                imageUrl = loader.getImageUrl(imageField, {
                    width: 800,
                    quality: 80,
                    format: 'webp'
                });
            } else {
                imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
            }
        } else {
            // 使用占位符图片或默认图片
            imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
        }
        
        // 支持下划线字段名（参考Strapi的简单模式）
        // 优先使用date字段（新模型）
        let publishDate = articleData.date || articleData.publishDate || articleData.publish_date || '';
        if (typeof publishDate === 'object' && publishDate !== null && 'en-US' in publishDate) {
            publishDate = publishDate['en-US'];
        }
        publishDate = loader.formatDate(publishDate || new Date().toISOString());
        
        // 获取slug（支持下划线字段名）
        // 优先使用slug字段（新模型）
        let slug = articleData.slug || articleData.articleSlug || articleData.article_slug || '';
        if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
            slug = slug['en-US'];
        }
        // 如果没有slug，使用日期格式
        if (!slug) {
            slug = publishDate.replace(/-/g, '');
        }
        // 使用原始HTML文件名（如 2025-12-08.html）
        const articleUrl = `articles/${slug}.html`;
        
        // 創建文章元素
        const articleElement = document.createElement('article');
        articleElement.className = index === 0 ? 'daily-featured' : 'compact-item';
        
        // 安全地获取标题和摘要（处理本地化字段）
        let title = articleData.title || '';
        if (typeof title === 'object' && title !== null && 'en-US' in title) {
            title = title['en-US'];
        }
        title = title || '無標題';
        
        let excerpt = articleData.excerpt || '';
        if (typeof excerpt === 'object' && excerpt !== null && 'en-US' in excerpt) {
            excerpt = excerpt['en-US'];
        }
        excerpt = excerpt || '無摘要';
        
        if (index === 0) {
            // 第一篇：大卡片
            articleElement.innerHTML = `
                <a href="${articleUrl}">
                    <div class="featured-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
                        <span class="date-badge">${publishDate}</span>
                    </div>
                    <div class="featured-text">
                        <h3>${title}</h3>
                        <p>${excerpt}</p>
                    </div>
                </a>
            `;
            staggeredDiv.appendChild(articleElement);
        } else {
            // 其他文章：小卡片
            if (!staggeredDiv.querySelector('.daily-compact')) {
                const compactDiv = document.createElement('div');
                compactDiv.className = 'daily-compact';
                staggeredDiv.appendChild(compactDiv);
            }
            
            const compactDiv = staggeredDiv.querySelector('.daily-compact');
            articleElement.innerHTML = `
                <a href="${articleUrl}">
                    <div class="compact-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                        <span class="date-badge">${publishDate}</span>
                    </div>
                    <div class="compact-text">
                        <h3>${title}</h3>
                        <p>${excerpt}</p>
                    </div>
                </a>
            `;
            compactDiv.appendChild(articleElement);
        }
    });
    
    container.appendChild(staggeredDiv);
    
    // 添加「查看所有文章」連結
    const viewAllDiv = document.createElement('div');
    viewAllDiv.className = 'view-all';
    viewAllDiv.innerHTML = '<a href="all-daily-articles.html">查看所有文章</a>';
    container.appendChild(viewAllDiv);
}

/**
 * 載入單篇每日文章
 */
async function loadDailyArticle(slug) {
    try {
        // 简化模式：使用POST模型，通过category='daily'区分
        const result = await loader.getEntries('post', {
            'fields.site': SITE_CODE,
            'fields.category': 'daily',
            'fields.slug': slug,
            limit: 1
        });
        
        if (result.items.length === 0) {
            console.warn('找不到文章:', slug);
            return null;
        }
        
        return result.items[0];
        
    } catch (error) {
        console.error('載入文章失敗:', error);
        return null;
    }
}

// ============================================
// 固定文章相關函數
// ============================================

/**
 * 載入並顯示固定文章列表（首頁用）
 */
async function loadFixedArticles() {
    try {
        const container = document.getElementById('manual-content-area');
        
        if (!container) {
            console.warn('找不到固定文章容器');
            return;
        }
        
        // 顯示載入中（包含API连接状态）
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="color: #007bff; margin-bottom: 10px;">🔄 正在連接 Contentful API...</div>
                <div style="color: #666; font-size: 14px;">載入固定文章中...</div>
            </div>
        `;
        container.innerHTML = '';
        container.appendChild(loadingDiv);
        
        // 從Contentful獲取文章
        // 简化模式：使用POST模型，通过category='fixed'区分
        console.log('📡 正在從Contentful獲取固定文章...', { siteCode: SITE_CODE });
        const result = await loader.getEntries('post', {
            'fields.site': SITE_CODE,
            'fields.category': 'fixed', // 通过category区分固定文章
            order: 'fields.order'
        });
        
        // 客户端二次过滤：确保只显示当前网站的文章（参考Strapi：统一使用site字段）
        const filteredItems = result.items.filter(item => {
            const itemData = item.fields || {};
            // 尝试多种字段名格式（优先使用简单的site）
            let itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
            // 处理本地化字段
            const siteCodeValue = typeof itemSiteCode === 'object' && itemSiteCode !== null && 'en-US' in itemSiteCode
                ? itemSiteCode['en-US']
                : itemSiteCode;
            
            // 同时检查category字段，确保是fixed类型
            let itemCategory = itemData.category || '';
            if (typeof itemCategory === 'object' && itemCategory !== null && 'en-US' in itemCategory) {
                itemCategory = itemCategory['en-US'];
            }
            
            return siteCodeValue === SITE_CODE && itemCategory === 'fixed';
        });
        
        console.log('✅ 成功獲取固定文章:', filteredItems.length, '篇（过滤后，原始:', result.items.length, '篇）');
        
        if (filteredItems.length === 0) {
            console.log('⚠️ 沒有從Contentful獲取到固定文章，保留原始HTML');
            // 保留原始HTML内容（不做任何修改）
            return;
        }
        
        // 只在有数据时才替换内容
        renderFixedArticles(container, filteredItems);
        
    } catch (error) {
        console.error('❌ 載入固定文章失敗:', error);
        console.log('⚠️ Contentful載入失敗，保留原始HTML內容');
        // 出错时保留原始HTML内容（不做任何修改）
    }
}

/**
 * 渲染固定文章列表
 */
function renderFixedArticles(container, articles) {
    container.innerHTML = '';
    
    // 創建section-header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = '<h2>選購指南</h2>';
    container.appendChild(sectionHeader);
    
    // 創建magazine-layout容器
    const layoutDiv = document.createElement('div');
    layoutDiv.className = 'magazine-layout';
    
    articles.forEach((article, index) => {
        const articleData = article.fields;
        
        // 安全地获取图片URL（参考Strapi：统一使用imageUrl字段）
        let imageUrl = '';
        let imageField = articleData.imageUrl || articleData.coverImage || articleData.image_url || '';
        
        // 处理本地化字段
        if (typeof imageField === 'object' && imageField !== null && 'en-US' in imageField) {
            imageField = imageField['en-US'];
        }
        
        if (imageField) {
            if (typeof imageField === 'string') {
                // 如果是URL字符串，直接使用
                imageUrl = imageField;
            } else if (imageField.url) {
                // 如果是对象（Media类型），使用getImageUrl处理
                imageUrl = loader.getImageUrl(imageField, {
                    width: 800,
                    quality: 80
                });
            } else {
                imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
            }
        } else {
            imageUrl = 'https://via.placeholder.com/800x600?text=No+Image';
        }
        
        // 获取slug（参考Strapi：统一使用type或slug字段）
        let slug = articleData.type || articleData.articleType || articleData.article_type || articleData.slug || '';
        if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
            slug = slug['en-US'];
        }
        if (!slug) {
            slug = 'article';
        }
        // 使用原始HTML文件名（如 phone-guide.html）
        const articleUrl = `fixed-articles/${slug}.html`;
        
        // 創建文章元素
        const articleElement = document.createElement('article');
        
        // 安全地获取标题和摘要（处理本地化字段）
        let title = articleData.title || '';
        if (typeof title === 'object' && title !== null && 'en-US' in title) {
            title = title['en-US'];
        }
        title = title || '無標題';
        
        let excerpt = articleData.excerpt || '';
        if (typeof excerpt === 'object' && excerpt !== null && 'en-US' in excerpt) {
            excerpt = excerpt['en-US'];
        }
        excerpt = excerpt || '無摘要';
        
        if (index === 0) {
            // 第一篇：大卡片
            articleElement.className = 'magazine-large';
            articleElement.innerHTML = `
                <a href="${articleUrl}">
                    <div class="magazine-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/800x600?text=No+Image'">
                    </div>
                    <div class="magazine-content">
                        <h3>${title}</h3>
                        <p>${excerpt}</p>
                    </div>
                </a>
            `;
            layoutDiv.appendChild(articleElement);
        } else {
            // 其他文章：小卡片組
            if (!layoutDiv.querySelector('.magazine-small-group')) {
                const smallGroupDiv = document.createElement('div');
                smallGroupDiv.className = 'magazine-small-group';
                layoutDiv.appendChild(smallGroupDiv);
            }
            
            const smallGroupDiv = layoutDiv.querySelector('.magazine-small-group');
            articleElement.className = 'magazine-small';
            articleElement.innerHTML = `
                <a href="${articleUrl}">
                    <div class="magazine-image">
                        <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                    </div>
                    <div class="magazine-content">
                        <h3>${title}</h3>
                        <p>${excerpt}</p>
                    </div>
                </a>
            `;
            smallGroupDiv.appendChild(articleElement);
        }
    });
    
    container.appendChild(layoutDiv);
}

/**
 * 載入單篇固定文章
 */
async function loadFixedArticle(articleType) {
    try {
        // 简化模式：使用POST模型，通过category='fixed'和slug区分
        const result = await loader.getEntries('post', {
            'fields.site': SITE_CODE,
            'fields.category': 'fixed',
            'fields.slug': articleType, // 使用slug字段而不是type
            limit: 1
        });
        
        if (result.items.length === 0) {
            console.warn('找不到文章:', articleType);
            return null;
        }
        
        return result.items[0];
        
    } catch (error) {
        console.error('載入文章失敗:', error);
        return null;
    }
}

// ============================================
// 頁面內容相關函數
// ============================================

/**
 * 載入頁面內容
 */
async function loadPageContent(pageType) {
    try {
        // 使用PAGE模型
        const result = await loader.getEntries('page', {
            'fields.site': SITE_CODE,
            'fields.type': pageType, // 使用type而不是pageType
            limit: 1
        });
        
        if (result.items.length === 0) {
            console.warn('找不到頁面內容:', pageType);
            return null;
        }
        
        return result.items[0].fields;
        
    } catch (error) {
        console.error('載入頁面內容失敗:', error);
        return null;
    }
}

/**
 * 載入並渲染頁面內容（PAGE模型）
 */
async function loadPageContentAndRender(pageType) {
    try {
        const container = document.querySelector('.article-page, main section, main');
        if (!container) {
            console.warn('找不到頁面內容容器');
            return;
        }
        
        console.log('📡 正在從Contentful獲取頁面內容...', { pageType, siteCode: SITE_CODE });
        const pageData = await loadPageContent(pageType);
        
        if (!pageData) {
            console.warn('未找到頁面內容，保留原始HTML內容');
            return;
        }
        
        // 获取页面内容
        let title = pageData.title || '';
        if (typeof title === 'object' && title !== null && 'en-US' in title) {
            title = title['en-US'];
        }
        
        let html = pageData.html || '';
        if (typeof html === 'object' && html !== null && 'en-US' in html) {
            html = html['en-US'];
        }
        
        let imageUrl = pageData.imageUrl || '';
        if (typeof imageUrl === 'object' && imageUrl !== null && 'en-US' in imageUrl) {
            imageUrl = imageUrl['en-US'];
        }
        
        // 获取Entry ID用于构建Contentful编辑链接
        const result = await loader.getEntries('page', {
            'fields.site': SITE_CODE,
            'fields.type': pageType,
            limit: 1
        });
        const entryId = result.items[0]?.sys?.id || '';
        const spaceId = CONTENTFUL_CONFIG.spaceId || 'ubxfz0m4n46z';
        const environment = CONTENTFUL_CONFIG.environment || 'master';
        // 构建页面HTML（不包含编辑按钮）
        let pageHtml = '';
        if (title) {
            pageHtml += `<h1>${title}</h1>`;
        }
        if (imageUrl) {
            pageHtml += `<img src="${imageUrl}" alt="${title}" loading="lazy" style="width: 100%; max-width: 1200px; height: auto; border-radius: 8px; margin: 20px 0;">`;
        }
        if (html) {
            pageHtml += `<div class="page-body" style="margin-top: 30px; line-height: 1.8;">${html}</div>`;
        }
        
        // 替换容器内容
        if (pageHtml) {
            container.innerHTML = pageHtml;
            console.log('✅ 已載入並渲染頁面內容:', pageType);
        }
        
    } catch (error) {
        console.error('載入頁面內容失敗:', error);
    }
}

/**
 * 載入所有每日文章列表（用於all-daily-articles頁面）
 */
async function loadAllDailyArticles() {
    try {
        const container = document.querySelector('.daily-grid, .article-page');
        
        if (!container) {
            console.warn('找不到文章列表容器');
            return;
        }
        
        // 從Contentful獲取所有文章（按日期倒序，最新的在前）
        // 简化模式：使用POST模型，通过category='daily'区分
        const result = await loader.getEntries('post', {
            'fields.site': SITE_CODE,
            'fields.category': 'daily', // 只获取每日文章
            order: '-fields.date',
            limit: 100
        });
        
        // 客户端二次过滤：确保只显示当前网站的文章（防止API查询问题）
        const siteFilteredItems = result.items.filter(item => {
            const itemData = item.fields || {};
            // 尝试多种字段名格式（优先使用简单的site）
            const itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
            // 处理本地化字段
            const siteCodeValue = typeof itemSiteCode === 'object' && itemSiteCode !== null && 'en-US' in itemSiteCode
                ? itemSiteCode['en-US']
                : itemSiteCode;
            return siteCodeValue === SITE_CODE;
        });
        
        // 去重：根据articleSlug或title去重
        const uniqueArticles = [];
        const seenSlugs = new Set();
        const seenTitles = new Set();
        
        for (const article of siteFilteredItems) {
            const articleData = article.fields;
            // 参考Strapi：统一使用slug字段
            let slug = articleData.slug || articleData.articleSlug || articleData.article_slug || '';
            if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
                slug = slug['en-US'];
            }
            
            let title = articleData.title || '';
            if (typeof title === 'object' && title !== null && 'en-US' in title) {
                title = title['en-US'];
            }
            
            // 如果slug或title已存在，跳过
            if (slug && seenSlugs.has(slug)) continue;
            if (title && seenTitles.has(title)) continue;
            
            if (slug) seenSlugs.add(slug);
            if (title) seenTitles.add(title);
            uniqueArticles.push(article);
        }
        
        console.log('✅ 成功獲取文章:', uniqueArticles.length, '篇（已去重，原始:', result.items.length, '篇，过滤后:', siteFilteredItems.length, '篇）');
        
        if (uniqueArticles.length === 0) {
            if (container.querySelector('.daily-grid')) {
                container.querySelector('.daily-grid').innerHTML = '<div class="no-content">暫無文章</div>';
            }
            return;
        }
        
        // 渲染文章列表
        renderAllDailyArticles(container, uniqueArticles);
        
    } catch (error) {
        console.error('載入所有文章失敗:', error);
    }
}

/**
 * 渲染所有每日文章列表
 */
function renderAllDailyArticles(container, articles) {
    let gridContainer = container.querySelector('.daily-grid');
    
    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.className = 'daily-grid';
        container.appendChild(gridContainer);
    }
    
    gridContainer.innerHTML = '';
    
    articles.forEach((article) => {
        const articleData = article.fields;
        
        // 安全地获取图片URL（参考Strapi：统一使用imageUrl字段）
        let imageUrl = '';
        let imageField = articleData.imageUrl || articleData.coverImage || articleData.image_url || '';
        
        // 处理本地化字段
        if (typeof imageField === 'object' && imageField !== null && 'en-US' in imageField) {
            imageField = imageField['en-US'];
        }
        
        if (imageField) {
            if (typeof imageField === 'string') {
                // 如果是URL字符串，直接使用
                imageUrl = imageField;
            } else if (imageField.url) {
                // 如果是对象（Media类型），使用getImageUrl处理
                imageUrl = loader.getImageUrl(imageField, {
                    width: 400,
                    quality: 80,
                    format: 'webp'
                });
            } else {
                imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
            }
        } else {
            imageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
        }
        
        // 参考Strapi：统一使用date和slug字段
        let publishDate = articleData.date || articleData.publishDate || articleData.publish_date || '';
        if (typeof publishDate === 'object' && publishDate !== null && 'en-US' in publishDate) {
            publishDate = publishDate['en-US'];
        }
        publishDate = loader.formatDate(publishDate || new Date().toISOString());
        
        // 获取slug（参考Strapi：统一使用slug字段）
        let slug = articleData.slug || articleData.articleSlug || articleData.article_slug || '';
        if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
            slug = slug['en-US'];
        }
        if (!slug) {
            slug = publishDate.replace(/-/g, '');
        }
        // 使用原始HTML文件名（如 2025-12-08.html）
        const articleUrl = `articles/${slug}.html`;
        
        // 安全地获取标题和摘要（处理本地化字段）
        let title = articleData.title || '';
        if (typeof title === 'object' && title !== null && 'en-US' in title) {
            title = title['en-US'];
        }
        title = title || '無標題';
        
        let excerpt = articleData.excerpt || '';
        if (typeof excerpt === 'object' && excerpt !== null && 'en-US' in excerpt) {
            excerpt = excerpt['en-US'];
        }
        excerpt = excerpt || '無摘要';
        
        const articleElement = document.createElement('article');
        articleElement.className = 'daily-item';
        
        articleElement.innerHTML = `
            <a href="${articleUrl}">
                <div class="daily-image">
                    <img src="${imageUrl}" alt="${title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                    <span class="date-badge">${publishDate}</span>
                </div>
                <div class="daily-content">
                    <h3>${title}</h3>
                    <p>${excerpt}</p>
                </div>
            </a>
        `;
        
        gridContainer.appendChild(articleElement);
    });
}

// ============================================
// 初始化函數
// ============================================

/**
 * 獲取當前頁面類型
 */
function getCurrentPageType() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    
    if (filename === 'index.html' || filename === '' || filename === '/') {
        return 'index';
    } else if (filename === 'about.html') {
        return 'about';
    } else if (filename === 'contact.html') {
        return 'contact';
    } else if (filename === 'privacy.html') {
        return 'privacy';
        } else if (filename === 'all-daily-articles.html') {
            return 'all-daily-articles';
        } else if (filename.match(/^\d{4}-\d{2}-\d{2}\.html$/)) {
            return 'article';
        } else if (path.includes('fixed-articles/')) {
            return 'fixed-article';
        }
        
        return null;
    }
    
    /**
     * 从URL提取文章slug
     */
    function getArticleSlugFromUrl() {
        // 优先从URL参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const slugParam = urlParams.get('slug');
        if (slugParam) {
            return slugParam;
        }
        
        // 如果没有参数，尝试从文件名提取（兼容旧链接）
        const path = window.location.pathname;
        const filename = path.split('/').pop() || '';
        
        // 匹配日期格式：2025-12-08.html
        const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})\.html$/);
        if (dateMatch) {
            return dateMatch[1];
        }
        
        // 匹配固定文章：phone-guide.html
        const fixedMatch = filename.match(/^(.+)\.html$/);
        if (fixedMatch && path.includes('fixed-articles/')) {
            return fixedMatch[1];
        }
        
        return null;
    }
    
    /**
     * 加载并显示文章详情
     */
    async function loadArticleDetail() {
        try {
            // 优先查找id="article-content"，如果没有则查找class="article-page"
            let container = document.getElementById('article-content');
            if (!container) {
                container = document.querySelector('.article-page');
            }
            if (!container) {
                container = document.querySelector('main section, main');
            }
            if (!container) {
                console.warn('找不到文章内容容器');
                return;
            }
            
            const slug = getArticleSlugFromUrl();
            if (!slug) {
                console.warn('无法从URL提取文章slug');
                // 显示静态内容
                const staticContent = document.getElementById('static-content');
                if (staticContent) {
                    staticContent.style.display = 'block';
                }
                return;
            }
            
            // 显示加载中（完全清空容器，包括静态内容）
            container.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="color: #007bff; margin-bottom: 10px; font-size: 18px;">🔄 正在連接 Contentful API...</div>
                    <div style="color: #666; font-size: 14px;">載入文章內容中...</div>
                </div>
            `;
            
            // 确保静态内容被隐藏
            const staticContent = document.getElementById('static-content');
            if (staticContent) {
                staticContent.style.display = 'none';
            }
            
            console.log('📡 正在從Contentful獲取文章:', { slug, siteCode: SITE_CODE });
            
            // 简化模式：统一使用POST模型，通过category区分
            let contentType = 'post';
            let category = 'daily'; // 默认是每日文章
            const isFixedArticle = window.location.pathname.includes('fixed-articles/');
            
            if (isFixedArticle) {
                category = 'fixed'; // 固定文章
            }
            
            console.log('🔍 查询参数:', { contentType, category, slug, siteCode: SITE_CODE, isFixedArticle });
            
            // 构建查询参数
            // 注意：Contentful API查询可能不会完全过滤site字段，所以我们在客户端再次过滤
            const queryParams = {
                'fields.category': category, // 通过category区分
                limit: 100 // 获取更多以便客户端过滤和匹配
            };
            
            // 不在这里添加site和slug查询，而是在客户端过滤时匹配
            
            const result = await loader.getEntries(contentType, queryParams);
            
            console.log('📊 Contentful返回结果:', { 
                总数: result.items.length,
                前3个文章的字段: result.items.slice(0, 3).map(item => {
                    const data = item.fields || {};
                    return {
                        articleSlug: data.articleSlug,
                        articleType: data.articleType,
                        siteCode: data.siteCode,
                        publishDate: data.publishDate
                    };
                })
            });
            
            // 客户端二次过滤：确保只显示当前网站的文章（参考Strapi：统一使用site字段）
            const siteFilteredItems = result.items.filter(item => {
                const itemData = item.fields || {};
                // 尝试多种字段名格式（优先使用简单的site）
                let itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
                // 处理本地化字段
                let siteCodeValue = '';
                if (typeof itemSiteCode === 'object' && itemSiteCode !== null) {
                    if ('en-US' in itemSiteCode) {
                        siteCodeValue = itemSiteCode['en-US'];
                    } else {
                        // 如果没有en-US，尝试获取第一个值
                        siteCodeValue = Object.values(itemSiteCode)[0] || '';
                    }
                } else {
                    siteCodeValue = itemSiteCode;
                }
                const matches = siteCodeValue === SITE_CODE;
                if (!matches) {
                    console.log('❌ 站点不匹配:', { 
                        expected: SITE_CODE, 
                        got: siteCodeValue, 
                        title: itemData.title,
                        slug: itemData.slug 
                    });
                }
                return matches;
            });
            
            // 进一步过滤：确保slug匹配（处理本地化字段）
            const slugFilteredItems = siteFilteredItems.filter(item => {
                const itemData = item.fields || {};
                
                // 对于固定文章，需要检查slug和type字段
                // 对于每日文章，主要检查slug字段
                if (isFixedArticle) {
                    // 固定文章：检查slug或type字段
                    let itemSlug = itemData.slug || itemData.type || itemData.articleType || '';
                    if (typeof itemSlug === 'object' && itemSlug !== null && 'en-US' in itemSlug) {
                        itemSlug = itemSlug['en-US'];
                    }
                    // 调试日志
                    if (itemSlug === slug) {
                        console.log('✅ 匹配到固定文章:', { slug, itemSlug, title: itemData.title });
                    }
                    return itemSlug === slug;
                } else {
                    // 每日文章：检查slug字段
                    let itemSlug = itemData.slug || itemData.articleSlug || '';
                    if (typeof itemSlug === 'object' && itemSlug !== null && 'en-US' in itemSlug) {
                        itemSlug = itemSlug['en-US'];
                    }
                    
                    // 如果slug不匹配，尝试匹配日期格式（2025-12-08）
                    if (itemSlug !== slug) {
                        // 检查date是否匹配（参考Strapi：统一使用date字段）
                        let publishDate = itemData.date || itemData.publishDate || itemData.publish_date || '';
                        let dateStr = '';
                        if (typeof publishDate === 'object' && publishDate !== null && 'en-US' in publishDate) {
                            dateStr = publishDate['en-US'];
                        } else {
                            dateStr = publishDate;
                        }
                        // 如果slug是日期格式，尝试匹配日期
                        if (slug.match(/^\d{4}-\d{2}-\d{2}$/)) {
                            const dateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
                            if (dateMatch && dateMatch[1] === slug) {
                                console.log('✅ 通过日期匹配到每日文章:', { slug, dateStr, title: itemData.title });
                                return true;
                            }
                        }
                    } else {
                        console.log('✅ 通过slug匹配到每日文章:', { slug, itemSlug, title: itemData.title });
                    }
                    
                    return itemSlug === slug;
                }
            });
            
            if (slugFilteredItems.length === 0) {
                // 调试信息：显示所有匹配的文章的slug
                const debugInfo = {
                    slug, 
                    siteCode: SITE_CODE, 
                    原始数量: result.items.length, 
                    过滤后数量: siteFilteredItems.length,
                    匹配的文章slug: siteFilteredItems.slice(0, 5).map(item => {
                        const data = item.fields || {};
                        let itemSlug = '';
                        if (contentType === 'dailyArticle') {
                            const slugField = data.articleSlug || '';
                            if (typeof slugField === 'object' && slugField !== null && 'en-US' in slugField) {
                                itemSlug = slugField['en-US'];
                            } else {
                                itemSlug = slugField;
                            }
                        } else {
                            const typeField = data.articleType || '';
                            if (typeof typeField === 'object' && typeField !== null && 'en-US' in typeField) {
                                itemSlug = typeField['en-US'];
                            } else {
                                itemSlug = typeField;
                            }
                        }
                        return itemSlug || '无';
                    })
                };
                console.warn('Contentful中未找到文章（或不属于当前网站）:', debugInfo);
                const staticContent = document.getElementById('static-content');
                if (staticContent) {
                    staticContent.style.display = 'block';
                    container.innerHTML = '';
                } else {
                    container.innerHTML = '<div class="error">文章不存在或不属于当前网站</div>';
                }
                return;
            }
            
            console.log('✅ 成功獲取文章內容（', SITE_CODE, '，原始:', result.items.length, '篇，过滤后:', slugFilteredItems.length, '篇）');
            await renderArticleDetail(container, slugFilteredItems[0]);
            
        } catch (error) {
            console.error('載入文章詳情失敗:', error);
            const container = document.getElementById('article-content');
            if (container) {
                const staticContent = document.getElementById('static-content');
                if (staticContent) {
                    staticContent.style.display = 'block';
                    container.innerHTML = '';
                } else {
                    container.innerHTML = '<div class="error">載入文章失敗，請稍後再試</div>';
                }
            }
        }
    }
    
    /**
     * 渲染文章详情
     */
    async function renderArticleDetail(container, article) {
        const articleData = article.fields;
        
        // 获取Entry ID用于构建Contentful编辑链接
        const entryId = article.sys?.id || '';
        const spaceId = CONTENTFUL_CONFIG.spaceId || 'ubxfz0m4n46z';
        const environment = CONTENTFUL_CONFIG.environment || 'master';
        const editUrl = entryId ? `https://app.contentful.com/spaces/${spaceId}/environments/${environment}/entries/${entryId}` : '';
        
        // 参考Strapi：统一使用slug和type字段
        let currentSlug = articleData.slug || articleData.articleSlug || articleData.articleType || articleData.type || '';
        if (typeof currentSlug === 'object' && currentSlug !== null && 'en-US' in currentSlug) {
            currentSlug = currentSlug['en-US'];
        }
        
        // 获取图片URL（参考Strapi：统一使用imageUrl字段）
        let imageUrl = '';
        let imageField = articleData.imageUrl || articleData.coverImage || articleData.image_url || '';
        if (typeof imageField === 'object' && imageField !== null && 'en-US' in imageField) {
            imageField = imageField['en-US'];
        }
        
        if (imageField) {
            if (typeof imageField === 'string') {
                imageUrl = imageField;
            } else if (imageField.url) {
                imageUrl = loader.getImageUrl(imageField, {
                    width: 1200,
                    quality: 80,
                    format: 'webp'
                });
            } else {
                imageUrl = 'https://via.placeholder.com/1200x800?text=No+Image';
            }
        } else {
            imageUrl = 'https://via.placeholder.com/1200x800?text=No+Image';
        }
        
        // 参考Strapi：统一使用date和html字段
        let publishDate = articleData.date || articleData.publishDate || articleData.publish_date || '';
        if (typeof publishDate === 'object' && publishDate !== null && 'en-US' in publishDate) {
            publishDate = publishDate['en-US'];
        }
        publishDate = loader.formatDate(publishDate || new Date().toISOString());
        
        let title = articleData.title || '';
        if (typeof title === 'object' && title !== null && 'en-US' in title) {
            title = title['en-US'];
        }
        title = title || '無標題';
        
        let content = articleData.html || articleData.content || '';
        if (typeof content === 'object' && content !== null && 'en-US' in content) {
            content = content['en-US'];
        }
        
        // 简化模式：统一使用POST模型
        const isDailyArticle = window.location.pathname.includes('/articles/');
        const category = isDailyArticle ? 'daily' : 'fixed';
        
        // 获取当前页面的基础路径（用于生成相对链接）
        const currentPath = window.location.pathname;
        const isInArticlesFolder = currentPath.includes('/articles/');
        const isInFixedArticlesFolder = currentPath.includes('/fixed-articles/');
        
        // 获取相关文章（排除当前文章）
        let relatedArticlesHtml = '';
        try {
            // 简化模式：统一使用POST模型
            const relatedResult = await loader.getEntries('post', {
                'fields.site': SITE_CODE,
                'fields.category': category, // 获取相同类型的文章
                order: '-fields.date',
                limit: 10
            });
            
            // 客户端二次过滤：确保只显示当前网站的文章（参考Strapi：统一使用site字段）
            const siteFilteredItems = relatedResult.items.filter(item => {
                const itemData = item.fields || {};
                // 尝试多种字段名格式（优先使用简单的site）
                let itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
                // 处理本地化字段
                const siteCodeValue = typeof itemSiteCode === 'object' && itemSiteCode !== null && 'en-US' in itemSiteCode
                    ? itemSiteCode['en-US']
                    : itemSiteCode;
                return siteCodeValue === SITE_CODE;
            });
            
            // 去重并排除当前文章
            const seenSlugs = new Set([currentSlug]);
            const seenTitles = new Set([title]);
            const relatedArticles = [];
            
            for (const item of siteFilteredItems) {
                const itemData = item.fields;
                // 参考Strapi：统一使用slug和type字段
                let itemSlug = itemData.slug || itemData.articleSlug || itemData.articleType || itemData.type || '';
                if (typeof itemSlug === 'object' && itemSlug !== null && 'en-US' in itemSlug) {
                    itemSlug = itemSlug['en-US'];
                }
                
                let itemTitle = itemData.title || '';
                if (typeof itemTitle === 'object' && itemTitle !== null && 'en-US' in itemTitle) {
                    itemTitle = itemTitle['en-US'];
                }
                
                // 跳过当前文章和重复文章
                if (itemSlug && seenSlugs.has(itemSlug)) continue;
                if (itemTitle && seenTitles.has(itemTitle)) continue;
                
                seenSlugs.add(itemSlug);
                seenTitles.add(itemTitle);
                relatedArticles.push(item);
                
                if (relatedArticles.length >= 3) break;
            }
            
            if (relatedArticles.length > 0) {
                relatedArticlesHtml = '<section class="related-articles"><h2>相關文章</h2><div class="related-grid">';
                
                relatedArticles.forEach((relatedArticle) => {
                    const relatedData = relatedArticle.fields;
                    // 参考Strapi：统一使用slug和type字段
                    let relatedSlug = relatedData.slug || relatedData.articleSlug || relatedData.articleType || relatedData.type || '';
                    if (typeof relatedSlug === 'object' && relatedSlug !== null && 'en-US' in relatedSlug) {
                        relatedSlug = relatedSlug['en-US'];
                    }
                    
                    let relatedTitle = relatedData.title || '';
                    if (typeof relatedTitle === 'object' && relatedTitle !== null && 'en-US' in relatedTitle) {
                        relatedTitle = relatedTitle['en-US'];
                    }
                    relatedTitle = relatedTitle || '無標題';
                    
                    // 获取相关文章图片（参考Strapi：统一使用imageUrl字段）
                    let relatedImageUrl = '';
                    let relatedImageField = relatedData.imageUrl || relatedData.coverImage || relatedData.image_url || '';
                    if (typeof relatedImageField === 'object' && relatedImageField !== null && 'en-US' in relatedImageField) {
                        relatedImageField = relatedImageField['en-US'];
                    }
                    
                    if (relatedImageField) {
                        if (typeof relatedImageField === 'string') {
                            relatedImageUrl = relatedImageField;
                        } else if (relatedImageField.url) {
                            relatedImageUrl = loader.getImageUrl(relatedImageField, {
                                width: 400,
                                quality: 80,
                                format: 'webp'
                            });
                        }
                    }
                    if (!relatedImageUrl) {
                        relatedImageUrl = 'https://via.placeholder.com/400x300?text=No+Image';
                    }
                    
                    // 根据当前页面路径确定相对路径
                    // 由于相关文章和当前文章在同一文件夹，使用相对路径即可
                    const relatedUrl = `article.html?slug=${encodeURIComponent(relatedSlug)}`;
                    
                    relatedArticlesHtml += `
                        <article class="article-card">
                            <a href="${relatedUrl}">
                                <img src="${relatedImageUrl}" alt="${relatedTitle}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                                <div class="card-content">
                                    <h3>${relatedTitle}</h3>
                                </div>
                            </a>
                        </article>
                    `;
                });
                
                relatedArticlesHtml += '</div></section>';
            }
        } catch (error) {
            console.error('載入相關文章失敗:', error);
        }
        
        // 创建文章内容HTML（不包含编辑按钮）
        let articleContentHtml = `
            <h1>${title}</h1>
            <div style="margin: 20px 0; color: #666; font-size: 14px;">發布日期：${publishDate}</div>
            <img src="${imageUrl}" alt="${title}" loading="lazy" style="width: 100%; max-width: 1200px; height: auto; border-radius: 8px; margin: 20px 0;" onerror="this.src='https://via.placeholder.com/1200x800?text=No+Image'">
            <div class="article-body" style="margin-top: 30px; line-height: 1.8;">
                ${content.replace(/\n/g, '<br>')}
            </div>
        `;
        
        // 如果有相关文章，添加相关文章部分
        if (relatedArticlesHtml) {
            articleContentHtml += relatedArticlesHtml;
        }
        
        // 完全替换容器内容（从Contentful加载的内容）
        // 先完全清空容器，确保不会保留任何原始内容（包括static-content）
        container.innerHTML = '';
        // 然后插入Contentful内容
        container.innerHTML = articleContentHtml;
        console.log('✅ 已渲染文章内容到容器');
        
        // 确保静态内容被隐藏（如果存在，可能在容器外）
        const staticContent = document.getElementById('static-content');
        if (staticContent) {
            staticContent.style.display = 'none';
        }
    }

/**
 * 頁面初始化
 */
async function initContentful() {
    // 等待DOM載入完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
}

/**
 * 更新导览列"每日文章"链接为最新文章
 */
async function updateNavLatestArticle() {
    try {
        // 获取最新的一篇每日文章（只获取当前网站的文章）
        // 简化模式：使用POST模型，通过category='daily'区分
        const result = await loader.getEntries('post', {
            'fields.site': SITE_CODE,
            'fields.category': 'daily', // 只获取每日文章
            order: '-fields.date',
            limit: 10
        });
        
        // 客户端二次过滤：确保只显示当前网站的文章（参考Strapi：统一使用site字段）
        const siteFilteredItems = result.items.filter(item => {
            const itemData = item.fields || {};
            // 尝试多种字段名格式（优先使用简单的site）
            let itemSiteCode = itemData.site || itemData.siteCode || itemData.site_code || '';
            // 处理本地化字段
            const siteCodeValue = typeof itemSiteCode === 'object' && itemSiteCode !== null && 'en-US' in itemSiteCode
                ? itemSiteCode['en-US']
                : itemSiteCode;
            return siteCodeValue === SITE_CODE;
        });
        
        if (siteFilteredItems.length > 0) {
            const articleData = siteFilteredItems[0].fields;
            // 参考Strapi：统一使用slug和date字段
            let slug = articleData.slug || articleData.articleSlug || articleData.article_slug || '';
            // 处理本地化字段
            if (typeof slug === 'object' && slug !== null && 'en-US' in slug) {
                slug = slug['en-US'];
            }
            // 如果没有slug，尝试使用date
            if (!slug) {
                let publishDate = articleData.date || articleData.publishDate || articleData.publish_date || '';
                if (typeof publishDate === 'object' && publishDate !== null && 'en-US' in publishDate) {
                    publishDate = publishDate['en-US'];
                }
                if (publishDate && typeof publishDate === 'string' && publishDate.length >= 10) {
                    slug = publishDate.substring(0, 10); // 提取日期部分 YYYY-MM-DD
                }
            }
            
            if (slug) {
                // 使用原始HTML文件名（如 2025-12-08.html）
                const latestUrl = `articles/${slug}.html`;
                
                // 更新所有"每日精選文章"链接
                const navLinks = document.querySelectorAll('a[href*="articles/2025"], a[href*="每日精選文章"]');
                navLinks.forEach(link => {
                    const href = link.getAttribute('href');
                    // 只更新指向旧文章链接的导航项
                    if (href && (href.includes('articles/2025') || link.textContent.includes('每日精選文章'))) {
                        // 检查是否是导航栏中的链接（不是文章内容中的链接）
                        const isNavLink = link.closest('.sidebar-nav') || link.closest('nav');
                        if (isNavLink) {
                            link.setAttribute('href', latestUrl);
                        }
                    }
                });
                
                console.log('✅ 已更新导览列"每日文章"链接为最新文章（', SITE_CODE, '，slug:', slug, '）');
            } else {
                console.warn('⚠️ 无法获取最新文章的slug');
            }
        } else {
            console.warn('⚠️ 未找到当前网站的最新文章');
        }
    } catch (error) {
        console.error('更新导览列链接失败:', error);
    }
}

/**
 * 初始化所有功能
 */
async function initialize() {
    try {
        const pageType = getCurrentPageType();
        
        // 更新导览列链接（所有页面都需要）
        await updateNavLatestArticle();
        
        if (pageType === 'index') {
            // 首頁：載入每日文章和固定文章
            await loadDailyArticles();
            await loadFixedArticles();
        } else if (pageType === 'all-daily-articles') {
            // 查看所有文章頁面
            await loadAllDailyArticles();
        } else if (pageType === 'article' || pageType === 'fixed-article') {
            // 文章詳情頁：從Contentful載入文章內容（POST模型）
            await loadArticleDetail();
        } else if (pageType === 'about' || pageType === 'contact' || pageType === 'privacy') {
            // 靜態頁面：從Contentful載入頁面內容（PAGE模型）
            await loadPageContentAndRender(pageType);
        }
        
    } catch (error) {
        console.error('初始化失敗:', error);
    }
}

// 自動初始化
initContentful();


