// =========================================================
// 在 Strapi 後台瀏覽器 Console 中執行的頁面匯入腳本
// 使用方式：
// 1. 登入 Strapi 後台：https://tidy-fireworks-ad201d981a.strapiapp.com/admin
// 2. 按 F12 打開開發者工具
// 3. 切換到 Console 標籤
// 4. 複製貼上這個腳本並執行
// =========================================================

(async function() {
    console.log('🚀 開始匯入頁面資料...');
    
    const STRAPI_URL = window.location.origin;
    console.log(`📍 Strapi URL: ${STRAPI_URL}`);
    
    // 測試連接
    try {
        const testRes = await fetch(`${STRAPI_URL}/api/pages?pagination[limit]=1`);
        if (testRes.ok) {
            console.log('✅ 連接成功！\n');
        } else {
            console.error('❌ 連接失敗:', testRes.status);
            return;
        }
    } catch (error) {
        console.error('❌ 連接錯誤:', error);
        return;
    }
    
    // 頁面定義（你需要手動填入 HTML 內容）
    // 或者我可以建立一個腳本從本地檔案讀取
    const pagesToImport = [
        // 範例：site1 的頁面
        // {
        //     site: 'site1',
        //     type: 'home',
        //     slug: 'index',
        //     title: '懷舊時光機',
        //     html: '<!-- 從 site1/index.html 複製 <main> 內的內容 -->'
        // },
    ];
    
    if (pagesToImport.length === 0) {
        console.log('⚠️  請先在 pagesToImport 陣列中填入要匯入的頁面資料');
        console.log('   或使用以下方式手動建立：');
        console.log('   1. 進入 Content Manager → Page');
        console.log('   2. 點擊 "Create new entry"');
        console.log('   3. 填寫內容並保存');
        return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const pageData of pagesToImport) {
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
                if (result.ok) {
                    console.log(`✅ 更新：${pageData.site} - ${pageData.type}`);
                    successCount++;
                } else {
                    console.error(`❌ 更新失敗：${pageData.site} - ${pageData.type}`, await result.text());
                    failCount++;
                }
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
                if (result.ok) {
                    console.log(`✅ 建立：${pageData.site} - ${pageData.type}`);
                    successCount++;
                } else {
                    console.error(`❌ 建立失敗：${pageData.site} - ${pageData.type}`, await result.text());
                    failCount++;
                }
            }
        } catch (error) {
            console.error(`❌ 錯誤：${pageData.site} - ${pageData.type}`, error);
            failCount++;
        }
    }
    
    console.log(`\n📊 匯入完成：成功 ${successCount}，失敗 ${failCount}`);
})();

