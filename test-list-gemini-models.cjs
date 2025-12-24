// 測試腳本：列出可用的 Gemini 模型
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = 'AIzaSyDbPlZ9iOEJ-0tdf1fdTYUser4tEbjaUmw';

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // 嘗試列出可用模型
        console.log('🔍 正在查詢可用模型...\n');
        
        // 直接測試幾個常見的模型名稱
        const modelsToTest = [
            'gemini-pro',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
            'gemini-1.5-flash-002',
            'gemini-1.5-flash-latest',
            'models/gemini-pro',
            'models/gemini-1.5-flash'
        ];
        
        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('測試');
                console.log(`✅ ${modelName} - 可用`);
                break; // 找到一個可用的就停止
            } catch (error) {
                console.log(`❌ ${modelName} - ${error.message.split('\n')[0]}`);
            }
        }
        
    } catch (error) {
        console.error('❌ 錯誤:', error.message);
    }
}

listModels();

