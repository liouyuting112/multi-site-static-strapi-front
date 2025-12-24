// 從 Strapi 匯出文章到 GitHub
// 功能：從 Strapi 抓取文章，生成 HTML 檔案，並推送到 GitHub

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 動態載入 node-fetch
let fetch;
(async () => {
    const nodeFetch = await import('node-fetch');
    fetch = nodeFetch.default;
})();

// =========================================================
// 設定（從環境變數或預設值）
// =========================================================
const CONFIG = {
    // Strapi 設定
    STRAPI_URL: process.env.STRAPI_URL || 'http://localhost:1337',
    STRAPI_TOKEN: process.env.STRAPI_TOKEN || '6a02dd00859ce2861a884a1de0b5f7eaf4ee961b0e6bf0c07c7df72d47e1c9b142a07564ffadd433ffa9b851d14629989b07d72fb09457d775f3227cca99fbaee43200ccac7a0db7d6d65185ca71b317bae9d6c0db943abb50a9e3ed9f279e536c2acba98e2f642bb44f543d1c23fac24a131ec177f23d2d496715b9c5984c76',
    
    // GitHub 設定
    GITHUB_REPO_PATH: process.env.GITHUB_REPO_PATH || path.join(__dirname),
    GITHUB_AUTO_PUSH: process.env.GITHUB_AUTO_PUSH !== 'false', // 預設自動 push
    
    // 要匯出的站點（逗號分隔，或 'all' 表示全部）
    SITES: process.env.SITES || process.argv[2] || 'all',
    
    // 要匯出的日期（YYYY-MM-DD，預設今天）
    DATE: process.env.DATE || process.argv[3] || new Date().toISOString().split('T')[0],
    
    // 要匯出的類別（daily, fixed，或 'all' 表示全部）
    CATEGORY: process.env.CATEGORY || process.argv[4] || 'daily'
};

// =========================================================
// 從 Strapi 抓取所有站點列表
// =========================================================
async function fetchAllSites() {
    try {
        if (!fetch) {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        }
        
        const url = `${CONFIG.STRAPI_URL}/api/posts?` +
            `pagination[pageSize]=1000&` +
            `fields[0]=site&` +
            `sort=createdAt:desc`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`抓取站點失敗: ${response.status}`);
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        const sites = new Set();
        posts.forEach(post => {
            const attrs = post.attributes || post;
            if (attrs.site) {
                sites.add(attrs.site);
            }
        });
        
        return Array.from(sites).sort();
    } catch (error) {
        console.error('❌ 抓取站點列表失敗:', error.message);
        return [];
    }
}

// =========================================================
// 從 Strapi 抓取指定站點的文章
// =========================================================
async function fetchPostsFromStrapi(site, category, date = null) {
    try {
        if (!fetch) {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        }
        
        let url = `${CONFIG.STRAPI_URL}/api/posts?` +
            `filters[site][$eq]=${site}&` +
            `filters[category][$eq]=${category}&` +
            `sort=date:desc&pagination[pageSize]=100`;
        
        if (date) {
            url += `&filters[date][$eq]=${date}`;
        }
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`抓取文章失敗: ${response.status}`);
        }
        
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error(`❌ 抓取 ${site} 文章失敗:`, error.message);
        return [];
    }
}

// =========================================================
// 根據站點名稱找到對應的資料夾
// =========================================================
function findSiteFolder(site) {
    const rootDir = CONFIG.GITHUB_REPO_PATH;
    
    // 可能的資料夾名稱格式
    const possibleNames = [
        site, // 直接匹配，例如：sce010
        `星宿探索家${site}`, // 例如：星宿探索家sce010
        `星座解密站${site}`, // 例如：星座解密站cds006
        `占星智慧館${site}`, // 例如：占星智慧館awh008
        `數位生活館${site}`, // 例如：數位生活館dlh011
        `科學探索館${site}`, // 例如：科學探索館seh001
        `知識實驗室${site}`, // 例如：知識實驗室kel002
        `科普發現站${site}`, // 例如：科普發現站kfd003
        `科學觀察台${site}`, // 例如：科學觀察台sgo004
        `知識寶庫${site}`, // 例如：知識寶庫kst005
        `星象觀測台${site}`, // 例如：星象觀測台so007
        `星座運勢屋${site}` // 例如：星座運勢屋zfh009
    ];
    
    for (const name of possibleNames) {
        const folderPath = path.join(rootDir, name);
        if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
            return folderPath;
        }
    }
    
    // 如果找不到，嘗試搜尋所有資料夾
    const dirs = fs.readdirSync(rootDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);
    
    for (const dir of dirs) {
        if (dir.includes(site) || dir.endsWith(site)) {
            return path.join(rootDir, dir);
        }
    }
    
    return null;
}

// =========================================================
// 讀取 HTML 範本（從現有檔案或生成基本範本）
// =========================================================
function getArticleTemplate(siteFolder, site) {
    // 嘗試讀取現有的文章檔案作為範本
    const articlesDir = path.join(siteFolder, 'articles');
    if (fs.existsSync(articlesDir)) {
        const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.html'));
        if (files.length > 0) {
            const templatePath = path.join(articlesDir, files[0]);
            const template = fs.readFileSync(templatePath, 'utf8');
            return template;
        }
    }
    
    // 如果沒有現有檔案，生成基本範本
    return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}} | ${site}</title>
    <meta name="description" content="{{EXCERPT}}">
    <link rel="stylesheet" href="../css/style.css">
</head>
<body>
    <main>
        <article class="article-content">
            <div class="container">
                <h1>{{TITLE}}</h1>
                <div class="article-meta">
                    <span class="date">{{DATE}}</span>
                </div>
                <div class="article-body">
                    {{HTML_CONTENT}}
                </div>
            </div>
        </article>
    </main>
    <script src="../js/main.js"></script>
    <script src="../../article-cms.js"></script>
</body>
</html>`;
}

// =========================================================
// 生成文章 HTML 檔案
// =========================================================
function generateArticleHTML(post, siteFolder, site) {
    const attrs = post.attributes || post;
    const title = attrs.title || '無標題';
    const slug = attrs.slug || attrs.date || 'untitled';
    const htmlContent = attrs.html || '';
    const excerpt = attrs.excerpt || '';
    const date = attrs.date || attrs.publishedAt || new Date().toISOString().split('T')[0];
    
    // 讀取範本
    let template = getArticleTemplate(siteFolder, site);
    
    // 替換範本中的變數
    template = template
        .replace(/\{\{TITLE\}\}/g, title)
        .replace(/\{\{EXCERPT\}\}/g, excerpt)
        .replace(/\{\{DATE\}\}/g, date)
        .replace(/\{\{HTML_CONTENT\}\}/g, htmlContent);
    
    // 確保 articles 資料夾存在
    const articlesDir = path.join(siteFolder, 'articles');
    if (!fs.existsSync(articlesDir)) {
        fs.mkdirSync(articlesDir, { recursive: true });
    }
    
    // 決定檔案名稱（使用 slug 或日期）
    const fileName = slug.includes('-') && slug.match(/^\d{4}-\d{2}-\d{2}/) 
        ? `${slug}.html` 
        : `${date}.html`;
    
    const filePath = path.join(articlesDir, fileName);
    
    // 寫入檔案
    fs.writeFileSync(filePath, template, 'utf8');
    
    return filePath;
}

// =========================================================
// Git 操作
// =========================================================
function gitAddAndCommit(repoPath, message) {
    try {
        // 切換到 repo 目錄
        process.chdir(repoPath);
        
        // git add
        execSync('git add .', { stdio: 'inherit' });
        
        // git commit
        execSync(`git commit -m "${message}"`, { stdio: 'inherit' });
        
        console.log('✅ Git commit 成功');
        return true;
    } catch (error) {
        console.error('❌ Git 操作失敗:', error.message);
        return false;
    }
}

function gitPush(repoPath) {
    try {
        process.chdir(repoPath);
        
        // git push
        execSync('git push', { stdio: 'inherit' });
        
        console.log('✅ Git push 成功');
        return true;
    } catch (error) {
        console.error('❌ Git push 失敗:', error.message);
        return false;
    }
}

// =========================================================
// 匯出單一站點的文章
// =========================================================
async function exportSite(site) {
    console.log(`\n📌 處理站點: ${site}`);
    console.log('─'.repeat(50));
    
    // 找到站點資料夾
    const siteFolder = findSiteFolder(site);
    if (!siteFolder) {
        console.error(`❌ 找不到站點資料夾: ${site}`);
        return { success: false, exported: 0 };
    }
    
    console.log(`📁 站點資料夾: ${siteFolder}`);
    
    // 決定要匯出的類別
    const categories = CONFIG.CATEGORY === 'all' 
        ? ['daily', 'fixed'] 
        : [CONFIG.CATEGORY];
    
    let exportedCount = 0;
    
    for (const category of categories) {
        console.log(`\n📄 匯出類別: ${category}`);
        
        // 抓取文章
        const posts = await fetchPostsFromStrapi(site, category, CONFIG.DATE);
        
        if (posts.length === 0) {
            console.log(`  ⚠️  沒有找到 ${category} 文章`);
            continue;
        }
        
        console.log(`  ✅ 找到 ${posts.length} 篇文章`);
        
        // 生成 HTML 檔案
        for (const post of posts) {
            try {
                const filePath = generateArticleHTML(post, siteFolder, site);
                const relativePath = path.relative(CONFIG.GITHUB_REPO_PATH, filePath);
                console.log(`  ✅ 已生成: ${relativePath}`);
                exportedCount++;
            } catch (error) {
                console.error(`  ❌ 生成失敗:`, error.message);
            }
        }
    }
    
    return { success: true, exported: exportedCount };
}

// =========================================================
// 主程式
// =========================================================
async function main() {
    console.log('🚀 從 Strapi 匯出文章到 GitHub');
    console.log('='.repeat(50));
    console.log(`📍 Strapi: ${CONFIG.STRAPI_URL}`);
    console.log(`📁 GitHub Repo: ${CONFIG.GITHUB_REPO_PATH}`);
    console.log(`📅 日期: ${CONFIG.DATE}`);
    console.log(`📊 類別: ${CONFIG.CATEGORY}`);
    console.log('='.repeat(50));
    
    // 決定要處理的站點
    let sitesToProcess = [];
    
    if (CONFIG.SITES === 'all') {
        console.log('\n🔍 正在從 Strapi 抓取所有站點...');
        sitesToProcess = await fetchAllSites();
        console.log(`✅ 找到 ${sitesToProcess.length} 個站點: ${sitesToProcess.join(', ')}`);
    } else {
        sitesToProcess = CONFIG.SITES.split(',').map(s => s.trim()).filter(s => s);
        console.log(`\n📋 指定站點: ${sitesToProcess.join(', ')}`);
    }
    
    if (sitesToProcess.length === 0) {
        console.error('❌ 沒有找到要處理的站點');
        process.exit(1);
    }
    
    // 匯出所有站點
    const allResults = [];
    for (const site of sitesToProcess) {
        const result = await exportSite(site);
        allResults.push({ site, ...result });
    }
    
    // 統計
    const totalExported = allResults.reduce((sum, r) => sum + r.exported, 0);
    const successCount = allResults.filter(r => r.success).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 匯出結果摘要');
    console.log('='.repeat(50));
    console.log(`✅ 成功: ${successCount} 個站點`);
    console.log(`📄 總共匯出: ${totalExported} 篇文章`);
    
    // Git 操作
    if (totalExported > 0 && CONFIG.GITHUB_AUTO_PUSH) {
        console.log('\n📤 準備推送到 GitHub...');
        
        const commitMessage = `Auto: 匯出 ${totalExported} 篇文章 (${CONFIG.DATE})`;
        
        if (gitAddAndCommit(CONFIG.GITHUB_REPO_PATH, commitMessage)) {
            if (gitPush(CONFIG.GITHUB_REPO_PATH)) {
                console.log('\n✅ 所有檔案已成功推送到 GitHub！');
            }
        }
    } else if (totalExported > 0) {
        console.log('\n💡 提示：檔案已生成，但未自動推送到 GitHub');
        console.log('   請手動執行：git add . && git commit -m "..." && git push');
    }
    
    console.log('\n✅ 執行完成！');
    
    // 輸出 JSON 格式（供 N8N 使用）
    if (process.env.OUTPUT_JSON === 'true') {
        console.log('\n📄 JSON 輸出:');
        console.log(JSON.stringify({
            success: successCount === sitesToProcess.length,
            totalSites: sitesToProcess.length,
            successSites: successCount,
            totalExported,
            results: allResults
        }, null, 2));
    }
}

// 執行
main().catch(error => {
    console.error('\n❌ 執行失敗:', error.message);
    console.error(error.stack);
    process.exit(1);
});

