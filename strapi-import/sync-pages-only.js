// =========================================================
// 只同步頁面（Pages）- 較小的腳本
// 在新雲端 Strapi 後台 Console 執行
// =========================================================

(async function() {
    console.log('🚀 開始同步頁面...');
    const STRAPI_URL = window.location.origin;
    
    // 從本機 Strapi 取得的頁面資料（20個）
    const pages = ${JSON.stringify(await getAllFromLocal('pages'), null, 2)};
    
    // ... 同步邏輯
})();

