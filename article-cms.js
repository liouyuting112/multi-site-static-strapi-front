// =========================================================
// Strapi CMS ?��??��?載入?�本
// =========================================================

console.log('✅ article-cms.js 已載入');

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

const STRAPI_URL = getStrapiUrl();
const STRAPI_API_TOKEN = ''; // 如果 Public 角色有權限，可以留空；否則填入 API Token

// =========================================================
// 工具?�數：統一?��? Strapi 資�?結�?
// =========================================================

function getPostAttributes(item) {
    // ?��??�種?�能?��??��?構�?
    // 1. 標�? Strapi v4: {id, attributes: {title, slug, ...}}
    // 2. ?�平結�?: {id, title, slug, ...}
    if (item.attributes) {
        return item.attributes;
    }
    // 如�??��?平�?構�??�接返�??��?item（除�?id�?
    const { id, documentId, ...attrs } = item;
    return attrs;
}

// =========================================================
// �?URL 路�??�斷站�??�稱
// =========================================================

function getSiteFromPath() {
    const path = window.location.pathname;
    // 例�?�?site1/articles/2025-12-01.html ??/articles/2025-12-01.html
    const match = path.match(/\/(site\d+)\//);
    if (match) {
        return match[1]; // 返�? site1, site2 �?
    }
    // 如�?沒�??��?，�?試�??��??��??�斷
    // 例�?：�??�路徑�???/site1/，�???site1
    const pathParts = path.split('/');
    const siteIndex = pathParts.findIndex(part => part.startsWith('site') && /^site\d+$/.test(part));
    if (siteIndex !== -1) {
        return pathParts[siteIndex];
    }
    // ?�設返�? site1
    console.warn('?��? ?��?從路徑判?��?點�??�設使用 site1');
    return 'site1';
}

// =========================================================
// �?URL ?��??��? slug
// =========================================================

function getSlugFromUrl() {
    const path = window.location.pathname;
    // 例�?�?site1/articles/2025-12-01.html ??/articles/2025-12-01.html
    const match = path.match(/\/([^\/]+)\.html$/);
    if (match) {
        return match[1]; // 返�? 2025-12-01 �?
    }
    return null;
}

// =========================================================
// �?Strapi ?��??��??��?
// =========================================================

async function fetchArticleFromStrapi(site, slug) {
    try {
        // 構建 API URL，使??Strapi ?�篩?��???
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // 如�???API Token，�???Authorization header
        if (STRAPI_API_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_API_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`??Strapi API ?�誤 (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        console.log(`???��?�?Strapi ?��??��? (${site} - ${slug}):`, data);
        
        // Strapi v4 ?��??��?構�?data ?�陣??
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            return data.data[0]; // 返�?第�?篇�?章�??�該?��?一篇�?
        }
        
        console.warn(`?��? ?��??��?�?(${site} - ${slug})`);
        return null;
    } catch (error) {
        console.error(`???��? Strapi ?��?失�? (${site} - ${slug}):`, error);
        return null;
    }
}

// =========================================================
// ?��? HTML ?�容（�? <article> 標籤中�??��??�直?�使?��?
// =========================================================

function extractArticleContent(htmlString) {
    if (!htmlString) {
        return null;
    }
    
    // ?�建?��? DOM 來解??HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // ?�試?�到 <article> 標籤
    const article = tempDiv.querySelector('article.article-content') || tempDiv.querySelector('article');
    
    if (article) {
        // 返�? <article> ?�部??HTML（�??�括 <article> 標籤?�身�?
        let content = article.innerHTML;
        // 移除 <h1> 標�?（�?�?title 欄�?載入�?
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
        return content;
    }
    
    // 如�?沒�? <article>，�?試找 <body> ?�容
    const body = tempDiv.querySelector('body');
    if (body) {
        let content = body.innerHTML;
        // 移除 <h1> 標�?
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
        return content;
    }
    
    // 如�??��??��??�接返�??��?HTML（可?�是純內容�?
    // 但�?要移??<h1>
    let content = htmlString;
    content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
    return content;
}

// =========================================================
// 載入?��??��??��???
// =========================================================

// 顯示??slug（網?�中�? 2025-12-01 等�???Strapi ?�部 slug ?��???
// ?��? Strapi 仍使??2025-12-01~03 作為 slug，�?網�?希�???2025-12-01~03
function mapDisplaySlugToStrapiSlug(slug) {
    // 直接返回 slug，因為 Strapi 中的 slug 已經是正確的格式
    // 不需要映射，直接使用 URL 中的 slug 查詢 Strapi
    return slug;
}

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

async function loadArticleContent() {
    const site = getSiteFromPath();
    const displaySlug = getSlugFromUrl();
    
    if (!displaySlug) {
        console.warn('?��? ?��?�?URL ?��??��? slug');
        return;
    }
    
    const slug = mapDisplaySlugToStrapiSlug(displaySlug);
    
    console.log(`?? ?��?載入?��??��? (${site} - 顯示 slug: ${displaySlug}, Strapi slug: ${slug})...`);
    
    // ?�到?��?容器（支?��?種�?構�?
    let articleContainer = document.querySelector('article.article-content');
    
    // 如�??��??��??�試?��?結�?
    if (!articleContainer) {
        articleContainer = document.querySelector('article');
    }
    
    // 如�??�是?��??��??�試 main > article
    if (!articleContainer) {
        const main = document.querySelector('main');
        if (main) {
            articleContainer = main.querySelector('article');
        }
    }
    
    // 如�??�是?��??��??�試 .post ??.post-content
    if (!articleContainer) {
        articleContainer = document.querySelector('.post') || document.querySelector('.post-content');
    }
    
    if (!articleContainer) {
        console.warn('⚠️  找不到文章容器，無法載入文章內容');
        return;
    }
    
    // �?Strapi ?��??��?
    const articleData = await fetchArticleFromStrapi(site, slug);
    
    if (!articleData) {
        console.log('?��? ?��?�?Strapi 載入?��?，�??��??��??��??�容');
        return;
    }
    
    const attrs = getPostAttributes(articleData);
    let htmlContent = attrs.html;
    
    // 如果有 imageUrl，在內容開頭插入圖片
    if (attrs.imageUrl && htmlContent) {
        // 檢查內容開頭是否已經有圖片
        if (!htmlContent.includes('<img') && !htmlContent.includes('hero-image')) {
            // 在內容開頭插入 hero image
            htmlContent = `<div class="hero-image" style="margin-bottom: 2rem;">
                <img src="${attrs.imageUrl}" alt="${attrs.title || ''}" style="width: 100%; height: auto;" loading="lazy">
            </div>\n\n${htmlContent}`;
        }
    }
    
    if (!htmlContent) {
        console.warn('⚠️  找不到 html 內容');
        return;
    }
    
    // 提取文章內容
    let extractedContent = extractArticleContent(htmlContent);
    
    if (!extractedContent) {
        console.warn('⚠️  無法提取文章內容');
        return;
    }
    
    // 移除?�能?��???<h1> 標�?（�? Strapi 載入?�內容中�?
    extractedContent = extractedContent.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '').trim();
    
    // 移除可能包含「發布於」「發佈於」等日期資訊的區塊，避免與頁面上原本日期重複
    // 為了避免正則亂碼問題，改用 DOM 方式處理，而不是複雜的正則
    try {
        const tempWrapper = document.createElement('div');
        tempWrapper.innerHTML = extractedContent;

        // 移除 class 為 meta / post-meta 的元素
        tempWrapper.querySelectorAll('.meta, .post-meta').forEach(el => el.remove());

        // 移除內文中直接包含「發布於」文字的段落 / span / div
        const textSelectors = ['p', 'span', 'div'];
        textSelectors.forEach(sel => {
            tempWrapper.querySelectorAll(sel).forEach(el => {
                const text = el.textContent || '';
                if (text.includes('發布於') || text.includes('發佈於')) {
                    el.remove();
                }
            });
        });

        extractedContent = tempWrapper.innerHTML.trim();
    } catch (e) {
        console.warn('⚠️  清理發布日期區塊時發生錯誤，略過處理', e);
    }
    
    // 更新頁面 <title>（如果有提供標題）
    if (attrs.title) {
        const siteTitle = document.title.split(' | ')[1] || '每日精選';
        document.title = `${attrs.title} | ${siteTitle}`;
    }
    
    // 保�??��??��?構�?如�???.post-header, .post-meta 等�?
    const existingHeader = articleContainer.querySelector('.post-header');
    const existingMeta = articleContainer.querySelector('.post-meta, .meta');
    const existingContent = articleContainer.querySelector('.post-content');
    
    // 清空?�本?�內�?
    articleContainer.innerHTML = '';
    
    // 如�??��??��?構�??�恢�?
    if (existingHeader) {
        articleContainer.appendChild(existingHeader);
        const h1InHeader = existingHeader.querySelector('h1');
        if (h1InHeader) {
            h1InHeader.textContent = attrs.title || '未命名文章';
        } else {
            const h1 = document.createElement('h1');
            h1.textContent = attrs.title || '未命名文章';
            existingHeader.insertBefore(h1, existingHeader.firstChild);
        }
    } else {
        // 插入標題（使用 title 欄位，只插入一次）
        const h1 = document.createElement('h1');
        h1.textContent = attrs.title || '未命名文章';
        articleContainer.appendChild(h1);
    }
    
    // 如�??��???meta，恢復�?
    if (existingMeta) {
        articleContainer.appendChild(existingMeta);
    }
    
    // 如�??��???content 容器，使?��?
    if (existingContent) {
        existingContent.innerHTML = extractedContent;
        articleContainer.appendChild(existingContent);
    } else {
        // ?�入�?Strapi 載入?�內容�?已�?移除�?<h1>�?
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = extractedContent;
        articleContainer.appendChild(contentDiv);
    }
    
    console.log(`??已�??��??��?章內??(${site} - ${slug})`);
}

// =========================================================
// ?��??��?：�??��??��??��?
// =========================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOMContentLoaded 事件觸發');
    
    const site = getSiteFromPath();
    
    // 立即更新導覽列連結（無論是否有文章容器）
    updateNavDailyLink(site);
    
    // 查找文章容器?��?�?
    let articleContainer = document.querySelector('article.article-content');
    
    // 如�??��??��??�試?��?結�?
    if (!articleContainer) {
        articleContainer = document.querySelector('article');
    }
    
    // 如�??�是?��??��??�試 main > article
    if (!articleContainer) {
        const main = document.querySelector('main');
        if (main) {
            articleContainer = main.querySelector('article');
        }
    }
    
    // 如�??�是?��??��??�試 .post ??.post-content
    if (!articleContainer) {
        articleContainer = document.querySelector('.post') || document.querySelector('.post-content');
    }
    
    if (articleContainer) {
        // 找到文章容器，開始載入文章內容
        console.log('✅ 找到文章容器，開始載入文章內容');
        // 載入文章內容
        loadArticleContent().then(() => {
            // 文章內容載入完成後，再次更新導覽列連結（確保是最新的）
            updateNavDailyLink(site);
        }).catch((error) => {
            console.error('❌ 載入文章內容失敗:', error);
            // 即使載入失敗，也再次嘗試更新導覽列連結
            setTimeout(() => {
                updateNavDailyLink(site);
            }, 100);
        });
        
        // 在文章下方的推薦區塊底部添加「查看所有文章」連結
        // 支援各站不同結構：.related-articles、.recommendations 或最後一個 <section>
        setTimeout(() => {
            let relatedSection =
                document.querySelector('.related-articles') ||
                document.querySelector('section.recommendations') ||
                document.querySelector('.recommendations');

            // 如果上述都沒找到，就退而求其次：抓 main 裡最後一個 section
            if (!relatedSection) {
                const main = document.querySelector('main');
                if (main) {
                    const sections = main.querySelectorAll('section');
                    if (sections.length > 0) {
                        relatedSection = sections[sections.length - 1];
                    }
                }
            }

            if (relatedSection) {
                let viewAllLink = relatedSection.querySelector('.view-all-articles');
                if (!viewAllLink) {
                    viewAllLink = document.createElement('a');
                    viewAllLink.className = 'view-all-articles';

                    // 根據所在站點決定 href（文章頁要回上一層）
                    const isInArticlesDir = window.location.pathname.includes('/articles/');
                    const href = isInArticlesDir ? '../all-daily-articles.html' : 'all-daily-articles.html';
                    viewAllLink.href = href;

                    // 根據 site 套不同風格（但統一靠右）
                    let styleText;
                    switch (site) {
                        case 'site1': // 懷舊時光機
                            styleText =
                                'display:block;text-align:right;margin-top:1rem;padding:0.5rem;' +
                                'color:#ff6b6b;text-decoration:none;font-size:0.9rem;font-family:var(--font-heading);';
                            break;
                        case 'site2': // 攻略圖書館
                            styleText =
                                'display:block;text-align:right;margin-top:1.2rem;padding:0.4rem 0;' +
                                'color:#1e6fd9;text-decoration:underline;font-size:0.95rem;font-weight:600;';
                            break;
                        case 'site3': // 獨立微光
                            styleText =
                                'display:block;text-align:right;margin-top:1.5rem;padding:0.5rem 0;border-top:1px dashed #ddd;' +
                                'color:#7b5cff;text-decoration:none;font-size:0.9rem;';
                            break;
                        case 'site4': // 攻略 / 電玩資訊
                            styleText =
                                'display:block;text-align:right;margin-top:1rem;padding:0.5rem 0;' +
                                'color:#00a870;text-decoration:none;font-size:0.85rem;letter-spacing:0.08em;text-transform:uppercase;';
                            break;
                        case 'site5': // 手遊速報
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
                    relatedSection.appendChild(viewAllLink);
                    console.log('✅ 已在文章推薦區塊添加「查看所有文章」連結', { site, href });
                }
            } else {
                console.log('ℹ️  找不到推薦區塊，略過添加「查看所有文章」連結');
            }
        }, 1000);
    } else {
        console.log('ℹ️  找不到文章容器，可能不是文章頁面');
    }
});



