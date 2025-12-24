// 測試 Gemini API Key 是否有效
// 使用 Node.js 18+ 原生 fetch

const API_KEY = 'AIzaSyDbPlZ9iOEJ-0tdf1fdTYUser4tEbjaUmw';

async function testAPIKey() {
    try {
        // 使用 REST API 直接測試
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        
        console.log('🔍 正在測試 API Key...\n');
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Key 有效！\n');
            console.log('📋 可用的模型：');
            if (data.models) {
                data.models.forEach(model => {
                    console.log(`  - ${model.name}`);
                });
            } else {
                console.log('  (無法解析模型列表)');
                console.log('完整回應:', JSON.stringify(data, null, 2));
            }
        } else {
            console.error('❌ API Key 無效或錯誤');
            console.error('錯誤:', data);
        }
    } catch (error) {
        console.error('❌ 請求失敗:', error.message);
    }
}

testAPIKey();

