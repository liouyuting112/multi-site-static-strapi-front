// 自動注入 CMS 腳本到 HTML 檔案
const fs = require('fs');
const path = require('path');

function processHtmlFile(filePath, siteName) {
    try {
        let html = fs.readFileSync(filePath, 'utf8');
        let modified = false;
        
        // 檢查是否已經有 home-cms.js
        const hasHomeCms = html.includes('home-cms.js');
        
        // 如果是 index.html 且還沒有 home-cms.js，則注入
        if (path.basename(filePath) === 'index.html' && !hasHomeCms) {
            // 尋找 </body> 標籤
            const bodyEndMatch = html.match(/<\/body>/i);
            if (bodyEndMatch) {
                // 在 </body> 前插入 CMS 腳本
                const scriptTag = `\n    <script src="../home-cms.js" data-site="${siteName}"></script>`;
                html = html.replace(/<\/body>/i, scriptTag + '\n</body>');
                modified = true;
            }
        }
        
        // 如果是文章頁面，檢查是否需要注入 article-cms.js
        const isArticlePage = filePath.includes(path.sep + 'articles' + path.sep) || 
                             filePath.includes(path.sep + 'fixed-articles' + path.sep);
        
        if (isArticlePage && !html.includes('article-cms.js')) {
            const bodyEndMatch = html.match(/<\/body>/i);
            if (bodyEndMatch) {
                const scriptTag = `\n    <script src="../../article-cms.js" data-site="${siteName}"></script>`;
                html = html.replace(/<\/body>/i, scriptTag + '\n</body>');
                modified = true;
            }
        }
        
        // 如果是 all-daily-articles.html，檢查是否需要注入 all-daily-articles-cms.js
        if (path.basename(filePath) === 'all-daily-articles.html' && !html.includes('all-daily-articles-cms.js')) {
            const bodyEndMatch = html.match(/<\/body>/i);
            if (bodyEndMatch) {
                const scriptTag = `\n    <script src="../all-daily-articles-cms.js" data-site="${siteName}"></script>`;
                html = html.replace(/<\/body>/i, scriptTag + '\n</body>');
                modified = true;
            }
        }
        
        // 如果是 about.html, contact.html, privacy.html，檢查是否需要注入 page-cms.js
        const pageFiles = ['about.html', 'contact.html', 'privacy.html'];
        if (pageFiles.includes(path.basename(filePath)) && !html.includes('page-cms.js')) {
            const bodyEndMatch = html.match(/<\/body>/i);
            if (bodyEndMatch) {
                const scriptTag = `\n    <script src="../page-cms.js" data-site="${siteName}"></script>`;
                html = html.replace(/<\/body>/i, scriptTag + '\n</body>');
                modified = true;
            }
        }
        
        if (modified) {
            fs.writeFileSync(filePath, html, 'utf8');
            return true;
        }
        
        return false;
    } catch (e) {
        console.error(`  ❌ 注入 CMS 腳本失敗: ${e.message}`);
        return false;
    }
}

module.exports = {
    processHtmlFile
};
