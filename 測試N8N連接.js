// 測試 N8N Webhook 連接
// 使用方法：node 測試N8N連接.js

const fetch = require('node-fetch');

const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/generate-articles';

async function testN8NConnection() {
    console.log('🔍 測試 N8N Webhook 連接...');
    console.log(`📍 Webhook URL: ${N8N_WEBHOOK_URL}\n`);
    
    const testData = {
        sites: ['sce010'],
        count: '1',
        countMode: 'fixed',
        category: 'daily',
        date: new Date().toISOString().split('T')[0]
    };
    
    try {
        console.log('📤 發送測試請求...');
        console.log('📦 測試資料:', JSON.stringify(testData, null, 2));
        console.log('');
        
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });
        
        console.log(`📥 回應狀態: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ 錯誤回應:', errorText);
            return;
        }
        
        const result = await response.json();
        console.log('✅ 成功連接到 N8N！');
        console.log('📄 回應內容:', JSON.stringify(result, null, 2));
        console.log('\n💡 提示：如果看到 "Workflow 已接收請求"，表示 N8N 連接正常！');
        
    } catch (error) {
        console.error('❌ 連接失敗:', error.message);
        console.log('\n🔧 請檢查：');
        console.log('1. N8N 是否正在運行（http://localhost:5678）');
        console.log('2. Webhook URL 是否正確');
        console.log('3. N8N Workflow 是否已啟動（Active）');
    }
}

testN8NConnection();


