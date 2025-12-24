// 批量上傳所有網站到 Strapi
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { execSync } = require('child_process');
const path = require('path');

// 所有需要上傳的網站資料夾（根據實際存在的資料夾）
const sites = [
    '星座解密站cds006',
    'site1',
    'site2',
    'site3',
    'site4',
    'site5',
    'site6',
    'site7',
    'site8',
    'site9',
    'site10',
    'site11',
    'site12',
    'site16',
    '占星智慧館awh008',
    '數位生活館dlh011',
    '星宿探索家sce010',
    '星座運勢屋zfh009',
    '星象觀測台so007',
    '知識實驗室kel002',
    '知識寶庫kst005',
    '科學探索館seh001',
    '科學觀察台sgo004',
    '科普發現站kfd003'
];

console.log('🚀 開始批量上傳所有網站到 Strapi\n');
console.log(`📋 共 ${sites.length} 個網站需要上傳\n`);
console.log('========================================\n');

let successCount = 0;
let failCount = 0;
const failedSites = [];

for (let i = 0; i < sites.length; i++) {
    const site = sites[i];
    console.log(`\n[${i + 1}/${sites.length}] 📤 正在上傳: ${site}`);
    console.log('─'.repeat(50));
    
    try {
        execSync(`node 通用上傳腳本.cjs "${site}"`, {
            stdio: 'inherit',
            cwd: __dirname
        });
        successCount++;
        console.log(`✅ [${i + 1}/${sites.length}] ${site} 上傳成功\n`);
    } catch (error) {
        failCount++;
        failedSites.push(site);
        console.error(`❌ [${i + 1}/${sites.length}] ${site} 上傳失敗: ${error.message}\n`);
    }
    
    // 每個網站之間暫停一下，避免 API 請求過快
    if (i < sites.length - 1) {
        // 使用同步延遲
        const start = Date.now();
        while (Date.now() - start < 500) {}
    }
}

console.log('\n========================================');
console.log('📊 批量上傳結果統計');
console.log('========================================');
console.log(`✅ 成功: ${successCount} 個網站`);
console.log(`❌ 失敗: ${failCount} 個網站`);
if (failedSites.length > 0) {
    console.log('\n失敗的網站:');
    failedSites.forEach(site => console.log(`  - ${site}`));
}
console.log('========================================\n');

if (failCount === 0) {
    console.log('🎉 所有網站上傳成功！');
} else {
    console.log('⚠️  部分網站上傳失敗，請檢查上面的錯誤訊息');
    process.exit(1);
}

