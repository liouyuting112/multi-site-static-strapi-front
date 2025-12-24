// 文章生成管理系統 - 後端伺服器
// 提供 Web API 給前端介面使用

const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
const PORT = 3000;

// 排程任務儲存
let scheduledTasks = [];
const SCHEDULE_FILE = path.join(__dirname, 'schedules.json');

// 載入已儲存的排程
function loadSchedules() {
    try {
        if (fs.existsSync(SCHEDULE_FILE)) {
            const data = fs.readFileSync(SCHEDULE_FILE, 'utf8');
            scheduledTasks = JSON.parse(data);
            // 重新啟動所有排程
            scheduledTasks.forEach(schedule => {
                if (schedule.enabled) {
                    startSchedule(schedule);
                }
            });
        }
    } catch (error) {
        console.error('載入排程失敗:', error);
    }
}

// 儲存排程
function saveSchedules() {
    try {
        fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(scheduledTasks, null, 2));
    } catch (error) {
        console.error('儲存排程失敗:', error);
    }
}

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // 提供靜態檔案（HTML）

// 設定（從環境變數或預設值）
const CONFIG = {
    STRAPI_URL: process.env.STRAPI_URL || 'http://localhost:1337',
    STRAPI_TOKEN: process.env.STRAPI_TOKEN || '6a02dd00859ce2861a884a1de0b5f7eaf4ee961b0e6bf0c07c7df72d47e1c9b142a07564ffadd433ffa9b851d14629989b07d72fb09457d775f3227cca99fbaee43200ccac7a0db7d6d65185ca71b317bae9d6c0db943abb50a9e3ed9f279e536c2acba98e2f642bb44f543d1c23fac24a131ec177f23d2d496715b9c5984c76',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyDbPlZ9iOEJ-0tdf1fdTYUser4tEbjaUmw',
    SCRIPT_PATH: path.join(__dirname, '..', 'ai-generate-articles.cjs'),
    PROMPT_FILE: path.join(__dirname, '..', '下載', '新增文章提詞.txt')
};

// API: 取得所有站點列表
app.get('/api/sites', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const url = `${CONFIG.STRAPI_URL}/api/posts?` +
            `pagination[pageSize]=1000&` +
            `fields[0]=site&` +
            `sort=createdAt:desc`;
        
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.STRAPI_TOKEN}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Strapi API 錯誤: ${response.status}`);
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        // 提取所有唯一的 site
        const sites = new Set();
        posts.forEach(post => {
            const attrs = post.attributes || post;
            if (attrs.site) {
                sites.add(attrs.site);
            }
        });
        
        res.json({
            success: true,
            sites: Array.from(sites).sort()
        });
    } catch (error) {
        console.error('取得站點列表失敗:', error);
        // 如果失敗，返回預設列表
        res.json({
            success: false,
            sites: ['sce010', 'site1', 'site2', 'site3', 'cds006', 'awh008', 'dlh011'],
            error: error.message
        });
    }
});

// API: 生成文章
app.post('/api/generate', (req, res) => {
    const { sites, count, countMode, category, date } = req.body;
    
    // 驗證參數
    if (!sites || sites.length === 0) {
        return res.status(400).json({
            success: false,
            error: '請至少選擇一個網站'
        });
    }
    
    // 處理數量（如果是範圍，隨機選擇）
    let finalCount = count;
    if (countMode === 'range' && typeof count === 'string' && count.includes('-')) {
        const [min, max] = count.split('-').map(Number);
        finalCount = Math.floor(Math.random() * (max - min + 1)) + min;
        console.log(`隨機數量: ${min}-${max} → 選擇 ${finalCount}`);
    }
    
    if (!finalCount || finalCount < 1) {
        return res.status(400).json({
            success: false,
            error: '文章數量必須大於 0'
        });
    }
    
    if (!date) {
        return res.status(400).json({
            success: false,
            error: '請選擇日期'
        });
    }
    
    // 準備環境變數
    const sitesStr = sites.join(',');
    const env = {
        ...process.env,
        SITES: sitesStr,
        DATE: date,
        COUNT: finalCount.toString(),
        CATEGORY: category || 'daily',
        STRAPI_URL: CONFIG.STRAPI_URL,
        STRAPI_TOKEN: CONFIG.STRAPI_TOKEN,
        GEMINI_API_KEY: CONFIG.GEMINI_API_KEY,
        PROMPT_FILE: CONFIG.PROMPT_FILE,
        OUTPUT_JSON: 'true'
    };
    
    // 執行腳本
    const scriptPath = CONFIG.SCRIPT_PATH;
    const command = `node "${scriptPath}"`;
    
    console.log(`執行命令: ${command}`);
    console.log(`參數: sites=${sitesStr}, date=${date}, count=${finalCount}, category=${category}`);
    
    exec(command, { env, cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
        if (error) {
            console.error('執行錯誤:', error);
            return res.json({
                success: false,
                error: error.message,
                stderr: stderr
            });
        }
        
        // 嘗試從輸出中解析 JSON 結果
        let result = {
            success: true,
            message: '文章生成完成',
            output: stdout
        };
        
        // 如果輸出包含 JSON，嘗試解析
        const jsonMatch = stdout.match(/\{[\s\S]*"success"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                result = {
                    ...result,
                    ...parsed
                };
            } catch (e) {
                // JSON 解析失敗，使用原始輸出
            }
        }
        
        // 從輸出中提取統計資訊
        const successMatch = stdout.match(/✅ 成功: (\d+)/);
        const failMatch = stdout.match(/❌ 失敗: (\d+)/);
        
        if (successMatch) {
            result.successCount = parseInt(successMatch[1]);
        }
        if (failMatch) {
            result.failCount = parseInt(failMatch[1]);
        }
        
        res.json(result);
    });
});

// 執行生成（封裝成函數，供排程和手動觸發使用）
function executeGeneration({ sites, count, category, date }) {
    return new Promise((resolve, reject) => {
        const sitesStr = Array.isArray(sites) ? sites.join(',') : sites;
        const env = {
            ...process.env,
            SITES: sitesStr,
            DATE: date,
            COUNT: count.toString(),
            CATEGORY: category || 'daily',
            STRAPI_URL: CONFIG.STRAPI_URL,
            STRAPI_TOKEN: CONFIG.STRAPI_TOKEN,
            GEMINI_API_KEY: CONFIG.GEMINI_API_KEY,
            PROMPT_FILE: CONFIG.PROMPT_FILE,
            OUTPUT_JSON: 'true'
        };
        
        const scriptPath = CONFIG.SCRIPT_PATH;
        const command = `node "${scriptPath}"`;
        
        exec(command, { env, cwd: path.dirname(scriptPath) }, (error, stdout, stderr) => {
            if (error) {
                console.error('執行錯誤:', error);
                reject(error);
                return;
            }
            
            console.log('執行結果:', stdout);
            resolve({ stdout, stderr });
        });
    });
}

// 啟動排程任務
function startSchedule(schedule) {
    // 解析時間 (HH:MM)
    const [hours, minutes] = schedule.time.split(':').map(Number);
    
    // 建立 cron 表達式（每天指定時間執行）
    const cronExpression = `${minutes} ${hours} * * *`;
    
    console.log(`📅 啟動排程: ${schedule.name} (每天 ${schedule.time})`);
    
    // 如果已經有任務，先停止
    if (schedule.task) {
        schedule.task.stop();
    }
    
    const task = cron.schedule(cronExpression, async () => {
        console.log(`\n⏰ 執行排程: ${schedule.name}`);
        
        // 決定日期
        const date = schedule.useTodayDate 
            ? new Date().toISOString().split('T')[0]
            : schedule.date || new Date().toISOString().split('T')[0];
        
        // 執行生成
        try {
            await executeGeneration({
                sites: schedule.sites,
                count: schedule.count,
                category: schedule.category,
                date: date
            });
            console.log(`✅ 排程執行完成: ${schedule.name}`);
        } catch (error) {
            console.error(`❌ 排程執行失敗: ${schedule.name}`, error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Taipei"
    });
    
    schedule.task = task;
}

// API: 取得所有排程
app.get('/api/schedules', (req, res) => {
    res.json({
        success: true,
        schedules: scheduledTasks.map(s => ({
            ...s,
            task: undefined // 不返回 task 物件
        }))
    });
});

// API: 新增排程
app.post('/api/schedules', (req, res) => {
    const { name, sites, count, category, time, enabled, useTodayDate, date } = req.body;
    
    if (!name || !time) {
        return res.status(400).json({
            success: false,
            error: '請填寫排程名稱和執行時間'
        });
    }
    
    const schedule = {
        id: Date.now().toString(),
        name,
        sites: sites || [],
        count: count || 1,
        category: category || 'daily',
        time, // 格式: "HH:MM" 例如 "09:00"
        enabled: enabled !== false,
        useTodayDate: useTodayDate !== false, // 是否使用當天日期
        date: date || null, // 如果不使用當天日期，使用這個日期
        createdAt: new Date().toISOString()
    };
    
    scheduledTasks.push(schedule);
    saveSchedules();
    
    if (schedule.enabled) {
        startSchedule(schedule);
    }
    
    res.json({
        success: true,
        schedule: {
            ...schedule,
            task: undefined
        }
    });
});

// API: 更新排程
app.put('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const index = scheduledTasks.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: '排程不存在'
        });
    }
    
    // 停止舊排程
    if (scheduledTasks[index].task) {
        scheduledTasks[index].task.stop();
    }
    
    // 更新排程
    scheduledTasks[index] = {
        ...scheduledTasks[index],
        ...updates,
        id // 確保 ID 不變
    };
    
    saveSchedules();
    
    // 如果啟用，重新啟動
    if (scheduledTasks[index].enabled) {
        startSchedule(scheduledTasks[index]);
    }
    
    res.json({
        success: true,
        schedule: {
            ...scheduledTasks[index],
            task: undefined
        }
    });
});

// API: 刪除排程
app.delete('/api/schedules/:id', (req, res) => {
    const { id } = req.params;
    
    const index = scheduledTasks.findIndex(s => s.id === id);
    if (index === -1) {
        return res.status(404).json({
            success: false,
            error: '排程不存在'
        });
    }
    
    // 停止排程
    if (scheduledTasks[index].task) {
        scheduledTasks[index].task.stop();
    }
    
    scheduledTasks.splice(index, 1);
    saveSchedules();
    
    res.json({
        success: true
    });
});

// 提供 HTML 頁面
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log('🚀 文章生成管理系統已啟動');
    console.log(`📍 前端介面: http://localhost:${PORT}`);
    console.log(`📍 API 端點: http://localhost:${PORT}/api`);
    console.log('\n按 Ctrl+C 停止伺服器');
    
    // 載入已儲存的排程
    loadSchedules();
});

