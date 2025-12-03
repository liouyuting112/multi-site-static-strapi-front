// =========================================================
// 部分編輯文章工具
// 可以針對文章的某幾個部分（段落、標題、圖片等）做局部修改
// =========================================================

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// =========================================================
// 工具函數：從 Strapi 取得文章
// =========================================================

async function getPostFromStrapi(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`❌ 從 Strapi 取得文章失敗 (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('❌ 從 Strapi 取得文章失敗:', error.message);
        return null;
    }
}

// =========================================================
// 工具函數：解析 HTML，拆出可編輯的部分
// =========================================================

function parseHtmlParts(html) {
    const parts = [];
    let partIndex = 0;
    
    // 使用多種模式依序尋找不同類型的內容
    const patterns = [
        { 
            name: '圖片', 
            regex: /<div[^>]*class="hero-image"[^>]*>[\s\S]*?<\/div>/gi,
            extract: (match) => {
                const imgMatch = match.match(/<img[^>]*>/i);
                const altMatch = match.match(/alt="([^"]*)"/i);
                const srcMatch = match.match(/src="([^"]*)"/i);
                return {
                    type: 'image',
                    alt: altMatch ? altMatch[1] : '',
                    src: srcMatch ? srcMatch[1] : '',
                    full: match
                };
            }
        },
        { 
            name: '段落', 
            regex: /<p[^>]*>[\s\S]*?<\/p>/gi,
            extract: (match) => ({
                type: 'paragraph',
                text: match.replace(/<[^>]*>/g, '').trim(),
                full: match
            })
        },
        { 
            name: '標題', 
            regex: /<h[2-6][^>]*>[\s\S]*?<\/h[2-6]>/gi,
            extract: (match) => ({
                type: 'heading',
                text: match.replace(/<[^>]*>/g, '').trim(),
                level: match.match(/<h([2-6])/i)[1],
                full: match
            })
        },
        { 
            name: '列表', 
            regex: /<[uo]l[^>]*>[\s\S]*?<\/[uo]l>/gi,
            extract: (match) => ({
                type: 'list',
                text: match.replace(/<[^>]*>/g, '').trim(),
                full: match
            })
        }
    ];
    
    // 收集所有匹配結果
    const allMatches = [];
    patterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
        while ((match = regex.exec(html)) !== null) {
            allMatches.push({
                index: match.index,
                pattern: pattern.name,
                data: pattern.extract(match[0]),
                original: match[0]
            });
        }
    });
    
    // 按出現順序排序
    allMatches.sort((a, b) => a.index - b.index);
    
    // 加上流水號 id
    allMatches.forEach((match, idx) => {
        match.id = idx + 1;
    });
    
    return allMatches;
}

// =========================================================
// 工具函數：顯示文章拆解後的結構
// =========================================================

function displayParts(parts) {
    console.log('\n=== 文章內容結構 ===\n');
    
    parts.forEach(part => {
        const { id, pattern, data } = part;
        
        if (data.type === 'image') {
            console.log(`  ${id}. [${pattern}] 圖片`);
            console.log(`     Alt: ${data.alt || '(空白)'}`);
            console.log(`     Src: ${data.src.substring(0, 50)}...`);
        } else if (data.type === 'paragraph') {
            const preview = data.text.substring(0, 60);
            console.log(`  ${id}. [${pattern}] ${preview}${data.text.length > 60 ? '...' : ''}`);
        } else if (data.type === 'heading') {
            console.log(`  ${id}. [${pattern}] H${data.level}: ${data.text}`);
        } else if (data.type === 'list') {
            const preview = data.text.substring(0, 60);
            console.log(`  ${id}. [${pattern}] ${preview}${data.text.length > 60 ? '...' : ''}`);
        }
        console.log('');
    });
}

// =========================================================
// 工具?�數：更?��?章到 Strapi
// =========================================================

async function updatePostToStrapi(postId, html) {
    try {
        const url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const payload = {
            data: { html }
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`???�新失�? (${response.status}):`, errorText);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('???�新失�?:', error.message);
        return false;
    }
}

// =========================================================
// 主函?��??�部?�編�?
// =========================================================

async function editParts(site, slug) {
    console.log(`\n?? �?��?��??��?: ${site} - ${slug}...\n`);
    
    const post = await getPostFromStrapi(site, slug);
    
    if (!post) {
        console.error(`???��??��?�? ${site} - ${slug}`);
        return;
    }
    
    const attrs = post.attributes || post;
    const postId = post.documentId || post.id;
    const html = attrs.html || '';
    
    console.log(`???�到?��?: ${attrs.title}\n`);
    
    // �???��?結�?
    const parts = parseHtmlParts(html);
    
    if (parts.length === 0) {
        console.log('⚠️  沒有找到可辨識的段落／標題，無法使用部分編輯模式。');
        return;
    }
    
    // 顯示結�?
    displayParts(parts);
    
    // 詢問要編輯哪一個部分
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('\n請輸入要編輯的段落編號（例如：1），或輸入 "all" 查看完整 HTML：', async (answer) => {
            const trimmed = String(answer).trim();
            
            if (trimmed.toLowerCase() === 'all') {
                console.log('\n=== 完整 HTML 內容 ===\n');
                console.log(html);
                rl.close();
                resolve(false);
                return;
            }
            
            const partId = parseInt(trimmed, 10);
            const selectedPart = parts.find(p => p.id === partId);
            
            if (!selectedPart) {
                console.log('⚠️  找不到對應的段落編號，已取消。');
                rl.close();
                resolve(false);
                return;
            }
            
            const { data, original } = selectedPart;
            
            console.log('\n=== 目前內容預覽 ===\n');
            if (data.type === 'image') {
                console.log(`圖片 Alt 描述: ${data.alt || '(空白)'}`);
                console.log(`圖片 URL      : ${data.src}`);
                console.log(`\n完整 HTML:\n${original}\n`);
            } else {
                console.log(data.text || data.full);
                console.log(`\n完整 HTML:\n${original}\n`);
            }
            
            rl.question('\n請輸入新的內容（直接按 Enter 代表取消）：', async (newContent) => {
                if (!newContent.trim()) {
                    console.log('ℹ️  未輸入新內容，已取消更新。');
                    rl.close();
                    resolve(false);
                    return;
                }
                
                // 依不同類型更新內容
                let newHtml = html;
                
                if (data.type === 'image') {
                    // 目前先只更新 Alt（如果之後要一起改 src 再擴充）
                    newHtml = newHtml.replace(
                        original,
                        original.replace(/alt="[^"]*"/i, `alt="${newContent}"`)
                    );
                } else if (data.type === 'paragraph') {
                    newHtml = newHtml.replace(original, `<p>${newContent}</p>`);
                } else if (data.type === 'heading') {
                    newHtml = newHtml.replace(original, `<h${data.level}>${newContent}</h${data.level}>`);
                } else {
                    // 其他類型直接整段替換
                    newHtml = newHtml.replace(original, newContent);
                }
                
                console.log('\n⏳ 正在將更新寫回 Strapi...');
                
                const success = await updatePostToStrapi(postId, newHtml);
                
                if (success) {
                    console.log('✅ 已成功更新文章內容。\n');
                } else {
                    console.log('❌ 更新失敗，請查看上方錯誤訊息。\n');
                }
                
                rl.close();
                resolve(success);
            });
        });
    });
}

// =========================================================
// ?�令行�???
// =========================================================

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 3 || args[0] !== 'edit') {
        console.log(`
=== 部分編輯文章工具 ===

用法:
  node edit-parts.js edit <site> <slug>

範例:
  node edit-parts.js edit site1 retro-vs-modern

功能:
  - 顯示文章結構（圖片、段落、標題、列表）
  - 選擇要編輯的部分
  - 更新選中的內容並寫回 Strapi
        `);
        return;
    }
    
    await editParts(args[1], args[2]);
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});





