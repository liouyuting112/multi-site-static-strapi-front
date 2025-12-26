// 批量更新 Strapi 後台的 imageUrl 欄位
// 只更新圖片 URL 格式，其他欄位不動

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 使用原生 fetch（Node.js 18+）
const fetch = globalThis.fetch;
if (!fetch) {
    console.error('❌ 錯誤: 此 Node.js 版本不支持 fetch，請升級到 Node.js 18+ 或安裝 node-fetch');
    process.exit(1);
}

// 配置（Railway 雲端環境）
const CONFIGS = {
    production: {
        url: 'https://multi-site-strapi-backend-production.up.railway.app',
        token: '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993'
    },
    development: {
        url: 'https://multi-site-strapi-backend-production.up.railway.app',
        token: '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993'
    }
};

// 工具函數：將錯誤的 GitHub URL 轉換為正確格式
function fixImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== 'string') {
        return null;
    }
    
    // 檢查是否是需要修復的格式
    // 錯誤格式: https://github.com/test100web/100-website/tree/main/images/xxx.webp?raw=true
    // 正確格式: https://raw.githubusercontent.com/test100web/100-website/main/images/xxx.webp
    const wrongPattern = /https:\/\/github\.com\/test100web\/100-website\/tree\/main\/images\/([^?"\s]+)\?raw=true/;
    const match = imageUrl.match(wrongPattern);
    
    if (match) {
        const fileName = match[1];
        const correctUrl = `https://raw.githubusercontent.com/test100web/100-website/main/images/${fileName}`;
        return correctUrl;
    }
    
    // 如果已經是正確格式或其他格式，直接返回
    return imageUrl;
}

// 工具函數：發送 HTTP 請求（使用 fetch，與上傳API模組一致）
async function makeRequest(url, options, data = null) {
    try {
        // 確保 fetch 可用
        if (typeof fetch === 'undefined') {
            throw new Error('fetch 不可用，請確保 Node.js 版本 >= 18 或安裝 node-fetch');
        }
        
        const fetchOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };
        
        if (data) {
            fetchOptions.body = JSON.stringify(data);
        }
        
        const response = await fetch(url, fetchOptions);
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = await response.text();
        }
        
        return { 
            status: response.status, 
            data: responseData 
        };
    } catch (error) {
        console.error(`❌ 請求失敗 (${url}):`, error.message);
        throw error;
    }
}

// 通用：分頁抓取任意集合資料
async function getAllFromCollection(strapiUrl, token, collectionName) {
    let allItems = [];
    let page = 1;
    const pageSize = 100;
    
    while (true) {
        const url = `${strapiUrl}/api/${collectionName}?pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
        const response = await makeRequest(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status !== 200) {
            console.error(`❌ 獲取 ${collectionName} 失敗 (頁碼 ${page}):`, response.status, response.data);
            break;
        }
        
        const items = response.data.data || [];
        if (items.length === 0) {
            break;
        }
        
        allItems = allItems.concat(items);
        console.log(`📄 [${collectionName}] 已獲取第 ${page} 頁，共 ${items.length} 筆，累計 ${allItems.length} 筆`);
        
        const pagination = response.data.meta?.pagination;
        if (!pagination || page >= pagination.pageCount) {
            break;
        }
        
        page++;
    }
    
    return allItems;
}

// 獲取所有 posts
async function getAllPosts(strapiUrl, token) {
    return getAllFromCollection(strapiUrl, token, 'posts');
}

// 獲取所有 pages
async function getAllPages(strapiUrl, token) {
    return getAllFromCollection(strapiUrl, token, 'pages');
}

// 更新單個 post 的 imageUrl
async function updatePostImageUrl(strapiUrl, token, post) {
    const postId = post.documentId || post.id;
    const attrs = post.attributes || post;
    
    const currentImageUrl = attrs.imageUrl;
    if (!currentImageUrl) {
        return { updated: false, reason: '沒有 imageUrl' };
    }
    
    const fixedUrl = fixImageUrl(currentImageUrl);
    
    if (fixedUrl === currentImageUrl) {
        return { updated: false, reason: 'URL 格式正確' };
    }
    
    const updateUrl = `${strapiUrl}/api/posts/${postId}`;
    const payload = {
        data: {
            imageUrl: fixedUrl
        }
    };
    
    try {
        const response = await makeRequest(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, payload);
        
        if (response.status === 200) {
            return { 
                updated: true, 
                oldUrl: currentImageUrl, 
                newUrl: fixedUrl 
            };
        } else {
            return { 
                updated: false, 
                reason: `更新失敗: ${response.status}`,
                error: response.data 
            };
        }
    } catch (error) {
        return { 
            updated: false, 
            reason: `請求失敗: ${error.message}` 
        };
    }
}

// 更新單個 page 的 imageUrl
async function updatePageImageUrl(strapiUrl, token, page) {
    const pageId = page.documentId || page.id;
    const attrs = page.attributes || page;
    
    const currentImageUrl = attrs.imageUrl;
    if (!currentImageUrl) {
        return { updated: false, reason: '沒有 imageUrl' };
    }
    
    const fixedUrl = fixImageUrl(currentImageUrl);
    
    if (fixedUrl === currentImageUrl) {
        return { updated: false, reason: 'URL 格式正確' };
    }
    
    const updateUrl = `${strapiUrl}/api/pages/${pageId}`;
    const payload = {
        data: {
            imageUrl: fixedUrl
        }
    };
    
    try {
        const response = await makeRequest(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }, payload);
        
        if (response.status === 200) {
            return { 
                updated: true, 
                oldUrl: currentImageUrl, 
                newUrl: fixedUrl 
            };
        } else {
            return { 
                updated: false, 
                reason: `更新失敗: ${response.status}`,
                error: response.data 
            };
        }
    } catch (error) {
        return { 
            updated: false, 
            reason: `請求失敗: ${error.message}` 
        };
    }
}

// 主函數
async function updateAllImageUrls(env) {
    const config = CONFIGS[env];
    if (!config) {
        console.error(`❌ 無效的環境: ${env}`);
        return;
    }
    
    console.log(`\n🚀 開始更新 ${env} 環境的圖片 URL...`);
    console.log(`📍 Strapi URL: ${config.url}\n`);
    
    try {
        // posts
        console.log('📥 正在獲取所有 posts...');
        const posts = await getAllPosts(config.url, config.token);
        console.log(`✅ 共獲取 ${posts.length} 篇文章\n`);
        
        // pages
        console.log('📥 正在獲取所有 pages...');
        const pages = await getAllPages(config.url, config.token);
        console.log(`✅ 共獲取 ${pages.length} 個頁面\n`);
        
        // 統計
        let updatedCountPosts = 0;
        let skippedCountPosts = 0;
        let errorCountPosts = 0;
        
        let updatedCountPages = 0;
        let skippedCountPages = 0;
        let errorCountPages = 0;
        
        // 更新每個 post
        console.log('🔄 開始更新 posts 的圖片 URL...\n');
        for (let i = 0; i < posts.length; i++) {
            const post = posts[i];
            const attrs = post.attributes || post;
            const site = attrs.site || 'unknown';
            const slug = attrs.slug || 'unknown';
            
            const result = await updatePostImageUrl(config.url, config.token, post);
            
            if (result.updated) {
                updatedCountPosts++;
                console.log(`✅ [Post ${i + 1}/${posts.length}] ${site} - ${slug}`);
                console.log(`   舊: ${result.oldUrl}`);
                console.log(`   新: ${result.newUrl}\n`);
            } else {
                skippedCountPosts++;
                if (result.reason !== 'URL 格式正確' && result.reason !== '沒有 imageUrl') {
                    errorCountPosts++;
                    console.log(`❌ [Post ${i + 1}/${posts.length}] ${site} - ${slug}: ${result.reason}`);
                    if (result.error) {
                        console.log(`   錯誤詳情:`, result.error);
                    }
                    console.log();
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 更新每個 page
        console.log('\n🔄 開始更新 pages 的圖片 URL...\n');
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            const attrs = page.attributes || page;
            const site = attrs.site || 'unknown';
            const type = attrs.type || attrs.slug || 'unknown';
            
            const result = await updatePageImageUrl(config.url, config.token, page);
            
            if (result.updated) {
                updatedCountPages++;
                console.log(`✅ [Page ${i + 1}/${pages.length}] ${site} - ${type}`);
                console.log(`   舊: ${result.oldUrl}`);
                console.log(`   新: ${result.newUrl}\n`);
            } else {
                skippedCountPages++;
                if (result.reason !== 'URL 格式正確' && result.reason !== '沒有 imageUrl') {
                    errorCountPages++;
                    console.log(`❌ [Page ${i + 1}/${pages.length}] ${site} - ${type}: ${result.reason}`);
                    if (result.error) {
                        console.log(`   錯誤詳情:`, result.error);
                    }
                    console.log();
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // 輸出統計
        console.log('\n📊 更新統計 (posts):');
        console.log(`   ✅ 已更新: ${updatedCountPosts} 篇`);
        console.log(`   ⏭️  已跳過: ${skippedCountPosts} 篇`);
        console.log(`   ❌ 錯誤: ${errorCountPosts} 篇`);
        console.log(`   📄 總計: ${posts.length} 篇\n`);
        
        console.log('\n📊 更新統計 (pages):');
        console.log(`   ✅ 已更新: ${updatedCountPages} 個`);
        console.log(`   ⏭️  已跳過: ${skippedCountPages} 個`);
        console.log(`   ❌ 錯誤: ${errorCountPages} 個`);
        console.log(`   📄 總計: ${pages.length} 個\n`);
        
    } catch (error) {
        console.error(`❌ 更新過程發生錯誤:`, error);
    }
}

// 執行
console.log('📋 更新圖片URL腳本已啟動');
const args = process.argv.slice(2);
const env = args[0] || 'production';
console.log(`🔧 環境參數: ${env}`);

if (env === 'all') {
    // 更新兩個環境
    (async () => {
        try {
            await updateAllImageUrls('production');
            await updateAllImageUrls('development');
            console.log('\n✅ 所有環境更新完成！');
        } catch (error) {
            console.error('\n❌ 執行過程發生錯誤:', error);
            process.exit(1);
        }
    })();
} else {
    updateAllImageUrls(env).then(() => {
        console.log('\n✅ 更新完成！');
    }).catch((error) => {
        console.error('\n❌ 執行過程發生錯誤:', error);
        process.exit(1);
    });
}

