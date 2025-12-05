// Tina CMS 初始化腳本
// 將現有的 HTML 內容轉換為 Tina CMS 格式

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 建立 content 目錄結構
const contentDir = path.join(__dirname, 'content');
const postsDir = path.join(contentDir, 'posts');
const pagesDir = path.join(contentDir, 'pages');

// 確保目錄存在
[contentDir, postsDir, pagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// 提取文章 HTML 內容
function extractArticleHtml(htmlContent) {
    const articleMatch = htmlContent.match(/<article[^>]*class="article-content"[^>]*>([\s\S]*?)<\/article>/i);
    if (articleMatch) {
        let content = articleMatch[1].trim();
        content = content.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
        return content;
    }
    return null;
}

// 提取標題
function extractTitle(htmlContent) {
    const titleMatch = htmlContent.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch) {
        return titleMatch[1].replace(/\s*\|\s*[^|]+$/, '').trim();
    }
    return null;
}

// 轉換 HTML 為 Tina CMS 格式（MDX）
function convertToMDX(htmlContent, frontmatter) {
    const frontmatterStr = Object.entries(frontmatter)
        .map(([key, value]) => {
            if (value === null || value === undefined) return '';
            if (typeof value === 'boolean') return `${key}: ${value}`;
            if (typeof value === 'string') return `${key}: "${value}"`;
            return `${key}: ${value}`;
        })
        .filter(Boolean)
        .join('\n');
    
    return `---\n${frontmatterStr}\n---\n\n${htmlContent}`;
}

// 處理文章
function processPosts() {
    console.log('📝 處理 Posts...\n');
    
    const fixedArticles = {
        site1: ['retro-vs-modern', 'collector-guide', 'cartridge-care'],
        site2: ['monitor-hz', 'keyboard-switches', 'aim-training'],
        site3: ['narrative-games', 'pixel-art', 'steam-wishlist'],
        site4: ['100-percent-guide', 'open-world-map', 'souls-like-combat'],
        site5: ['f2p-guide', 'phone-heating', 'portrait-games']
    };
    
    let count = 0;
    
    // 處理固定文章
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const fixed = fixedArticles[site] || [];
        
        for (const slug of fixed) {
            const filePath = path.join(__dirname, site, 'articles', `${slug}.html`);
            if (!fs.existsSync(filePath)) continue;
            
            const html = fs.readFileSync(filePath, 'utf-8');
            const title = extractTitle(html);
            const content = extractArticleHtml(html);
            
            if (!title || !content) continue;
            
            const frontmatter = {
                site,
                category: 'fixed',
                slug,
                title,
            };
            
            const mdxContent = convertToMDX(content, frontmatter);
            const outputPath = path.join(postsDir, `${site}-${slug}.mdx`);
            fs.writeFileSync(outputPath, mdxContent, 'utf-8');
            count++;
            console.log(`  ✅ ${site}/${slug}`);
        }
    }
    
    // 處理每日文章
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const articlesDir = path.join(__dirname, site, 'articles');
        if (!fs.existsSync(articlesDir)) continue;
        
        const files = fs.readdirSync(articlesDir)
            .filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f));
        
        for (const file of files) {
            const slug = file.replace('.html', '');
            const filePath = path.join(articlesDir, file);
            const html = fs.readFileSync(filePath, 'utf-8');
            const title = extractTitle(html);
            const content = extractArticleHtml(html);
            
            if (!title || !content) continue;
            
            const frontmatter = {
                site,
                category: 'daily',
                slug,
                title,
                date: slug,
                isFeatured: true,
            };
            
            const mdxContent = convertToMDX(content, frontmatter);
            const outputPath = path.join(postsDir, `${site}-${slug}.mdx`);
            fs.writeFileSync(outputPath, mdxContent, 'utf-8');
            count++;
            console.log(`  ✅ ${site}/${slug}`);
        }
    }
    
    console.log(`\n✅ 已處理 ${count} 篇文章\n`);
}

// 處理頁面
function processPages() {
    console.log('📄 處理 Pages...\n');
    
    const pageTypes = [
        { type: 'home', file: 'index.html', slug: 'index' },
        { type: 'about', file: 'about.html', slug: 'about' },
        { type: 'contact', file: 'contact.html', slug: 'contact' },
        { type: 'privacy', file: 'privacy.html', slug: 'privacy' }
    ];
    
    let count = 0;
    
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        
        for (const pageType of pageTypes) {
            const filePath = path.join(__dirname, site, pageType.file);
            if (!fs.existsSync(filePath)) continue;
            
            const html = fs.readFileSync(filePath, 'utf-8');
            const title = extractTitle(html);
            
            // 提取 <main> 內容
            const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
            const content = mainMatch ? mainMatch[1].trim() : '';
            
            if (!title || !content) continue;
            
            const frontmatter = {
                site,
                type: pageType.type,
                slug: pageType.slug,
                title,
            };
            
            const mdxContent = convertToMDX(content, frontmatter);
            const outputPath = path.join(pagesDir, `${site}-${pageType.type}.mdx`);
            fs.writeFileSync(outputPath, mdxContent, 'utf-8');
            count++;
            console.log(`  ✅ ${site}/${pageType.type}`);
        }
    }
    
    console.log(`\n✅ 已處理 ${count} 個頁面\n`);
}

// 主程序
console.log('🚀 開始初始化 Tina CMS 內容...\n');
processPosts();
processPages();
console.log('✅ 初始化完成！');
console.log('\n📋 下一步：');
console.log('1. 安裝 Tina CMS: npm install tinacms @tinacms/cli');
console.log('2. 設定 Tina Cloud 或使用本地模式');
console.log('3. 執行: npx tinacms dev');



