// =========================================================
// 動態更新導覽列中的「每日精選文章」連結為最新文章
// 在所有頁面載入時自動執行
// =========================================================

// 配置：請根據你的 Strapi 設定修改
const STRAPI_URL = 'http://localhost:1337'; // 如果 Strapi 在遠端，改成你的 Strapi URL
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

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
// 從 Strapi 獲取最新的每日文章
// =========================================================

async function fetchLatestDailyArticle(site) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=publishedAt:desc&pagination[limit]=1`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ 查詢 ${site} 最新文章失敗 (${response.status})`);
            return null;
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        if (posts.length > 0) {
            const post = posts[0];
            const attrs = getPostAttributes(post);
            return attrs.slug;
        }
        
        return null;
    } catch (error) {
        console.error(`❌ 查詢 ${site} 最新文章失敗:`, error.message);
        return null;
    }
}

// =========================================================
// 更新導覽列中的「每日精選文章」連結
// =========================================================

async function updateNavDailyLink() {
    const site = getSiteFromPath();
    
    try {
        // 獲取最新的每日文章 slug
        const latestSlug = await fetchLatestDailyArticle(site);
        
        if (!latestSlug) {
            console.warn(`⚠️  ${site} 沒有找到每日文章，跳過更新導覽列連結`);
            return;
        }
        
        // 查找所有「每日精選文章」連結並更新
        const navLinks = document.querySelectorAll('nav a, .nav-menu a, .nav-links a, header a');
        let updatedCount = 0;
        
        navLinks.forEach(link => {
            const linkText = link.textContent.trim();
            if (linkText === '每日精選文章' || linkText.includes('每日精選')) {
                const currentHref = link.getAttribute('href');
                if (!currentHref) return;
                
                // 判斷是相對路徑還是絕對路徑
                let newHref;
                if (currentHref.includes('articles/')) {
                    // 格式: articles/2025-12-03.html 或 ../articles/2025-12-03.html
                    newHref = currentHref.replace(/articles\/\d{4}-\d{2}-\d{2}\.html/, `articles/${latestSlug}.html`);
                } else if (/^\d{4}-\d{2}-\d{2}\.html$/.test(currentHref)) {
                    // 格式: 2025-12-03.html (在 articles 目錄內)
                    newHref = `${latestSlug}.html`;
                } else {
                    // 預設格式
                    newHref = `articles/${latestSlug}.html`;
                }
                
                if (currentHref !== newHref) {
                    link.setAttribute('href', newHref);
                    updatedCount++;
                }
            }
        });
        
        if (updatedCount > 0) {
            console.log(`✅ 已更新 ${site} 導覽列中的「每日精選文章」連結: ${latestSlug} (${updatedCount} 個連結)`);
        }
    } catch (error) {
        console.error(`❌ 更新 ${site} 導覽列連結失敗:`, error);
    }
}

// =========================================================
// 自動執行：頁面載入時更新導覽列連結
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    // 延遲執行，確保其他腳本已載入
    setTimeout(() => {
        updateNavDailyLink();
    }, 500);
});

