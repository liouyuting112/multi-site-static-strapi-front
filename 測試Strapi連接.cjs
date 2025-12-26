// 測試 Strapi 連接
// 使用方法：node 測試Strapi連接.cjs

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const STRAPI_URL = 'https://multi-site-strapi-backend-production.up.railway.app';
const STRAPI_TOKEN = '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993';

async function testStrapiConnection() {
    console.log('🔍 測試 Strapi 連接...');
    console.log(`📍 Strapi URL: ${STRAPI_URL}`);
    console.log(`🔑 Token 前 10 字元: ${STRAPI_TOKEN.substring(0, 10)}...\n`);
    
    // 動態載入 node-fetch
    let fetch;
    try {
        const nodeFetch = await import('node-fetch');
        fetch = nodeFetch.default;
    } catch (e) {
        console.error('❌ 無法載入 node-fetch:', e.message);
        return;
    }
    
    // 測試 1: 檢查 Strapi 是否運行
    console.log('📋 測試 1: 檢查 Strapi 是否運行...');
    try {
        const healthCheck = await fetch(`${STRAPI_URL}/api`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (healthCheck.ok) {
            console.log('✅ Strapi 正在運行\n');
        } else {
            console.log(`⚠️  Strapi 回應狀態: ${healthCheck.status}\n`);
        }
    } catch (error) {
        console.error('❌ 無法連接到 Strapi:', error.message);
        console.log('\n💡 請確認：');
        console.log('1. Strapi 是否正在運行？');
        console.log('2. Strapi URL 是否正確（https://multi-site-strapi-backend-production.up.railway.app）？');
        console.log('3. 防火牆是否阻擋了連接？\n');
        return;
    }
    
    // 測試 2: 檢查 API Token
    console.log('📋 測試 2: 檢查 API Token...');
    try {
        const url = `${STRAPI_URL}/api/posts?pagination[pageSize]=1&fields[0]=site`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });
        
        console.log(`📥 回應狀態: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API 錯誤: ${errorText.substring(0, 200)}`);
            
            if (response.status === 401) {
                console.log('\n💡 Token 無效或過期，請：');
                console.log('1. 到 Strapi 後台（https://multi-site-strapi-backend-production.up.railway.app/admin）');
                console.log('2. 進入 Settings → API Tokens');
                console.log('3. 建立新的 API Token 或檢查現有 Token');
                console.log('4. 更新 server.js 中的 STRAPI_TOKEN');
            }
            return;
        }
        
        const data = await response.json();
        console.log('✅ Token 有效\n');
        
        // 測試 3: 取得所有站點
        console.log('📋 測試 3: 取得所有站點...');
        const allPostsUrl = `${STRAPI_URL}/api/posts?pagination[pageSize]=1000&fields[0]=site&sort=createdAt:desc`;
        
        const allPostsResponse = await fetch(allPostsUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            }
        });
        
        if (allPostsResponse.ok) {
            const allPostsData = await allPostsResponse.json();
            const posts = allPostsData.data || [];
            
            const sites = new Set();
            posts.forEach(post => {
                const attrs = post.attributes || post;
                if (attrs.site) {
                    sites.add(attrs.site);
                }
            });
            
            const sitesArray = Array.from(sites).sort();
            console.log(`✅ 找到 ${sitesArray.length} 個站點:`);
            sitesArray.forEach((site, index) => {
                console.log(`   ${index + 1}. ${site}`);
            });
            console.log('\n💡 這些站點應該會顯示在 HTML 管理介面中');
        } else {
            console.error(`❌ 取得站點失敗: ${allPostsResponse.status}`);
        }
        
    } catch (error) {
        console.error('❌ 測試失敗:', error.message);
    }
}

testStrapiConnection();


