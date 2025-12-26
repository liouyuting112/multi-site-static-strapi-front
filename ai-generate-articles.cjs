// AI 自動生成文章腳本 - 通用版本
// 支援批量處理多個站點，可透過參數或環境變數設定
// 設計用於 N8N 自動化排程

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 全域 fetch 變數（將在需要時動態載入）
let fetch;

// =========================================================
// 設定（可透過環境變數或參數覆蓋）
// =========================================================
const CONFIG = {
    // Google AI Studio API Key
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDuL2vhVx2XfjJrlZcunx2IA_L94eKptTI',
    
    // Strapi 設定
    STRAPI_URL: process.env.STRAPI_URL || 'https://multi-site-strapi-backend-production.up.railway.app',
    STRAPI_TOKEN: process.env.STRAPI_TOKEN || '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993',
    
    // 提示詞檔案路徑
    PROMPT_FILE: process.env.PROMPT_FILE || path.join(__dirname, '下載', '新增文章提詞.txt'),
    
    // Gemini 模型（嘗試多個可能的模型名稱）
    GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash'
};

// =========================================================
// 解析命令列參數
// =========================================================
function parseArgs() {
    const args = {
        // 要更新的站點（逗號分隔，例如：sce010,site1,cds006 或 'all' 表示全部）
        sites: process.env.SITES || process.argv[2] || 'all',
        
        // 要更新的日期（YYYY-MM-DD，預設今天）
        date: process.env.DATE || process.argv[3] || new Date().toISOString().split('T')[0],
        
        // 每個站點要生成幾篇文章（預設 1）
        count: parseInt(process.env.COUNT || process.argv[4] || '1'),
        
        // 文章類別（daily, fixed 等，預設 daily）
        category: process.env.CATEGORY || process.argv[5] || 'daily'
    };
    
    // 解析 sites（如果是 'all' 則稍後從 Strapi 抓取）
    if (args.sites !== 'all') {
        args.sites = args.sites.split(',').map(s => s.trim()).filter(s => s);
    }
    
    return args;
}

// =========================================================
// 從 Strapi 抓取所有站點列表
// =========================================================
async function fetchAllSites() {
    try {
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
        
        // 提取所有唯一的 site
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
// 讀取提示詞
// =========================================================
function loadPrompt() {
    if (fs.existsSync(CONFIG.PROMPT_FILE)) {
        return fs.readFileSync(CONFIG.PROMPT_FILE, 'utf8').trim();
    }
    
    // 預設提示詞
    return `你是一個專業的內容寫手，專門為網站撰寫文章。

請根據以下現有文章的主題和風格，生成一篇新的文章：

要求：
1. 標題要吸引人，符合網站主題
2. 內容約 800-1200 字
3. 使用 HTML 格式（段落用 <p>，標題用 <h2>，列表用 <ul><li>）
4. 風格要輕鬆有趣，但要有專業感

請直接輸出完整的 HTML 文章內容，包含標題和內文。`;
}

// =========================================================
// 從 Strapi 抓取指定站點的現有文章
// =========================================================
async function fetchExistingPosts(site, category, limit = 5) {
    try {
        // 動態載入 node-fetch
        let fetch;
        try {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        } catch (e) {
            console.warn('無法載入 node-fetch，跳過抓取現有文章');
            return [];
        }
        
        const url = `${CONFIG.STRAPI_URL}/api/posts?` +
            `filters[site][$eq]=${site}&` +
            `filters[category][$eq]=${category}&` +
            `sort=date:desc&pagination[limit]=${limit}`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        if (!response.ok) {
            return [];
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        return posts.map(post => {
            const attrs = post.attributes || post;
            return {
                title: attrs.title || '',
                slug: attrs.slug || '',
                date: attrs.date || attrs.publishedAt || ''
            };
        });
    } catch (error) {
        console.error(`❌ 抓取 ${site} 文章失敗:`, error.message);
        return [];
    }
}

// =========================================================
// 用 Gemini 生成文章
// =========================================================
async function generateArticleWithGemini(site, existingPosts, prompt) {
    try {
        // 驗證 API Key
        if (!CONFIG.GEMINI_API_KEY || CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            throw new Error('Gemini API Key 未設定或無效');
        }
        
        const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
        
        // 使用確認可用的模型名稱（從測試結果得知）
        const modelName = 'models/gemini-2.5-flash';
        
        console.log(`🔑 API Key 前 10 字元: ${CONFIG.GEMINI_API_KEY.substring(0, 10)}...`);
        console.log(`🤖 使用模型: ${modelName}`);
        
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const existingTitles = existingPosts.map(p => `- ${p.title} (${p.date})`).join('\n');
        
        const fullPrompt = `${prompt}

站點：${site}
現有文章範例：
${existingTitles || '(無現有文章)'}

請生成一篇全新的文章，標題和內容都要與上述文章不同，但風格要一致。`;
        
        console.log(`📝 提示詞長度: ${fullPrompt.length} 字元`);
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const generatedText = response.text();
        
        console.log(`✅ AI 生成完成，長度: ${generatedText.length} 字元`);
        return generatedText;
    } catch (error) {
        console.error(`❌ Gemini API 詳細錯誤:`, error);
        // 提供更詳細的錯誤訊息
        let errorMsg = `Gemini API 錯誤: ${error.message}`;
        if (error.message.includes('API_KEY_INVALID')) {
            errorMsg += ' (API Key 無效，請檢查 GEMINI_API_KEY)';
        } else if (error.message.includes('404')) {
            errorMsg += ` (模型不存在: ${CONFIG.GEMINI_MODEL}，請檢查模型名稱)`;
        } else if (error.message.includes('fetch')) {
            errorMsg += ' (網路連接失敗，請檢查網路連線)';
        }
        throw new Error(errorMsg);
    }
}

// =========================================================
// 解析 AI 生成的文章
// =========================================================
function parseGeneratedArticle(aiText) {
    let cleanedText = aiText.replace(/^```html\s*/i, '').replace(/\s*```$/i, '').trim();
    
    let title = '';
    let htmlContent = cleanedText;
    
    // 找 <h1> 或 <h2>
    const h1Match = cleanedText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
        title = h1Match[1].trim();
        htmlContent = cleanedText.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    } else {
        const h2Match = cleanedText.match(/<h2[^>]*>([^<]+)<\/h2>/i);
        if (h2Match) {
            title = h2Match[1].trim();
            htmlContent = cleanedText.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '').trim();
        }
    }
    
    if (!title) {
        const lines = cleanedText.split('\n').filter(l => l.trim() && !l.trim().startsWith('<'));
        if (lines.length > 0) {
            title = lines[0].replace(/^#+\s*/, '').trim();
        }
    }
    
    if (!title) {
        title = 'AI 生成的文章';
    }
    
    // 確保 HTML 內容有基本結構
    if (!htmlContent.includes('<p>') && !htmlContent.includes('<h2>')) {
        htmlContent = htmlContent
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('\n\n');
    }
    
    // 提取 excerpt（28 字元 + "..."）
    let excerpt = '';
    const firstPMatch = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/i);
    if (firstPMatch) {
        let rawExcerpt = firstPMatch[1].trim();
        if (rawExcerpt.length > 28) {
            excerpt = rawExcerpt.substring(0, 28) + '...';
        } else {
            excerpt = rawExcerpt;
        }
    } else {
        const textContent = htmlContent.replace(/<[^>]+>/g, '').trim();
        if (textContent.length > 0) {
            if (textContent.length > 28) {
                excerpt = textContent.substring(0, 28) + '...';
            } else {
                excerpt = textContent;
            }
        }
    }
    
    // 提取 imageUrl
    let imageUrl = '';
    const imgMatch = htmlContent.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
        imageUrl = imgMatch[1];
    }
    
    return { title, html: htmlContent, excerpt, imageUrl };
}

// =========================================================
// 寫入 Strapi
// =========================================================
async function saveToStrapi(site, category, dateStr, title, htmlContent, excerpt, imageUrl) {
    try {
        // 生成 slug（使用日期 + 時間戳避免重複）
        const timestamp = Date.now().toString().slice(-6);
        const slug = `${dateStr}-${timestamp}`;
        
        // 如果沒有 imageUrl，生成預設圖片 URL
        let finalImageUrl = imageUrl;
        if (!finalImageUrl) {
            const dateSuffix = dateStr.replace(/-/g, '').substring(4);
            finalImageUrl = `https://raw.githubusercontent.com/test100web/100-website/main/images/${site}-daily${dateSuffix}.webp`;
        }
        
        // 準備 payload
        const payload = {
            data: {
                site: site,
                category: category,
                slug: slug,
                title: title,
                html: htmlContent,
                date: dateStr,
                publishedAt: `${dateStr}T09:00:00.000Z`,
                isFeatured: true
            }
        };
        
        if (excerpt && excerpt.trim()) {
            let finalExcerpt = excerpt.trim();
            if (finalExcerpt.endsWith('...')) {
                finalExcerpt = finalExcerpt.slice(0, -3);
            }
            if (finalExcerpt.length > 28) {
                finalExcerpt = finalExcerpt.substring(0, 28);
            }
            const originalLength = excerpt.trim().length;
            if (originalLength > 28) {
                finalExcerpt = finalExcerpt + '...';
            }
            payload.data.excerpt = finalExcerpt;
        }
        
        if (finalImageUrl) {
            payload.data.imageUrl = finalImageUrl;
        }
        
        // 動態載入 node-fetch
        let fetch;
        try {
            const nodeFetch = await import('node-fetch');
            fetch = nodeFetch.default;
        } catch (e) {
            throw new Error('無法載入 node-fetch');
        }
        
        // 建立新文章
        const response = await fetch(`${CONFIG.STRAPI_URL}/api/posts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Strapi API 錯誤 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        return { success: true, slug, title };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// =========================================================
// 為單一站點生成文章
// =========================================================
async function generateForSite(site, category, dateStr, count, prompt) {
    const results = [];
    
    console.log(`\n📌 處理站點: ${site} (類別: ${category}, 日期: ${dateStr}, 數量: ${count})`);
    console.log('─'.repeat(50));
    
    // 抓取現有文章作為參考
    const existingPosts = await fetchExistingPosts(site, category, 5);
    if (existingPosts.length > 0) {
        console.log(`✅ 找到 ${existingPosts.length} 篇現有文章作為參考`);
    }
    
    // 生成指定數量的文章
    for (let i = 0; i < count; i++) {
        try {
            console.log(`\n🤖 [${i + 1}/${count}] 正在生成文章...`);
            
            // 生成文章
            const aiText = await generateArticleWithGemini(site, existingPosts, prompt);
            const { title, html, excerpt, imageUrl } = parseGeneratedArticle(aiText);
            
            console.log(`  標題: ${title}`);
            console.log(`  Excerpt: ${excerpt ? excerpt.substring(0, 30) + '...' : '(無)'}`);
            
            // 寫入 Strapi
            const saveResult = await saveToStrapi(site, category, dateStr, title, html, excerpt, imageUrl);
            
            if (saveResult.success) {
                console.log(`  ✅ 成功寫入: ${saveResult.slug}`);
                results.push({
                    site,
                    success: true,
                    slug: saveResult.slug,
                    title: saveResult.title
                });
            } else {
                console.log(`  ❌ 寫入失敗: ${saveResult.error}`);
                results.push({
                    site,
                    success: false,
                    error: saveResult.error
                });
            }
            
            // 避免 API 限制，稍作延遲
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        } catch (error) {
            console.log(`  ❌ 生成失敗: ${error.message}`);
            results.push({
                site,
                success: false,
                error: error.message
            });
        }
    }
    
    return results;
}

// =========================================================
// 主程式
// =========================================================
async function main() {
    const args = parseArgs();
    
    console.log('🚀 AI 自動生成文章系統');
    console.log('='.repeat(50));
    console.log(`📍 Strapi: ${CONFIG.STRAPI_URL}`);
    console.log(`📅 日期: ${args.date}`);
    console.log(`📊 類別: ${args.category}`);
    console.log(`📝 每個站點生成: ${args.count} 篇文章`);
    console.log('='.repeat(50));
    
    // 讀取提示詞
    const prompt = loadPrompt();
    console.log(`\n📝 提示詞長度: ${prompt.length} 字元`);
    
    // 決定要處理的站點
    let sitesToProcess = [];
    
    if (args.sites === 'all' || (Array.isArray(args.sites) && args.sites.length === 0)) {
        console.log('\n🔍 正在從 Strapi 抓取所有站點...');
        sitesToProcess = await fetchAllSites();
        console.log(`✅ 找到 ${sitesToProcess.length} 個站點: ${sitesToProcess.join(', ')}`);
    } else if (args.sites && args.sites.length > 0) {
        sitesToProcess = args.sites;
        console.log(`\n📋 指定站點: ${sitesToProcess.join(', ')}`);
    }
    
    if (sitesToProcess.length === 0) {
        console.error('❌ 沒有找到要處理的站點');
        process.exit(1);
    }
    
    // 批量處理所有站點
    const allResults = [];
    for (const site of sitesToProcess) {
        const results = await generateForSite(site, args.category, args.date, args.count, prompt);
        allResults.push(...results);
        
        // 站點之間稍作延遲
        if (sitesToProcess.indexOf(site) < sitesToProcess.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    // 輸出結果摘要
    console.log('\n' + '='.repeat(50));
    console.log('📊 執行結果摘要');
    console.log('='.repeat(50));
    
    const successCount = allResults.filter(r => r.success).length;
    const failCount = allResults.filter(r => !r.success).length;
    
    console.log(`✅ 成功: ${successCount} 篇`);
    console.log(`❌ 失敗: ${failCount} 篇`);
    
    if (successCount > 0) {
        console.log('\n成功生成的文章:');
        allResults.filter(r => r.success).forEach(r => {
            console.log(`  - ${r.site}: ${r.title} (${r.slug})`);
        });
    }
    
    if (failCount > 0) {
        console.log('\n失敗的文章:');
        allResults.filter(r => !r.success).forEach(r => {
            console.log(`  - ${r.site}: ${r.error}`);
        });
    }
    
    console.log('\n✅ 執行完成！');
    
    // 輸出 JSON 格式（供 N8N 使用）
    if (process.env.OUTPUT_JSON === 'true') {
        console.log('\n📄 JSON 輸出:');
        console.log(JSON.stringify({
            success: failCount === 0,
            total: allResults.length,
            successCount,
            failCount,
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

