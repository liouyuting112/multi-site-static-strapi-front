// AI 生成文章測試腳本 - 針對 sce010 站點，只生成 daily 文章
// 使用 Google Gemini 1.5 Flash

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// =========================================================
// 設定（請填入你的資訊）
// =========================================================
const CONFIG = {
    // Google AI Studio API Key（從 https://aistudio.google.com/app/apikey 取得）
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDbPlZ9iOEJ-0tdf1fdTYUser4tEbjaUmw',
    
    // Strapi 設定（本機）
    STRAPI_URL: 'http://localhost:1337',
    STRAPI_TOKEN: '6a02dd00859ce2861a884a1de0b5f7eaf4ee961b0e6bf0c07c7df72d47e1c9b142a07564ffadd433ffa9b851d14629989b07d72fb09457d775f3227cca99fbaee43200ccac7a0db7d6d65185ca71b317bae9d6c0db943abb50a9e3ed9f279e536c2acba98e2f642bb44f543d1c23fac24a131ec177f23d2d496715b9c5984c76',
    
    // 測試站點
    SITE: 'sce010',
    CATEGORY: 'daily', // 只要 daily 文章
    
    // 提示詞檔案路徑（如果有的話）
    PROMPT_FILE: path.join(__dirname, '下載', '新增文章提詞.txt')
};

// =========================================================
// 讀取提示詞
// =========================================================
function loadPrompt() {
    // 優先從檔案讀取
    if (fs.existsSync(CONFIG.PROMPT_FILE)) {
        console.log(`📝 從檔案讀取提示詞: ${CONFIG.PROMPT_FILE}`);
        return fs.readFileSync(CONFIG.PROMPT_FILE, 'utf8').trim();
    }
    
    // 如果檔案不存在，使用預設提示詞
    console.log('⚠️  提示詞檔案不存在，使用預設提示詞');
    return `你是一個專業的星座與星象內容寫手，專門為「星宿探索家」網站撰寫每日精選文章。

請根據以下現有文章的主題和風格，生成一篇新的每日文章：

要求：
1. 標題要吸引人，符合星座/星象主題
2. 內容約 800-1200 字
3. 使用 HTML 格式（段落用 <p>，標題用 <h2>，列表用 <ul><li>）
4. 風格要輕鬆有趣，但要有專業感
5. 要符合「星宿探索家」的定位（探索星座、星象、占星知識）

請直接輸出完整的 HTML 文章內容，包含標題和內文。`;
}

// =========================================================
// 從 Strapi 抓取現有文章（當作參考）
// =========================================================
async function fetchExistingPosts() {
    try {
        const url = `${CONFIG.STRAPI_URL}/api/posts?` +
            `filters[site][$eq]=${CONFIG.SITE}&` +
            `filters[category][$eq]=${CONFIG.CATEGORY}&` +
            `sort=date:desc&` +
            `pagination[limit]=5`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        if (!response.ok) {
            console.error(`❌ 抓取文章失敗: ${response.status}`);
            return [];
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        console.log(`✅ 找到 ${posts.length} 篇現有文章作為參考`);
        
        // 提取標題和主題
        return posts.map(post => {
            const attrs = post.attributes || post;
            return {
                title: attrs.title || '',
                slug: attrs.slug || '',
                date: attrs.date || attrs.publishedAt || ''
            };
        });
    } catch (error) {
        console.error('❌ 抓取文章時發生錯誤:', error.message);
        return [];
    }
}

// =========================================================
// 用 Gemini 生成文章
// =========================================================
async function generateArticleWithGemini(existingPosts, prompt) {
    try {
        const genAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);
        // 使用正確的模型名稱（從 API 查詢結果得知）
        // 可用：gemini-2.5-flash, gemini-flash-latest, gemini-2.0-flash
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        // 建立提示詞
        const existingTitles = existingPosts.map(p => `- ${p.title} (${p.date})`).join('\n');
        
        const fullPrompt = `${prompt}

現有文章範例：
${existingTitles}

請生成一篇全新的文章，標題和內容都要與上述文章不同，但風格要一致。`;
        
        console.log('🤖 正在呼叫 Gemini 1.5 Flash 生成文章...');
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const generatedText = response.text();
        
        console.log('✅ AI 生成完成');
        
        return generatedText;
    } catch (error) {
        console.error('❌ Gemini API 錯誤:', error.message);
        throw error;
    }
}

// =========================================================
// 解析 AI 生成的文章（提取標題和內容）
// =========================================================
function parseGeneratedArticle(aiText) {
    // 清理 markdown 程式碼區塊標記
    let cleanedText = aiText.replace(/^```html\s*/i, '').replace(/\s*```$/i, '').trim();
    
    // 嘗試提取標題（通常在 <h1> 或 <h2>）
    let title = '';
    let htmlContent = cleanedText;
    
    // 方法1: 找 <h1>
    const h1Match = cleanedText.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match) {
        title = h1Match[1].trim();
        htmlContent = cleanedText.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, '').trim();
    }
    
    // 方法2: 找 <h2>（如果沒有 h1）
    if (!title) {
        const h2Match = cleanedText.match(/<h2[^>]*>([^<]+)<\/h2>/i);
        if (h2Match) {
            title = h2Match[1].trim();
            htmlContent = cleanedText.replace(/<h2[^>]*>[\s\S]*?<\/h2>/i, '').trim();
        }
    }
    
    // 方法3: 如果沒有標題標籤，找第一行作為標題
    if (!title) {
        const lines = cleanedText.split('\n').filter(l => l.trim() && !l.trim().startsWith('<'));
        if (lines.length > 0) {
            title = lines[0].replace(/^#+\s*/, '').trim();
        }
    }
    
    // 如果還是沒有標題，用預設
    if (!title) {
        title = 'AI 生成的文章';
    }
    
    // 確保 HTML 內容有基本結構
    if (!htmlContent.includes('<p>') && !htmlContent.includes('<h2>')) {
        // 如果沒有 HTML 標籤，把段落轉成 <p>
        htmlContent = htmlContent
            .split('\n\n')
            .filter(p => p.trim())
            .map(p => `<p>${p.trim()}</p>`)
            .join('\n\n');
    }
    
    // 提取 excerpt（從第一個 <p> 標籤）
    let excerpt = '';
    const firstPMatch = htmlContent.match(/<p[^>]*>([^<]+)<\/p>/i);
    if (firstPMatch) {
        let rawExcerpt = firstPMatch[1].trim();
        // 限制長度（嚴格 28 個字元，超過用 ... 表示）
        // 注意：28 字元不含 "..."，所以實際總長度會是 31 字元
        if (rawExcerpt.length > 28) {
            excerpt = rawExcerpt.substring(0, 28) + '...';
        } else {
            excerpt = rawExcerpt;
        }
    } else {
        // 如果沒有 <p>，從純文字提取
        const textContent = htmlContent.replace(/<[^>]+>/g, '').trim();
        if (textContent.length > 0) {
            if (textContent.length > 28) {
                excerpt = textContent.substring(0, 28) + '...';
            } else {
                excerpt = textContent;
            }
        }
    }
    
    // 最終確認：excerpt 必須是 28 字元（不含 "..."），如果超過就加上 "..."
    // 先移除可能已經存在的 "..."
    let cleanExcerpt = excerpt.endsWith('...') ? excerpt.slice(0, -3) : excerpt;
    // 如果內容超過 28 字元，截斷並加上 "..."
    if (cleanExcerpt.length > 28) {
        excerpt = cleanExcerpt.substring(0, 28) + '...';
    } else {
        // 如果原始內容超過 28 字元，確保有 "..."
        const originalLength = firstPMatch ? firstPMatch[1].trim().length : (htmlContent.replace(/<[^>]+>/g, '').trim().length);
        if (originalLength > 28 && !excerpt.endsWith('...')) {
            excerpt = cleanExcerpt + '...';
        } else {
            excerpt = cleanExcerpt;
        }
    }
    
    // 提取 imageUrl（從 HTML 中的 <img> 標籤）
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
async function saveToStrapi(title, htmlContent, excerpt, imageUrl) {
    try {
        // 生成今天的日期作為 slug
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
        const slug = dateStr;
        
        // 檢查是否已存在
        const checkUrl = `${CONFIG.STRAPI_URL}/api/posts?` +
            `filters[site][$eq]=${CONFIG.SITE}&` +
            `filters[slug][$eq]=${slug}`;
        
        const checkResponse = await fetch(checkUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        const checkData = await checkResponse.json();
        const existing = checkData.data && checkData.data.length > 0 ? checkData.data[0] : null;
        
        // 如果沒有 imageUrl，根據站點和日期生成預設圖片 URL
        let finalImageUrl = imageUrl;
        if (!finalImageUrl) {
            // 格式：https://raw.githubusercontent.com/test100web/100-website/main/images/{site}-daily{日期後兩碼}.webp
            const dateSuffix = dateStr.replace(/-/g, '').substring(4); // 例如 "1224"
            finalImageUrl = `https://raw.githubusercontent.com/test100web/100-website/main/images/${CONFIG.SITE}-daily${dateSuffix}.webp`;
            console.log(`📸 使用預設圖片: ${finalImageUrl}`);
        }
        
        // 準備 payload
        const payload = {
            data: {
                site: CONFIG.SITE,
                category: CONFIG.CATEGORY,
                slug: slug,
                title: title,
                html: htmlContent,
                date: dateStr,
                publishedAt: `${dateStr}T09:00:00.000Z`,
                isFeatured: true
            }
        };
        
        // 加入 excerpt（如果有，確保不超過 28 字元 + "..." = 31 字元）
        if (excerpt && excerpt.trim()) {
            let finalExcerpt = excerpt.trim();
            
            // 如果已經有 "..."，先移除它，重新計算
            const originalLength = finalExcerpt.endsWith('...') ? finalExcerpt.length - 3 : finalExcerpt.length;
            
            if (finalExcerpt.endsWith('...')) {
                finalExcerpt = finalExcerpt.slice(0, -3); // 移除 "..."
            }
            
            // 嚴格限制為 28 字元（不含 "..."）
            if (finalExcerpt.length > 28) {
                finalExcerpt = finalExcerpt.substring(0, 28);
            }
            
            // 如果原始長度超過 28 字元，加上 "..."
            if (originalLength > 28) {
                finalExcerpt = finalExcerpt + '...';
            }
            
            payload.data.excerpt = finalExcerpt;
            const contentPart = finalExcerpt.endsWith('...') ? finalExcerpt.slice(0, -3) : finalExcerpt;
            console.log(`📝 準備寫入的 Excerpt (總長度: ${finalExcerpt.length} 字元，內容部分: ${contentPart.length} 字元): ${finalExcerpt}`);
        } else {
            console.log('⚠️  沒有提取到 excerpt');
        }
        
        // 加入 imageUrl（如果有）
        if (finalImageUrl) {
            payload.data.imageUrl = finalImageUrl;
        }
        
        let response;
        if (existing) {
            // 更新現有文章
            const postId = existing.documentId || existing.id;
            console.log(`🔄 更新現有文章: ${slug}`);
            response = await fetch(`${CONFIG.STRAPI_URL}/api/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
                },
                body: JSON.stringify(payload)
            });
        } else {
            // 建立新文章
            console.log(`✨ 建立新文章: ${slug}`);
            response = await fetch(`${CONFIG.STRAPI_URL}/api/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
                },
                body: JSON.stringify(payload)
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Strapi API 錯誤 (${response.status}): ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ 文章已成功寫入 Strapi');
        return result;
    } catch (error) {
        console.error('❌ 寫入 Strapi 失敗:', error.message);
        throw error;
    }
}

// =========================================================
// 主程式
// =========================================================
async function main() {
    console.log('🚀 開始 AI 生成文章測試（sce010 - daily）\n');
    console.log('========================================');
    console.log(`📍 站點: ${CONFIG.SITE}`);
    console.log(`📍 類別: ${CONFIG.CATEGORY}`);
    console.log(`📍 Strapi: ${CONFIG.STRAPI_URL}`);
    console.log('========================================\n');
    
    // 檢查 API Key
    if (CONFIG.GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('❌ 錯誤：請先設定 GEMINI_API_KEY');
        console.log('\n方法1: 在環境變數設定');
        console.log('  set GEMINI_API_KEY=你的API_KEY');
        console.log('\n方法2: 直接修改腳本中的 CONFIG.GEMINI_API_KEY');
        process.exit(1);
    }
    
    try {
        // 1. 讀取提示詞
        const prompt = loadPrompt();
        console.log(`📝 提示詞長度: ${prompt.length} 字元\n`);
        
        // 2. 抓取現有文章
        const existingPosts = await fetchExistingPosts();
        if (existingPosts.length === 0) {
            console.log('⚠️  沒有找到現有文章，將使用預設提示詞生成\n');
        }
        
        // 3. 用 Gemini 生成文章
        const aiGeneratedText = await generateArticleWithGemini(existingPosts, prompt);
        console.log('\n📄 AI 生成內容預覽（前 200 字）:');
        console.log(aiGeneratedText.substring(0, 200) + '...\n');
        
        // 4. 解析文章
        const { title, html, excerpt, imageUrl } = parseGeneratedArticle(aiGeneratedText);
        console.log(`📌 提取的標題: ${title}`);
        console.log(`📝 HTML 內容長度: ${html.length} 字元`);
        console.log(`📄 Excerpt (${excerpt ? excerpt.length : 0} 字元): ${excerpt || '(無)'}`);
        console.log(`🖼️  ImageUrl: ${imageUrl || '(無，將使用預設)'}\n`);
        
        // 5. 寫入 Strapi
        await saveToStrapi(title, html, excerpt, imageUrl);
        
        console.log('\n✅ 測試完成！');
        console.log(`\n你現在可以到 ${CONFIG.STRAPI_URL}/admin 查看新生成的文章`);
        console.log('或到 MySQL 資料庫查看 posts 表確認資料已寫入\n');
        
    } catch (error) {
        console.error('\n❌ 執行失敗:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 執行
main();

