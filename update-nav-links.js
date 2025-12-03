// =========================================================
// 更新所有頁面的「每日精選文章」連結為最新文章
// 用法: node update-nav-links.js
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// =========================================================
// 獲取每個站點最新的每日文章
// =========================================================

async function getLatestDailyArticle(site) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&sort=publishedAt:desc&pagination[limit]=1`;
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ 查詢 ${site} 最新文章失敗 (${response.status})`);
            return null;
        }
        
        const data = await response.json();
        const posts = data.data || [];
        
        if (posts.length > 0) {
            const post = posts[0];
            const attrs = post.attributes || post;
            return attrs.slug;
        }
        
        return null;
    } catch (error) {
        console.error(`❌ 查詢 ${site} 最新文章失敗:`, error.message);
        return null;
    }
}

// =========================================================
// 更新 HTML 文件中的「每日精選文章」連結
// =========================================================

async function updateNavLinks() {
    console.log('🚀 開始更新所有頁面的「每日精選文章」連結...\n');
    
    // 獲取每個站點的最新文章 slug
    const latestSlugs = {};
    
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        console.log(`📡 查詢 ${site} 的最新每日文章...`);
        const latestSlug = await getLatestDailyArticle(site);
        
        if (latestSlug) {
            latestSlugs[site] = latestSlug;
            console.log(`✅ ${site} 最新文章: ${latestSlug}`);
        } else {
            console.warn(`⚠️  ${site} 沒有找到每日文章，使用預設: 2025-12-03`);
            latestSlugs[site] = '2025-12-03'; // 預設值
        }
    }
    
    console.log('\n📝 開始更新 HTML 文件...\n');
    
    // 更新每個站點的所有 HTML 文件
    for (let i = 1; i <= 5; i++) {
        const site = `site${i}`;
        const siteDir = path.join(__dirname, site);
        const latestSlug = latestSlugs[site];
        
        if (!fs.existsSync(siteDir)) {
            console.warn(`⚠️  ${site} 目錄不存在，跳過`);
            continue;
        }
        
        console.log(`\n📂 處理 ${site} (最新文章: ${latestSlug})...`);
        
        // 查找所有 HTML 文件
        const htmlFiles = [];
        function findHtmlFiles(dir) {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                if (stat.isDirectory()) {
                    findHtmlFiles(filePath);
                } else if (file.endsWith('.html')) {
                    htmlFiles.push(filePath);
                }
            }
        }
        findHtmlFiles(siteDir);
        
        let updatedCount = 0;
        
        for (const filePath of htmlFiles) {
            
            try {
                // 讀取文件
                let content = fs.readFileSync(filePath, 'utf-8');
                let modified = false;
                
                // 匹配「每日精選文章」連結
                // 匹配格式: <a href="articles/2025-12-03.html">每日精選文章</a>
                // 或: <a href="2025-12-03.html">每日精選文章</a>
                const patterns = [
                    // 相對路徑 articles/xxx.html
                    /(<a[^>]+href=["'])(articles\/)(\d{4}-\d{2}-\d{2})(\.html)(["'][^>]*>每日精選文章<\/a>)/gi,
                    // 相對路徑 xxx.html (在 articles 目錄內)
                    /(<a[^>]+href=["'])(\d{4}-\d{2}-\d{2})(\.html)(["'][^>]*>每日精選文章<\/a>)/gi,
                ];
                
                // 替換 articles/xxx.html 格式
                content = content.replace(patterns[0], (match, prefix, articles, oldSlug, ext, suffix) => {
                    if (oldSlug !== latestSlug) {
                        modified = true;
                        return `${prefix}${articles}${latestSlug}${ext}${suffix}`;
                    }
                    return match;
                });
                
                // 替換 xxx.html 格式（在 articles 目錄內）
                content = content.replace(patterns[1], (match, prefix, oldSlug, ext, suffix) => {
                    if (oldSlug !== latestSlug) {
                        modified = true;
                        return `${prefix}${latestSlug}${ext}${suffix}`;
                    }
                    return match;
                });
                
                if (modified) {
                    // 寫回文件
                    fs.writeFileSync(filePath, content, 'utf-8');
                    updatedCount++;
                    const relativePath = path.relative(__dirname, filePath);
                    console.log(`  ✅ 已更新: ${relativePath}`);
                }
            } catch (error) {
                const relativePath = path.relative(__dirname, filePath);
                console.error(`  ❌ 處理 ${relativePath} 失敗:`, error.message);
            }
        }
        
        console.log(`\n✅ ${site} 完成，更新了 ${updatedCount} 個文件`);
    }
    
    console.log('\n🎉 所有頁面的「每日精選文章」連結已更新完成！');
}

// =========================================================
// 執行
// =========================================================

updateNavLinks().catch((err) => {
    console.error('❌ 執行失敗：', err);
    process.exit(1);
});

