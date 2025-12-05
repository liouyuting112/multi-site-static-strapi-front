// 自動為 Strapi 中的文章建立 HTML 檔案（如果不存在）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = '446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

// 文章頁面模板
function getArticleTemplate(site, slug, title) {
    // 根據不同站點使用不同的模板
    const siteConfig = {
        site1: {
            siteName: '懷舊時光機',
            siteTitle: '像素時光',
            navLinks: `
                    <li><a href="../index.html" class="active">首頁</a></li>
                    <li class="dropdown">
                        <a href="#">收藏指南 ▾</a>
                        <ul class="dropdown-menu">
                            <li><a href="cartridge-care.html">卡帶保養術</a></li>
                            <li><a href="collector-guide.html">新手收藏指南</a></li>
                            <li><a href="retro-vs-modern.html">老遊戲的魅力</a></li>
                        </ul>
                    </li>
                    <li><a href="2025-12-03.html">每日精選文章</a></li>
                    <li><a href="../about.html">關於我們</a></li>
                    <li><a href="../contact.html">聯絡我們</a></li>
            `
        }
    };
    
    const config = siteConfig[site] || siteConfig.site1;
    
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} | ${config.siteTitle}</title>
    <meta name="description" content="${title}">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <header>
        <div class="container header-inner">
            <div class="logo"><a href="../index.html">${config.siteName}</a></div>
            <button class="menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <nav class="nav-menu">
                <ul>
                    ${config.navLinks}
                </ul>
            </nav>
        </div>
    </header>

    <main class="container">
        <article class="article-content">
            <!-- 內容會從 Strapi 動態載入 -->
            <h1>${title}</h1>
            <p>載入中...</p>
        </article>
    </main>

    <footer>
        <div class="container">
            <p>&copy; 2025 ${config.siteName}.</p>
        </div>
    </footer>

    <script src="../js/main.js"></script>
    <script src="../../article-cms.js"></script>
</body>
</html>`;
}

async function fetchAllPosts() {
    try {
        const response = await fetch(`${STRAPI_URL}/api/posts?pagination[limit]=1000`, {
            headers
        });
        
        if (!response.ok) {
            console.error(`❌ 無法取得 Strapi 文章 (${response.status})`);
            return [];
        }
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
        return [];
    }
}

async function createMissingPages() {
    console.log('🚀 開始檢查並建立缺少的文章 HTML 檔案...\n');
    
    // 1. 取得 Strapi 中的所有文章
    console.log('1. 從 Strapi 取得文章列表...');
    const posts = await fetchAllPosts();
    console.log(`   找到 ${posts.length} 篇文章\n`);
    
    let created = 0;
    let existing = 0;
    
    // 2. 檢查每個文章是否有對應的 HTML 檔案
    for (const post of posts) {
        const attrs = post.attributes || post;
        const site = attrs.site;
        const slug = attrs.slug;
        const title = attrs.title || slug;
        
        const articlesDir = path.join(__dirname, site, 'articles');
        const htmlFile = path.join(articlesDir, `${slug}.html`);
        
        // 檢查檔案是否存在
        if (fs.existsSync(htmlFile)) {
            existing++;
            continue;
        }
        
        // 建立目錄（如果不存在）
        if (!fs.existsSync(articlesDir)) {
            fs.mkdirSync(articlesDir, { recursive: true });
        }
        
        // 建立 HTML 檔案
        const template = getArticleTemplate(site, slug, title);
        fs.writeFileSync(htmlFile, template, 'utf-8');
        
        console.log(`  ✅ 建立: ${site}/articles/${slug}.html`);
        created++;
    }
    
    console.log(`\n========================================`);
    console.log(`📊 完成 - 新增 ${created}，已存在 ${existing}`);
    console.log(`========================================\n`);
    
    if (created > 0) {
        console.log('💡 下一步：');
        console.log('   1. 檢查建立的檔案');
        console.log('   2. 推送到 GitHub: git add . && git commit -m "新增文章 HTML 檔案" && git push');
        console.log('   3. Vercel 會自動部署\n');
    }
}

createMissingPages().catch(console.error);



