// =========================================================
// Strapi CMS 動態內容載入腳本
// =========================================================

// 配置：請根據你的 Strapi 設定修改
const STRAPI_URL = 'http://localhost:1337'; // 如果 Strapi 在遠端，改成你的 Strapi URL
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

// =========================================================
// 工具函數：統一處理 Strapi 資料結構
// =========================================================

function getPostAttributes(item) {
    // 處理兩種可能的資料結構：
    // 1. 標準 Strapi v4: {id, attributes: {title, slug, ...}}
    // 2. 扁平結構: {id, title, slug, ...}
    if (item.attributes) {
        return item.attributes;
    }
    // 如果是扁平結構，直接返回整個 item（除了 id）
    const { id, documentId, ...attrs } = item;
    return attrs;
}

// =========================================================
// 工具函數：從 HTML 內容中提取第一段文本作為描述
// =========================================================

function extractFirstParagraph(htmlContent, maxLength = 28) {
    if (!htmlContent) return '';
    
    // 創建臨時 DOM 來解析 HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // 找到第一個段落（<p> 標籤）
    const firstP = tempDiv.querySelector('p');
    if (!firstP) {
        // 如果沒有 <p>，嘗試提取所有文本
        const text = tempDiv.textContent || tempDiv.innerText || '';
        const cleanText = text.trim().replace(/\s+/g, ' ');
        if (cleanText.length > maxLength) {
            return cleanText.substring(0, maxLength) + '...';
        }
        return cleanText;
    }
    
    // 提取段落文本，移除多餘空白
    let text = firstP.textContent || firstP.innerText || '';
    text = text.trim().replace(/\s+/g, ' ');
    
    // 如果太長，截取並加上省略號
    if (text.length > maxLength) {
        text = text.substring(0, maxLength) + '...';
    }
    
    return text;
}

// =========================================================
// 工具函數：獲取文章描述（優先使用 excerpt，否則從 html 提取）
// =========================================================

function getArticleDescription(post) {
    // 如果有 excerpt 且不是標題，直接使用
    if (post.excerpt && post.excerpt.trim() && post.excerpt !== post.title) {
        return post.excerpt;
    }
    
    // 否則從 html 內容中提取第一段（首頁描述限制 28 字）
    if (post.html) {
        const extracted = extractFirstParagraph(post.html, 28);
        if (extracted && extracted !== post.title) {
            return extracted;
        }
    }
    
    // 最後才使用標題（但這不應該發生，因為用戶希望不要重複標題）
    return '';
}

// =========================================================
// 工具函數：從 Strapi 抓取 Page 內容
// =========================================================

async function fetchPageFromStrapi(site, type) {
    try {
        const url = `${STRAPI_URL}/api/pages?filters[site][$eq]=${site}&filters[type][$eq]=${type}&pagination[limit]=1`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ Strapi Page API 錯誤 (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            const page = data.data[0];
            const attrs = page.attributes || page;
            console.log(`✅ 成功從 Strapi 抓取 Page: ${site} - ${type}`, attrs);
            return attrs;
        }
        
        console.warn(`⚠️ 找不到 Page: ${site} - ${type}`);
        return null;
    } catch (error) {
        console.error(`❌ 抓取 Strapi Page 失敗 (${site} - ${type}):`, error);
        return null;
    }
}

// =========================================================
// 工具函數：從 Strapi 抓取文章
// =========================================================

async function fetchPostsFromStrapi(site, category, daysLimit = null) {
    try {
        // 構建 API URL，使用 Strapi 的篩選功能
        // 依照 date > updatedAt > publishedAt 由新到舊排序
        // 每日精選(daily) 預設只抓 isFeatured=true 的文章
        let url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=${category}`;
        if (category === 'daily') {
            url += `&filters[isFeatured][$eq]=true`;
        }
        // 多重排序：先看自訂欄位 date，沒有再看 updatedAt / publishedAt
        url += `&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc`;
        
        // 如果指定了天數限制，只載入最近 N 天的文章
        if (daysLimit && daysLimit > 0) {
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - daysLimit);
            const dateLimitISO = dateLimit.toISOString();
            url += `&filters[publishedAt][$gte]=${dateLimitISO}`;
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // 如果有 API Token，加入 Authorization header
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ Strapi API 錯誤 (${response.status}):`, await response.text());
            return [];
        }
        
        const data = await response.json();
        console.log(`✅ 成功從 Strapi 抓取 ${site} - ${category}:`, data);
        
        // Strapi v4 的資料結構：data 是陣列，每個項目有 attributes
        if (data.data && Array.isArray(data.data)) {
            console.log(`📊 找到 ${data.data.length} 篇文章，詳細資料:`, data.data.map(item => {
                const attrs = getPostAttributes(item);
                return {
                    id: item.id,
                    slug: attrs.slug,
                    title: attrs.title,
                    category: attrs.category,
                    site: attrs.site
                };
            }));
            return data.data;
        }
        
        console.warn(`⚠️ 資料結構不符合預期，data.data 不是陣列:`, data);
        return [];
    } catch (error) {
        console.error(`❌ 抓取 Strapi 資料失敗 (${site} - ${category}):`, error);
        return [];
    }
}

// =========================================================
// 載入「每日精選」文章到側邊欄
// =========================================================

async function loadDailyForSite(site) {
    // 只載入最近 7 天內的文章
    const posts = await fetchPostsFromStrapi(site, 'daily', 7);
    
    // 根據不同站點找到每日精選區塊（支援多種結構）
    let dailyContainer = null;
    let containerType = null;
    
    // site1: .daily-widget .widget-list
    dailyContainer = document.querySelector('.daily-widget .widget-list');
    if (dailyContainer) {
        containerType = 'site1';
    }
    
    // site2, site4: .daily-article-list
    if (!dailyContainer) {
        dailyContainer = document.querySelector('.daily-article-list');
        if (dailyContainer) {
            // 區分 site2 和 site4：site4 使用 .daily-link 和 .daily-content，site2 使用 .daily-card-content
            const firstLink = dailyContainer.querySelector('a');
            if (firstLink && firstLink.classList.contains('daily-link')) {
                containerType = 'site4';
            } else {
                containerType = 'site2';
            }
        }
    }
    
    // site3: .daily-picks .daily-grid
    if (!dailyContainer) {
        dailyContainer = document.querySelector('.daily-picks .daily-grid');
        if (dailyContainer) {
            containerType = 'site3';
        }
    }
    
    // site5: .feed-section .feed-list
    if (!dailyContainer) {
        dailyContainer = document.querySelector('.feed-section .feed-list');
        if (dailyContainer) {
            containerType = 'site5';
        }
    }
    
    if (!dailyContainer) {
        console.warn('⚠️ 找不到每日精選區塊元素');
        return;
    }
    
    // 如果沒有抓到文章，保留原本的靜態內容
    if (posts.length === 0) {
        console.log('⚠️ 沒有抓到 daily 文章，保留靜態內容');
        return;
    }
    
    // 清空原本的靜態內容
    dailyContainer.innerHTML = '';
    
    // 去重：確保每個 slug 只顯示一次
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
    
    // 確保按日期降序排序（最新的在前）
    uniquePosts.sort((a, b) => {
        const attrsA = getPostAttributes(a);
        const attrsB = getPostAttributes(b);
        
        // 優先使用自訂的文字欄位 date，其次才是 publishedAt / createdAt
        let dateA = attrsA.date || attrsA.publishedAt || attrsA.createdAt || '';
        let dateB = attrsB.date || attrsB.publishedAt || attrsB.createdAt || '';
        
        // 如果都沒有日期，嘗試從 slug 提取
        if (!dateA || !dateB) {
            const slugA = attrsA.slug || '';
            const slugB = attrsB.slug || '';
            const dateMatchA = slugA.match(/(\d{4}-\d{2}-\d{2})/);
            const dateMatchB = slugB.match(/(\d{4}-\d{2}-\d{2})/);
            
            if (dateMatchA && !dateA) {
                dateA = dateMatchA[1] + 'T00:00:00.000Z';
            }
            if (dateMatchB && !dateB) {
                dateB = dateMatchB[1] + 'T00:00:00.000Z';
            }
        }
        
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;  // 沒有日期的排在後面
        if (!dateB) return -1; // 沒有日期的排在後面
        
        // 降序排序（最新的在前）：dateB - dateA
        // 確保日期格式正確（ISO 格式）
        const timeA = new Date(dateA).getTime();
        const timeB = new Date(dateB).getTime();
        
        // 檢查日期是否有效
        if (isNaN(timeA) || isNaN(timeB)) {
            console.warn(`⚠️ 日期格式無效: dateA=${dateA}, dateB=${dateB}`);
            return 0;
        }
        
        const result = timeB - timeA;
        
        console.log(`🔍 排序比較: ${attrsA.title} (${dateA}) vs ${attrsB.title} (${dateB}) -> ${result > 0 ? 'B在前' : result < 0 ? 'A在前' : '相等'}`);
        
        return result;
    });
    
    // 調試：顯示排序後的順序
    console.log('📊 排序後的文章順序：');
    uniquePosts.forEach((item, idx) => {
        const p = getPostAttributes(item);
        const date = p.publishedAt || p.createdAt || '';
        const slugDate = p.slug ? p.slug.match(/(\d{4}-\d{2}-\d{2})/) : null;
        console.log(`  ${idx + 1}. ${p.title} - 日期: ${date || slugDate?.[1] || '未知'}`);
    });
    
    // 只取前 3 篇
    let postsToDisplay = uniquePosts.slice(0, 3);
    
        // 如果排序後順序不對，強制反轉（確保最新的在最前面）
        // 檢查第一篇文章的日期是否比最後一篇新
    if (postsToDisplay.length >= 2) {
        const first = getPostAttributes(postsToDisplay[0]);
        const last = getPostAttributes(postsToDisplay[postsToDisplay.length - 1]);
        const dateFirst = first.date || first.publishedAt || first.createdAt || '';
        const dateLast = last.date || last.publishedAt || last.createdAt || '';
        
        if (dateFirst && dateLast) {
            const timeFirst = new Date(dateFirst).getTime();
            const timeLast = new Date(dateLast).getTime();
            
            // 如果第一篇的日期比最後一篇舊，說明排序反了，需要反轉
            if (timeFirst < timeLast) {
                postsToDisplay.reverse();
                console.log('🔄 檢測到排序順序錯誤，已反轉數組');
            }
        }
    }
    
    // 動態生成文章列表（最多 3 篇，已去重並排序）
    postsToDisplay.forEach((item, index) => {
        const actualIndex = index;
        if (!item) {
            console.warn(`⚠️ 文章 ${index} 為空:`, item);
            return;
        }
        
        // 使用統一函數處理資料結構
        const p = getPostAttributes(item);
        console.log(`📄 處理文章 ${index}:`, { slug: p.slug, title: p.title, category: p.category, site: p.site });
        
        if (!p.slug) {
            console.warn(`⚠️ 文章 ${index} 沒有 slug，跳過:`, p);
            return;
        }
        
        // 日期顯示優先使用自訂欄位 date，其次才是 publishedAt / createdAt
        let date = '';
        const dateSource = p.date || p.publishedAt || p.createdAt;
        if (dateSource) {
            const d = new Date(dateSource);
            if (!isNaN(d.getTime())) {
                date = d.toISOString().split('T')[0];
            }
        }
        
        // 優先使用 Strapi 的 imageUrl（你在後台填的圖片 URL），
        // 如果沒有填，再根據 slug 使用既有的預設圖，確保「文章和圖片」綁在一起。
        let imgUrl = p.imageUrl || '';
        if (!imgUrl) {
            // 例如 slug: 2025-12-03 -> 使用 daily3；2025-12-02 -> daily2；其他 -> daily1
            let imgName = 'daily1';
            if (p.slug && typeof p.slug === 'string') {
                if (p.slug.includes('12-03')) {
                    imgName = 'daily3';
                } else if (p.slug.includes('12-02')) {
                    imgName = 'daily2';
                } else {
                    imgName = 'daily1';
                }
            }
            imgUrl = `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgName}.webp?raw=true`;
        }
        
        // 根據不同站點結構生成不同的 HTML
        let itemHtml = '';
        
        // 使用實際的 slug 來生成連結，確保連結指向正確的文章
        const displaySlug = p.slug;

        if (containerType === 'site1') {
            // site1: <li> with .widget-img and .widget-text
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="articles/${displaySlug}.html">
                    <div class="widget-img">
                        <img src="${imgUrl}" alt="${p.title}" loading="lazy">
                    </div>
                    <div class="widget-text">
                        <h4>${p.title || '無標題'}</h4>
                        <p>${getArticleDescription(p)}</p>
                        ${date ? `<span class="date">${date}</span>` : ''}
                    </div>
                </a>
            `;
            dailyContainer.appendChild(li);
        } else if (containerType === 'site2') {
            // site2: <li> with .daily-card-img and .daily-card-content
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="articles/${displaySlug}.html">
                    <img src="${imgUrl}" class="daily-card-img" alt="${p.title}" loading="lazy">
                    <div class="daily-card-content">
                        <h3>${p.title || '無標題'}</h3>
                        <p>${getArticleDescription(p)}</p>
                        ${date ? `<span class="publish-date">${date}</span>` : ''}
                    </div>
                </a>
            `;
            dailyContainer.appendChild(li);
        } else if (containerType === 'site4') {
            // site4: <li> with .daily-link and .daily-content (無圖片)
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="articles/${displaySlug}.html" class="daily-link">
                    <div class="daily-content">
                        <h3>${p.title || '無標題'}</h3>
                        <p>${getArticleDescription(p)}</p>
                        ${date ? `<span class="publish-date">${date}</span>` : ''}
                    </div>
                </a>
            `;
            dailyContainer.appendChild(li);
        } else if (containerType === 'site3') {
            // site3: <a> with .daily-item, .item-image, .item-info
            const a = document.createElement('a');
            a.href = `articles/${displaySlug}.html`;
            a.className = 'daily-item';
            a.innerHTML = `
                <div class="item-image">
                    <img src="${imgUrl}" alt="${p.title}" loading="lazy">
                </div>
                <div class="item-info">
                    <h3>${p.title || '無標題'}</h3>
                    <p>${getArticleDescription(p)}</p>
                    ${date ? `<span class="meta-date">${date}</span>` : ''}
                </div>
            `;
            dailyContainer.appendChild(a);
        } else if (containerType === 'site5') {
            // site5: <a> with .feed-item, .feed-icon, .feed-content
            const a = document.createElement('a');
            a.href = `articles/${displaySlug}.html`;
            a.className = 'feed-item';
            a.innerHTML = `
                <div class="feed-icon">
                    <img src="${imgUrl}" alt="${p.title}" loading="lazy">
                </div>
                <div class="feed-content">
                    <h3>${p.title || '無標題'}</h3>
                    <p>${getArticleDescription(p)}</p>
                    ${date ? `<span class="time-ago">${date}</span>` : ''}
                </div>
            `;
            dailyContainer.appendChild(a);
        }
        
        console.log(`✅ 已添加文章到每日精選: ${p.title} (${p.slug})`);
    });
    
    // 在每日精選區塊底部添加「查看所有文章」連結（依各站風格客製）
    const viewAllLink = document.createElement('a');
    viewAllLink.href = `all-daily-articles.html`;
    viewAllLink.className = 'view-all-articles';
    
    // 依 site 設計不同樣式，但統一靠右
    let styleText;
    switch (site) {
        case 'site1': // 懷舊時光機：跟卡片同調的亮色文字
            styleText =
                'display:block;text-align:right;margin-top:1rem;padding:0.5rem 0;' +
                'color:#ff6b6b;text-decoration:none;font-size:0.9rem;font-family:var(--font-heading);';
            break;
        case 'site2': // 競技領域：細底線、偏工具感
            styleText =
                'display:block;text-align:right;margin-top:1.2rem;padding:0.4rem 0;' +
                'color:#1e6fd9;text-decoration:underline;font-size:0.95rem;font-weight:600;';
            break;
        case 'site3': // 獨立視界：淡紫色，與卡片留白搭配
            styleText =
                'display:block;text-align:right;margin-top:1.5rem;padding:0.5rem 0;border-top:1px dashed #eee;' +
                'color:#7b5cff;text-decoration:none;font-size:0.9rem;';
            break;
        case 'site4': // 攻略圖書館：偏資訊標籤感，全大寫
            styleText =
                'display:block;text-align:right;margin-top:1rem;padding:0.5rem 0;' +
                'color:#00a870;text-decoration:none;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;';
            break;
        case 'site5': // 手遊速報：小圓角按鈕
            styleText =
                'display:block;text-align:right;margin-top:1.2rem;' +
                'color:#ff8a3d;text-decoration:none;font-size:0.85rem;';
            break;
        default:
            styleText =
                'display:block;text-align:right;margin-top:1rem;padding:0.5rem;' +
                'color:var(--retro-accent,#ff6b6b);text-decoration:none;font-size:0.9rem;';
    }
    viewAllLink.style.cssText = styleText;
    viewAllLink.textContent = '查看所有文章 →';
    
    // 根據不同站點結構，找到父容器來添加連結
    const dailySection = dailyContainer.closest('.daily-widget, .daily-picks, .daily-section, section');
    if (dailySection) {
        dailySection.appendChild(viewAllLink);
    } else {
        // 如果找不到父容器，直接在 dailyContainer 後面添加
        dailyContainer.parentNode.insertBefore(viewAllLink, dailyContainer.nextSibling);
    }
    
    console.log(`✅ 已更新 ${site} 的每日精選區塊，共 ${dailyContainer.children.length} 篇文章`);
}

// =========================================================
// 載入「精選攻略」（固定文章）到主內容區
// =========================================================

async function loadFixedForSite(site) {
    const posts = await fetchPostsFromStrapi(site, 'fixed');
    
    // 根據不同站點找到固定文章區塊（支援多種結構）
    let featuredSection = null;
    let sectionType = null;
    
    // site1: .featured-posts
    featuredSection = document.querySelector('.featured-posts');
    if (featuredSection) {
        sectionType = 'site1';
    }
    
    // site2, site4: .fixed-articles-section .fixed-articles
    if (!featuredSection) {
        featuredSection = document.querySelector('.fixed-articles-section .fixed-articles');
        if (featuredSection) {
            sectionType = 'site2';
        }
    }
    
    // site3: .featured-works .masonry-grid
    if (!featuredSection) {
        featuredSection = document.querySelector('.featured-works .masonry-grid');
        if (featuredSection) {
            sectionType = 'site3';
        }
    }
    
    // site5: .grid-section .card-grid
    if (!featuredSection) {
        featuredSection = document.querySelector('.grid-section .card-grid');
        if (featuredSection) {
            sectionType = 'site5';
        }
    }
    
    if (!featuredSection) {
        console.warn('⚠️ 找不到固定文章區塊元素');
        return;
    }
    
    // 如果沒有抓到文章，保留原本的靜態內容
    if (posts.length === 0) {
        console.log('⚠️ 沒有抓到 fixed 文章，保留靜態內容');
        return;
    }
    
    // 根據不同站點結構找到文章元素
    let postEntries = null;
    
    if (sectionType === 'site1') {
        postEntries = featuredSection.querySelectorAll('.post-entry');
    } else if (sectionType === 'site2') {
        postEntries = featuredSection.querySelectorAll('.article-row');
    } else if (sectionType === 'site3') {
        postEntries = featuredSection.querySelectorAll('.masonry-item');
    } else if (sectionType === 'site5') {
        postEntries = featuredSection.querySelectorAll('.feature-card');
    }
    
    if (!postEntries || postEntries.length === 0) {
        console.warn('⚠️ 找不到文章元素');
        return;
    }
    
    // 動態更新文章（最多更新現有的文章數量）
    postEntries.forEach((entry, index) => {
        if (index >= posts.length) {
            entry.style.display = 'none'; // 隱藏多餘的區塊
            return;
        }
        
        const item = posts[index];
        if (!item) return;
        
        // 使用統一函數處理資料結構
        const p = getPostAttributes(item);
        if (!p.slug) return;
        
        // 判斷圖片（根據 slug，需要適配不同站點）
        let imgName = 'fixed1';
        if (site === 'site1') {
            imgName = p.slug.includes('cartridge') || p.slug.includes('care') ? 'fixed2' :
                     p.slug.includes('collector') || p.slug.includes('guide') ? 'fixed3' :
                     p.slug.includes('retro') || p.slug.includes('modern') ? 'fixed1' : 'fixed1';
        } else if (site === 'site2') {
            imgName = p.slug.includes('keyboard') || p.slug.includes('switches') ? 'fixed1' :
                     p.slug.includes('aim') || p.slug.includes('training') ? 'fixed2' :
                     p.slug.includes('monitor') || p.slug.includes('hz') ? 'fixed3' : 'fixed1';
        } else if (site === 'site3') {
            imgName = p.slug.includes('narrative') ? 'fixed1' :
                     p.slug.includes('pixel') ? 'fixed2' :
                     p.slug.includes('steam') || p.slug.includes('wishlist') ? 'fixed3' : 'fixed1';
        } else if (site === 'site4') {
            imgName = p.slug.includes('100') || p.slug.includes('percent') ? 'fixed1' :
                     p.slug.includes('open') || p.slug.includes('world') ? 'fixed2' :
                     p.slug.includes('souls') || p.slug.includes('combat') ? 'fixed3' : 'fixed1';
        } else if (site === 'site5') {
            imgName = p.slug.includes('f2p') || p.slug.includes('guide') ? 'fixed1' :
                     p.slug.includes('phone') || p.slug.includes('heating') ? 'fixed2' :
                     p.slug.includes('portrait') || p.slug.includes('games') ? 'fixed3' : 'fixed1';
        }
        
        const imgUrl = `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgName}.webp?raw=true`;
        
        // 使用統一的描述提取函數
        let description = getArticleDescription(p);
        description = description || p.title || '';
        
        // 更新連結和內容（根據不同結構）
        const link = entry.querySelector('a') || entry;
        if (link) {
            link.href = `articles/${p.slug}.html`;
            
            const img = link.querySelector('img');
            if (img) {
                img.src = imgUrl;
                img.alt = p.title || '';
            }
            
            const h3 = link.querySelector('h3');
            if (h3) h3.textContent = p.title || '無標題';
            
            // 查找描述段落（不同站點可能有不同的選擇器）
            const pTag = link.querySelector('.post-content p') || 
                        link.querySelector('.article-info p') ||
                        link.querySelector('.item-info p') ||
                        link.querySelector('.feed-content p') ||
                        link.querySelector('p');
            if (pTag) pTag.textContent = description;
        }
    });
    
    console.log(`✅ 已更新 ${site} 的固定文章區塊`);
}

// =========================================================
// 載入首頁內容（從 Page API）
// =========================================================

async function loadHomePageFromStrapi(site) {
    try {
        const pageData = await fetchPageFromStrapi(site, 'home');
        if (!pageData || !pageData.html) {
            console.warn(`⚠️ 無法載入 ${site} 的首頁內容，使用預設內容`);
            return;
        }
        
        // 解析 HTML 內容
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pageData.html;
        
        // 查找並替換 Hero section
        const heroSelectors = ['.retro-hero', '.hero', '.hero-section', 'section.hero', '.hero-card'];
        let heroSection = null;
        let heroFromStrapi = null;
        
        for (const selector of heroSelectors) {
            heroSection = document.querySelector(selector);
            if (heroSection) {
                heroFromStrapi = tempDiv.querySelector(selector);
                if (heroFromStrapi) {
                    heroSection.innerHTML = heroFromStrapi.innerHTML;
                    console.log(`✅ 已更新 ${site} 的 Hero section (${selector})`);
                    break;
                }
            }
        }
        
        // 查找並替換 Featured Posts section
        const featuredSelectors = ['.featured-posts', '.featured-works', '.fixed-articles-section', '.grid-section'];
        let featuredSection = null;
        let featuredFromStrapi = null;
        
        for (const selector of featuredSelectors) {
            featuredSection = document.querySelector(selector);
            if (featuredSection) {
                featuredFromStrapi = tempDiv.querySelector(selector);
                if (featuredFromStrapi) {
                    // 保留標題（如果有的話）
                    const existingTitle = featuredSection.querySelector('h2, .pixel-title, .section-title');
                    featuredSection.innerHTML = featuredFromStrapi.innerHTML;
                    // 如果原標題存在但 Strapi 內容沒有標題，保留原標題
                    if (existingTitle && !featuredFromStrapi.querySelector('h2, .pixel-title, .section-title')) {
                        featuredSection.insertBefore(existingTitle, featuredSection.firstChild);
                    }
                    console.log(`✅ 已更新 ${site} 的 Featured Posts section (${selector})`);
                    break;
                }
            }
        }
        
        // 如果沒有找到特定的 section，嘗試替換整個 main 內容（但保留 aside）
        if (!heroSection && !featuredSection) {
            const mainElement = document.querySelector('main');
            const mainFromStrapi = tempDiv.querySelector('main');
            if (mainElement && mainFromStrapi) {
                // 只替換 main 的內容，不替換整個 main（保留 aside）
                mainElement.innerHTML = mainFromStrapi.innerHTML;
                console.log(`✅ 已更新 ${site} 的 main 內容（從 Page API）`);
            }
        }
        
        // 如果 Strapi 有提供 imageUrl，更新首頁的 Hero 圖片
        if (pageData.imageUrl) {
            // 查找 Hero section 中的圖片
            const heroImg = document.querySelector('.retro-hero img, .hero img, .hero-section img, section.hero img, .hero-card img');
            if (heroImg) {
                heroImg.src = pageData.imageUrl;
                console.log(`✅ 已更新 ${site} 的 Hero 圖片: ${pageData.imageUrl}`);
            }
        }
        
        console.log(`✅ 已更新 ${site} 的首頁內容（從 Page API）`);
    } catch (error) {
        console.error(`❌ 載入 ${site} 首頁內容失敗:`, error);
    }
}

// =========================================================
// 更新導覽列中的「每日精選文章」連結為最新文章
// =========================================================

async function updateNavDailyLink(site) {
    try {
        console.log(`🔍 開始更新 ${site} 導覽列中的「每日精選文章」連結...`);
        
        // 直接查詢 Strapi API，根據自訂欄位 date（若沒有則用 updatedAt / publishedAt）取得最近的每日文章，只看 isFeatured=true
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&filters[isFeatured][$eq]=true&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc&pagination[limit]=1`;
        const headers = { 'Content-Type': 'application/json' };
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        if (!response.ok) {
            console.warn(`⚠️  查詢 ${site} 最新文章失敗 (${response.status})，跳過更新導覽列連結`);
            return;
        }
        
        const data = await response.json();
        const posts = data.data || [];
        if (posts.length === 0) {
            console.warn(`⚠️  ${site} 沒有找到每日文章，跳過更新導覽列連結`);
            return;
        }
        
        const post = posts[0];
        const attrs = getPostAttributes(post);
        const latestSlug = attrs.slug;
        
        if (!latestSlug) {
            console.warn(`⚠️  最新文章沒有 slug，跳過更新導覽列連結`);
            return;
        }
        
        console.log(`✅ 找到最新文章: ${latestSlug}`);
        
        // 查找所有導覽列連結（更廣泛的選擇器）
        const navLinks = document.querySelectorAll('nav a, .nav-menu a, .nav-links a, header a, .header a');
        let updatedCount = 0;
        
        navLinks.forEach(link => {
            const linkText = link.textContent.trim();
            // 匹配「每日精選文章」或包含「每日精選」的文字
            if (linkText === '每日精選文章' || linkText.includes('每日精選')) {
                const currentHref = link.getAttribute('href');
                if (!currentHref) return;
                
                console.log(`🔍 找到「每日精選文章」連結: ${currentHref}`);
                
                // 判斷路徑格式並生成新連結
                let newHref;
                
                // 情況1: articles/2025-12-03.html 或 ../articles/2025-12-03.html
                if (currentHref.includes('articles/')) {
                    newHref = currentHref.replace(/articles\/\d{4}-\d{2}-\d{2}\.html/, `articles/${latestSlug}.html`);
                }
                // 情況2: 2025-12-03.html (在 articles 目錄內，相對路徑)
                else if (/\d{4}-\d{2}-\d{2}\.html$/.test(currentHref)) {
                    // 提取路徑前綴（如果有）
                    const pathPrefix = currentHref.replace(/\d{4}-\d{2}-\d{2}\.html$/, '');
                    newHref = pathPrefix + `${latestSlug}.html`;
                }
                // 情況3: 其他格式，使用預設
                else {
                    // 判斷當前頁面是否在 articles 目錄內
                    const isInArticlesDir = window.location.pathname.includes('/articles/');
                    if (isInArticlesDir) {
                        newHref = `${latestSlug}.html`;
                    } else {
                        newHref = `articles/${latestSlug}.html`;
                    }
                }
                
                if (currentHref !== newHref) {
                    link.setAttribute('href', newHref);
                    updatedCount++;
                    console.log(`  ✅ 已更新連結: ${currentHref} → ${newHref}`);
                } else {
                    console.log(`  ℹ️  連結已經是正確的: ${currentHref}`);
                }
            }
        });
        
        if (updatedCount > 0) {
            console.log(`✅ 已更新 ${site} 導覽列中的「每日精選文章」連結: ${latestSlug} (${updatedCount} 個連結)`);
        } else {
            console.log(`ℹ️  ${site} 導覽列中沒有找到需要更新的「每日精選文章」連結`);
        }
    } catch (error) {
        console.error(`❌ 更新 ${site} 導覽列連結失敗:`, error);
    }
}

// =========================================================
// 自動執行：根據 data-site 屬性載入對應站點內容
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    // 找到帶有 data-site 屬性的 script 標籤
    const scriptTag = document.querySelector('script[data-site]');
    if (!scriptTag) {
        console.warn('⚠️ 找不到帶有 data-site 屬性的 script 標籤');
        return;
    }
    
    const site = scriptTag.getAttribute('data-site');
    if (!site) {
        console.warn('⚠️ data-site 屬性為空');
        return;
    }
    
    console.log(`🚀 開始載入 ${site} 的 Strapi 內容...`);
    
    // 同時載入：首頁內容（Page）、每日精選（Post）、精選攻略（Post）
    Promise.all([
        loadHomePageFromStrapi(site),  // 從 Page API 載入首頁內容
        loadDailyForSite(site),        // 從 Post API 載入每日精選
        loadFixedForSite(site)         // 從 Post API 載入精選攻略
    ]).then(() => {
        console.log(`✅ ${site} 的 Strapi 內容載入完成！`);
        // 載入完成後，更新導覽列中的「每日精選文章」連結
        updateNavDailyLink(site);
    }).catch((error) => {
        console.error(`❌ ${site} 的 Strapi 內容載入失敗:`, error);
    });
});

