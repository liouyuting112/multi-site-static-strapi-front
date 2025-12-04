// =========================================================
// Strapi CMS 所有每日文章列表頁面載入腳本
// =========================================================

// 配置：請根據你的 Strapi 設定修改
const STRAPI_URL = 'https://tidy-fireworks-ad201d981a.strapiapp.com'; // Strapi Cloud URL
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

const ITEMS_PER_PAGE = 10; // 每頁顯示 10 篇文章

// =========================================================
// 工具函數：從 URL 判斷站點
// =========================================================

function getSiteFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(site\d+)\//);
    if (match) {
        return match[1];
    }
    // 如果沒有 siteX 在路徑中，嘗試從當前目錄判斷
    const pathParts = path.split('/');
    for (const part of pathParts) {
        if (part.startsWith('site') && /^site\d+$/.test(part)) {
            return part;
        }
    }
    return 'site1'; // 預設
}

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

function extractFirstParagraph(htmlContent, maxLength = 28) {
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
        return text.substring(0, maxLength) + '...';
    }
    return text;
    
}

// =========================================================
// 工具函數：獲取文章描述（與 home-cms.js 一致）
// =========================================================

function getArticleDescription(post) {
    const p = post;
    if (p.excerpt) {
        return p.excerpt.length > 28 ? p.excerpt.substring(0, 28) + '...' : p.excerpt;
    }
    if (p.html) {
        return extractFirstParagraph(p.html, 28);
    }
    return '';
}

// =========================================================
// 工具函數：從 Strapi 抓取所有每日文章（分頁）
// =========================================================

async function fetchAllDailyPosts(site, page = 1) {
    try {
        // 確保排序是降序（最新的在上面）：sort=publishedAt:desc
        // 顯示所有每日文章（包括最新的和過去的）
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=publishedAt:desc&pagination[page]=${page}&pagination[pageSize]=${ITEMS_PER_PAGE}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ Strapi API 錯誤 (${response.status}):`, await response.text());
            return { data: [], meta: { pagination: { page: 1, pageSize: ITEMS_PER_PAGE, total: 0, pageCount: 0 } } };
        }
        
        const result = await response.json();
        
        // 確保客戶端排序也是降序（最新的在上面）
        if (result.data && Array.isArray(result.data)) {
            result.data.sort((a, b) => {
                const attrsA = getPostAttributes(a);
                const attrsB = getPostAttributes(b);
                const dateA = attrsA.date || attrsA.publishedAt || attrsA.createdAt || '';
                const dateB = attrsB.date || attrsB.publishedAt || attrsB.createdAt || '';
                const timeA = dateA ? new Date(dateA).getTime() : 0;
                const timeB = dateB ? new Date(dateB).getTime() : 0;
                // 降序排序：最新的在上面（timeB - timeA）
                return timeB - timeA;
            });
        }
        
        console.log(`✅ 成功從 Strapi 抓取所有每日文章 (第 ${page} 頁):`, result);
        return result;
    } catch (error) {
        console.error(`❌ 抓取 Strapi 資料失敗 (${site}):`, error);
        return { data: [], meta: { pagination: { page: 1, pageSize: ITEMS_PER_PAGE, total: 0, pageCount: 0 } } };
    }
}

// =========================================================
// 載入所有每日文章列表
// =========================================================

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

async function loadAllDailyArticles(page = 1) {
    if (isLoading) return;
    
    const site = getSiteFromPath();
    const container = document.querySelector('.all-daily-articles-list, main, .articles-list');
    
    if (!container) {
        console.warn('⚠️ 找不到文章列表容器');
        return;
    }
    
    isLoading = true;
    
    try {
        const result = await fetchAllDailyPosts(site, page);
        const posts = result.data || [];
        const pagination = result.meta?.pagination || { page: 1, pageSize: ITEMS_PER_PAGE, total: 0, pageCount: 0 };
        
        totalPages = pagination.pageCount || 1;
        currentPage = page;
        
        if (posts.length === 0 && page === 1) {
            container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #666;">目前沒有每日文章</p>';
            return;
        }
        
        // 如果是第一頁，清空容器；否則追加
        if (page === 1) {
            container.innerHTML = '';
        }
        
        // 根據不同站點創建對應的容器結構
        let listContainer = null;
        let containerType = null;
        
        // 檢查是否已有對應的列表容器，如果沒有則創建
        if (site === 'site1') {
            // site1: 使用 .widget-list 結構
            listContainer = container.querySelector('.widget-list');
            if (!listContainer) {
                listContainer = document.createElement('ul');
                listContainer.className = 'widget-list';
                container.appendChild(listContainer);
            }
            containerType = 'site1';
        } else if (site === 'site2') {
            // site2: 使用 .daily-article-list 結構
            listContainer = container.querySelector('.daily-article-list');
            if (!listContainer) {
                listContainer = document.createElement('ul');
                listContainer.className = 'daily-article-list';
                container.appendChild(listContainer);
            }
            containerType = 'site2';
        } else if (site === 'site3') {
            // site3: 使用 .daily-grid 結構
            listContainer = container.querySelector('.daily-grid');
            if (!listContainer) {
                listContainer = document.createElement('div');
                listContainer.className = 'daily-grid';
                container.appendChild(listContainer);
            }
            containerType = 'site3';
        } else if (site === 'site4') {
            // site4: 使用 .daily-article-list 結構（但樣式不同）
            listContainer = container.querySelector('.daily-article-list');
            if (!listContainer) {
                listContainer = document.createElement('ul');
                listContainer.className = 'daily-article-list';
                container.appendChild(listContainer);
            }
            containerType = 'site4';
        } else if (site === 'site5') {
            // site5: 使用 .feed-list 結構
            listContainer = container.querySelector('.feed-list');
            if (!listContainer) {
                listContainer = document.createElement('div');
                listContainer.className = 'feed-list';
                container.appendChild(listContainer);
            }
            containerType = 'site5';
        } else {
            // 預設：使用 site1 的結構
            listContainer = container.querySelector('.widget-list');
            if (!listContainer) {
                listContainer = document.createElement('ul');
                listContainer.className = 'widget-list';
                container.appendChild(listContainer);
            }
            containerType = 'site1';
        }
        
        // 渲染文章列表（使用與首頁相同的結構）
        posts.forEach((item) => {
            const p = getPostAttributes(item);
            
            // 日期
            let date = '';
            const dateSource = p.date || p.publishedAt || p.createdAt;
            if (dateSource) {
                const d = new Date(dateSource);
                if (!isNaN(d.getTime())) {
                    date = d.toISOString().split('T')[0];
                }
            }
            
            // 圖片 URL（與 home-cms.js 邏輯一致）
            let imgUrl = p.imageUrl || '';
            if (!imgUrl) {
                let imgName = 'daily1';
                if (p.slug && typeof p.slug === 'string') {
                    if (p.slug.includes('12-03')) {
                        imgName = 'daily3';
                    } else if (p.slug.includes('12-02')) {
                        imgName = 'daily2';
                    }
                }
                imgUrl = `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgName}.webp?raw=true`;
            }
            
            // 描述（與 home-cms.js 一致，28 字）
            const description = getArticleDescription(p);
            
            // 根據不同站點生成不同的 HTML 結構（與首頁一致）
            if (containerType === 'site1') {
                // site1: <li> with .widget-img and .widget-text
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="articles/${p.slug}.html">
                        <div class="widget-img">
                            <img src="${imgUrl}" alt="${p.title || ''}" loading="lazy">
                        </div>
                        <div class="widget-text">
                            <h4>${p.title || '無標題'}</h4>
                            <p>${description}</p>
                            ${date ? `<span class="date">${date}</span>` : ''}
                        </div>
                    </a>
                `;
                listContainer.appendChild(li);
            } else if (containerType === 'site2') {
                // site2: <li> with .daily-card-img and .daily-card-content
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="articles/${p.slug}.html">
                        <img src="${imgUrl}" class="daily-card-img" alt="${p.title || ''}" loading="lazy">
                        <div class="daily-card-content">
                            <h3>${p.title || '無標題'}</h3>
                            <p>${description}</p>
                            ${date ? `<span class="publish-date">${date}</span>` : ''}
                        </div>
                    </a>
                `;
                listContainer.appendChild(li);
            } else if (containerType === 'site3') {
                // site3: <a> with .daily-item, .item-image, .item-info
                const a = document.createElement('a');
                a.href = `articles/${p.slug}.html`;
                a.className = 'daily-item';
                a.innerHTML = `
                    <div class="item-image">
                        <img src="${imgUrl}" alt="${p.title || ''}" loading="lazy">
                    </div>
                    <div class="item-info">
                        <h3>${p.title || '無標題'}</h3>
                        <p>${description}</p>
                        ${date ? `<span class="meta-date">${date}</span>` : ''}
                    </div>
                `;
                listContainer.appendChild(a);
            } else if (containerType === 'site4') {
                // site4: <li> with .daily-link and .daily-content (無圖片)
                const li = document.createElement('li');
                li.innerHTML = `
                    <a href="articles/${p.slug}.html" class="daily-link">
                        <div class="daily-content">
                            <h3>${p.title || '無標題'}</h3>
                            <p>${description}</p>
                            ${date ? `<span class="publish-date">${date}</span>` : ''}
                        </div>
                    </a>
                `;
                listContainer.appendChild(li);
            } else if (containerType === 'site5') {
                // site5: <a> with .feed-item, .feed-icon, .feed-content
                const a = document.createElement('a');
                a.href = `articles/${p.slug}.html`;
                a.className = 'feed-item';
                a.innerHTML = `
                    <div class="feed-icon">
                        <img src="${imgUrl}" alt="${p.title || ''}" loading="lazy">
                    </div>
                    <div class="feed-content">
                        <h3>${p.title || '無標題'}</h3>
                        <p>${description}</p>
                        ${date ? `<span class="time-ago">${date}</span>` : ''}
                    </div>
                `;
                listContainer.appendChild(a);
            }
        });
        
        // 添加分頁控制（如果有多頁）
        if (totalPages > 1) {
            let paginationDiv = container.querySelector('.pagination');
            if (!paginationDiv) {
                paginationDiv = document.createElement('div');
                paginationDiv.className = 'pagination';
                paginationDiv.style.cssText = 'margin-top: 2rem; text-align: center; padding: 1rem;';
                container.appendChild(paginationDiv);
            }
            
            paginationDiv.innerHTML = '';
            
            // 上一頁按鈕
            if (currentPage > 1) {
                const prevBtn = document.createElement('button');
                prevBtn.textContent = '← 上一頁';
                prevBtn.style.cssText = 'margin-right: 1rem; padding: 0.5rem 1rem; cursor: pointer;';
                prevBtn.onclick = () => loadAllDailyArticles(currentPage - 1);
                paginationDiv.appendChild(prevBtn);
            }
            
            // 頁碼顯示
            const pageInfo = document.createElement('span');
            pageInfo.textContent = `第 ${currentPage} 頁 / 共 ${totalPages} 頁`;
            pageInfo.style.cssText = 'margin: 0 1rem;';
            paginationDiv.appendChild(pageInfo);
            
            // 下一頁按鈕
            if (currentPage < totalPages) {
                const nextBtn = document.createElement('button');
                nextBtn.textContent = '下一頁 →';
                nextBtn.style.cssText = 'margin-left: 1rem; padding: 0.5rem 1rem; cursor: pointer;';
                nextBtn.onclick = () => loadAllDailyArticles(currentPage + 1);
                paginationDiv.appendChild(nextBtn);
            }
        }
        
        console.log(`✅ 已載入第 ${page} 頁，共 ${posts.length} 篇文章`);
    } catch (error) {
        console.error('❌ 載入文章失敗:', error);
    } finally {
        isLoading = false;
    }
}

// =========================================================
// 自動執行：頁面載入時執行
// =========================================================

// =========================================================
// 更新導覽列中的「每日精選文章」連結為最新文章
// =========================================================

async function updateNavDailyLink(site) {
    try {
        console.log(`🔍 開始更新 ${site} 導覽列中的「每日精選文章」連結...`);
        
        // 依照自訂欄位 date（若沒有則用 updatedAt / publishedAt）取得最近的每日文章（只看 isFeatured=true）
        // 嘗試先用 date > updatedAt > publishedAt 排序，如果失敗再退回只用 publishedAt
        let url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&filters[isFeatured][$eq]=true&sort=date:desc&sort=updatedAt:desc&sort=publishedAt:desc&pagination[limit]=1`;
        const headers = { 'Content-Type': 'application/json' };
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        let response = await fetch(url, { headers });
        
        // 如果 date / updatedAt 排序失敗（可能字段不存在），嘗試僅用 publishedAt
        if (!response.ok || response.status === 400) {
            console.log(`⚠️  嘗試使用 date / updatedAt 排序失敗，改用 publishedAt`);
            url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&filters[isFeatured][$eq]=true&sort=publishedAt:desc&pagination[limit]=1`;
            response = await fetch(url, { headers });
        }
        
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
// 自動執行：頁面載入時執行
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 all-daily-articles-cms.js 已載入');
    
    const site = getSiteFromPath();
    
    // 立即更新導覽列連結
    updateNavDailyLink(site);
    
    // 載入所有每日文章
    loadAllDailyArticles(1);
});

