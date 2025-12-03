// =========================================================
// 通用導覽列「每日精選文章」連結更新腳本
// 適用於所有頁面：首頁、文章頁、靜態頁面、查看所有文章頁
// =========================================================

// 配置：請根據你的 Strapi 設定修改
const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = '';

// =========================================================
// 工具函數：從 URL 判斷站點
// =========================================================

function getSiteFromPath() {
    const path = window.location.pathname;
    const match = path.match(/\/(site\d+)\//);
    if (match) {
        return match[1];
    }
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
// 更新導覽列中的「每日精選文章」連結為最新文章
// =========================================================

async function updateNavDailyLink(site) {
    try {
        console.log(`🔍 開始更新 ${site} 導覽列中的「每日精選文章」連結...`);
        
        // 使用 updatedAt 排序，獲取最近更新的文章
        let url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=updatedAt:desc&pagination[limit]=1`;
        const headers = { 'Content-Type': 'application/json' };
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        let response = await fetch(url, { headers });
        
        // 如果 updatedAt 排序失敗（可能字段不存在），嘗試使用 publishedAt
        if (!response.ok || response.status === 400) {
            console.log(`⚠️  嘗試使用 updatedAt 排序失敗，改用 publishedAt`);
            url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=publishedAt:desc&pagination[limit]=1`;
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
                    // 保留路徑前綴（如 ../）
                    const prefix = currentHref.match(/^\.\.\//) ? '../' : '';
                    newHref = prefix + `articles/${latestSlug}.html`;
                    // 如果原本是 articles/xxx.html，直接替換
                    if (!currentHref.startsWith('../')) {
                        newHref = currentHref.replace(/articles\/\d{4}-\d{2}-\d{2}\.html/, `articles/${latestSlug}.html`);
                    }
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
// 自動執行：頁面載入時立即更新導覽列連結
// =========================================================

// 如果頁面已經載入，立即執行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        const site = getSiteFromPath();
        updateNavDailyLink(site);
    });
} else {
    // 如果頁面已經載入完成，立即執行
    const site = getSiteFromPath();
    updateNavDailyLink(site);
}

