// =========================================================
// 在 Strapi 後台瀏覽器 Console 中執行的匯入腳本
// 使用方式：
// 1. 登入 Strapi 後台
// 2. 按 F12 打開開發者工具
// 3. 切換到 Console 標籤
// 4. 複製貼上這個腳本並執行
// =========================================================

(async function() {
    console.log('🚀 開始匯入頁面資料...');
    
    // 頁面資料（你需要根據實際情況修改）
    const pagesData = [
        // site1
        { site: 'site1', type: 'home', slug: 'index', title: '懷舊時光機', html: '<!-- 從 site1/index.html 複製內容 -->' },
        { site: 'site1', type: 'contact', slug: 'contact', title: '聯絡我們', html: '<!-- 從 site1/contact.html 複製內容 -->' },
        { site: 'site1', type: 'about', slug: 'about', title: '關於我們', html: '<!-- 從 site1/about.html 複製內容 -->' },
        { site: 'site1', type: 'privacy', slug: 'privacy', title: '隱私政策', html: '<!-- 從 site1/privacy.html 複製內容 -->' },
        // 可以繼續添加 site2, site3, site4, site5...
    ];
    
    const STRAPI_URL = window.location.origin; // 使用當前 Strapi 網址
    const API_TOKEN = ''; // 如果需要，可以從 localStorage 或其他地方取得
    
    let successCount = 0;
    let failCount = 0;
    
    for (const pageData of pagesData) {
        try {
            // 檢查是否已存在
            const checkUrl = `${STRAPI_URL}/api/pages?filters[site][$eq]=${pageData.site}&filters[type][$eq]=${pageData.type}`;
            const checkRes = await fetch(checkUrl);
            const checkData = await checkRes.json();
            
            const existing = checkData.data?.[0];
            
            const payload = {
                data: {
                    site: pageData.site,
                    type: pageData.type,
                    slug: pageData.slug,
                    title: pageData.title,
                    html: pageData.html
                }
            };
            
            let result;
            if (existing) {
                // 更新
                const updateUrl = `${STRAPI_URL}/api/pages/${existing.id}`;
                result = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                console.log(`✅ 更新：${pageData.site} - ${pageData.type}`);
            } else {
                // 建立
                const createUrl = `${STRAPI_URL}/api/pages`;
                result = await fetch(createUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });
                console.log(`✅ 建立：${pageData.site} - ${pageData.type}`);
            }
            
            if (result.ok) {
                successCount++;
            } else {
                console.error(`❌ 失敗：${pageData.site} - ${pageData.type}`, await result.text());
                failCount++;
            }
        } catch (error) {
            console.error(`❌ 錯誤：${pageData.site} - ${pageData.type}`, error);
            failCount++;
        }
    }
    
    console.log(`\n📊 匯入完成：成功 ${successCount}，失敗 ${failCount}`);
})();

