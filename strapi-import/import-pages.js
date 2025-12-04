// =========================================================
// 將 site1~site5 的「靜態頁面」(home/contact/about/privacy)
// 自動匯入到 Strapi 的 Page Content Type
//
// 前提：
// - 已在 Strapi 建立 collection type `Page`，欄位包含：
//   - site (Text)
//   - type (Enumeration: home, contact, about, privacy)
//   - slug (Text)
//   - title (Text)
//   - html (Long text)
//
// 使用方式：
//   cd strapi-import
//   node import-pages.js
//   或 npm run import-pages （package.json 會加 script）
// =========================================================

// 修復 SSL/TLS 問題（必須在最前面）
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import './ssl-fix.js';

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const headers = {
  'Content-Type': 'application/json; charset=utf-8'
};
if (STRAPI_TOKEN) {
  headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

// ---------------------------------------------------------
// 讀檔 & 解析工具
// ---------------------------------------------------------

function readHtmlFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    // 先讀取為 Buffer
    const buffer = fs.readFileSync(filePath);
    
    // 嘗試多種編碼方式
    let content = null;
    const encodings = ['utf-8', 'utf8'];
    
    // 先嘗試 UTF-8
    content = buffer.toString('utf-8');
    
    // 檢查是否包含明顯的亂碼特徵（常見的 Big5/ANSI 被誤讀為 UTF-8 的結果）
    const hasGarbledChars = /[\uFFFD]/.test(content) || 
                            (content.match(/\?[^\s<]/g) || []).length > 5;
    
    if (hasGarbledChars) {
      console.warn(`⚠️  檔案 ${filePath} 可能編碼有問題，檢測到亂碼字元`);
      console.warn(`   前 100 字元預覽: ${content.substring(0, 100)}`);
    }
    
    // 移除 UTF-8 BOM (如果存在)
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    
    return content;
  } catch (e) {
    console.error(`❌ 讀取檔案失敗: ${filePath}`, e.message);
    return null;
  }
}

// 擷取 <main> 內文；若沒有 main，就抓 <body> 內文並去掉 header/footer/script
function extractPageHtml(rawHtml) {
  if (!rawHtml) return null;

  // 嘗試抓 <main>
  const mainMatch = rawHtml.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) {
    return mainMatch[1].trim();
  }

  // 抓 <body>
  const bodyMatch = rawHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    let body = bodyMatch[1];
    // 去掉 script / header / footer
    body = body.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    body = body.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
    body = body.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
    return body.trim();
  }

  // 沒有 body，就全部回傳
  return rawHtml.trim();
}

// 優先用 <h1>，其次 <title>，再不行就用 slug
function extractTitle(rawHtml, fallback) {
  if (!rawHtml) return fallback;
  const h1Match = rawHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return h1Match[1].replace(/<[^>]+>/g, '').trim();
  }
  const titleMatch = rawHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return titleMatch[1].replace(/<[^>]+>/g, '').trim();
  }
  return fallback;
}

// ---------------------------------------------------------
// Strapi API
// ---------------------------------------------------------

async function findExistingPage(site, type) {
  const qs = `filters[site][$eq]=${encodeURIComponent(
    site
  )}&filters[type][$eq]=${encodeURIComponent(type)}&pagination[limit]=1`;
  const url = `${STRAPI_URL}/api/pages?${qs}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`查詢 Page 失敗 (${res.status}): ${await res.text()}`);
  }
  const data = await res.json();
  if (data.data && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}

async function createPage(payload) {
  const url = `${STRAPI_URL}/api/pages`;
  // 確保 payload 中的字串都是有效的 UTF-8
  const safePayload = {
    ...payload,
    title: String(payload.title || ''),
    html: String(payload.html || '')
  };
  // 使用 Buffer 確保編碼正確
  const jsonBody = JSON.stringify({ data: safePayload });
  const buffer = Buffer.from(jsonBody, 'utf-8');
  
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: buffer
  });
  if (!res.ok) {
    throw new Error(`建立 Page 失敗 (${res.status}): ${await res.text()}`);
  }
  return await res.json();
}

async function updatePage(idOrDocumentId, payload) {
  // 先直接用給定 id or documentId
  let url = `${STRAPI_URL}/api/pages/${idOrDocumentId}`;
  // 確保 payload 中的字串都是有效的 UTF-8
  const safePayload = {
    ...payload,
    title: String(payload.title || ''),
    html: String(payload.html || '')
  };
  // 使用 Buffer 確保編碼正確
  const jsonBody = JSON.stringify({ data: safePayload });
  const buffer = Buffer.from(jsonBody, 'utf-8');
  
  let res = await fetch(url, {
    method: 'PUT',
    headers,
    body: buffer
  });

  if (res.status === 404) {
    // 404 時嘗試把 documentId 轉成真正的數字 id
    const allUrl = `${STRAPI_URL}/api/pages?pagination[limit]=1000`;
    const allRes = await fetch(allUrl, { headers });
    if (allRes.ok) {
      const allData = await allRes.json();
      const hit = (allData.data || []).find(
        (p) =>
          p.documentId === idOrDocumentId ||
          String(p.id) === String(idOrDocumentId)
      );
      if (hit && hit.id && String(hit.id) !== String(idOrDocumentId)) {
        url = `${STRAPI_URL}/api/pages/${hit.id}`;
        const safePayload = {
          ...payload,
          title: String(payload.title || ''),
          html: String(payload.html || '')
        };
        const jsonBody = JSON.stringify({ data: safePayload });
        const buffer = Buffer.from(jsonBody, 'utf-8');
        res = await fetch(url, {
          method: 'PUT',
          headers,
          body: buffer
        });
      }
    }
  }

  if (!res.ok) {
    throw new Error(`更新 Page 失敗 (${res.status}): ${await res.text()}`);
  }
  return await res.json();
}

// ---------------------------------------------------------
// 主流程
// ---------------------------------------------------------

async function importPages() {
  console.log('📄 開始匯入 site1~site5 的 Page...\n');

  const pageDefs = [
    { type: 'home', file: 'index.html', slug: 'index' },
    { type: 'contact', file: 'contact.html', slug: 'contact' },
    { type: 'about', file: 'about.html', slug: 'about' },
    { type: 'privacy', file: 'privacy.html', slug: 'privacy' }
  ];

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (let i = 1; i <= 5; i++) {
    const site = `site${i}`;
    // 檔案在上一層目錄，不是 strapi-import/siteX
    const siteDir = path.join(__dirname, '..', site);
    if (!fs.existsSync(siteDir)) {
      console.log(`⚠️ 找不到目錄：${siteDir}，跳過`);
      continue;
    }

    console.log(`\n====== 處理 ${site} ======`);

    for (const def of pageDefs) {
      const filePath = path.join(siteDir, def.file);
      const raw = readHtmlFile(filePath);
      if (!raw) {
        console.log(`⏭️  找不到檔案：${site}/${def.file}，跳過`);
        skipped++;
        continue;
      }

      const html = extractPageHtml(raw);
      if (!html) {
        console.log(`⏭️  無法從 ${site}/${def.file} 擷取內容，跳過`);
        skipped++;
        continue;
      }

      const title = extractTitle(raw, `${site} ${def.type}`);

      // 檢查 title 和 html 是否包含亂碼
      const titleHasGarbled = /[\uFFFD]/.test(title) || (title.match(/\?[^\s<]/g) || []).length > 2;
      const htmlHasGarbled = /[\uFFFD]/.test(html) || (html.match(/\?[^\s<]/g) || []).length > 5;
      
      if (titleHasGarbled || htmlHasGarbled) {
        console.warn(`⚠️  ${site}/${def.file} 內容可能包含亂碼:`);
        if (titleHasGarbled) {
          console.warn(`   Title 預覽: ${title.substring(0, 50)}`);
        }
        if (htmlHasGarbled) {
          console.warn(`   HTML 前 100 字元: ${html.substring(0, 100)}`);
        }
        console.warn(`   請確認檔案 ${filePath} 已正確儲存為 UTF-8 編碼`);
      }

      // 強制確保 UTF-8 編碼：寫入臨時檔案再讀回（確保編碼正確）
      let finalTitle = title;
      let finalHtml = html;
      
      try {
        const tempDir = path.join(__dirname, '.temp');
        if (!fs.existsSync(tempDir)) {
          fs.mkdirSync(tempDir, { recursive: true });
        }
        const tempFile = path.join(tempDir, `temp-${site}-${def.type}.html`);
        
        // 寫入臨時檔案（明確指定 UTF-8）
        fs.writeFileSync(tempFile, html, { encoding: 'utf-8' });
        // 讀回（明確指定 UTF-8）
        finalHtml = fs.readFileSync(tempFile, { encoding: 'utf-8' });
        
        // 清理臨時檔案
        fs.unlinkSync(tempFile);
      } catch (tempErr) {
        console.warn(`⚠️  無法使用臨時檔案轉換編碼，使用原始內容: ${tempErr.message}`);
      }

      const payload = {
        site,
        type: def.type,
        slug: def.slug,
        title: finalTitle,
        html: finalHtml
      };

      try {
        const existing = await findExistingPage(site, def.type);
        if (existing) {
          const idOrDoc = existing.documentId || existing.id;
          console.log(
            `📝 更新 Page: site=${site}, type=${def.type}, slug=${def.slug}`
          );
          await updatePage(idOrDoc, payload);
          updated++;
        } else {
          console.log(
            `➕ 建立 Page: site=${site}, type=${def.type}, slug=${def.slug}`
          );
          await createPage(payload);
          created++;
        }
      } catch (e) {
        console.error(
          `❌ 處理 ${site}/${def.file} (${def.type}) 失敗：`,
          e.message
        );
        skipped++;
      }
    }
  }

  console.log('\n========================================');
  console.log(`✅ 匯入完成 - 新增 ${created} 筆，更新 ${updated} 筆，跳過 ${skipped} 筆`);
  console.log('========================================\n');
}

importPages().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});




