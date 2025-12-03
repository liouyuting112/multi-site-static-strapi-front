// =========================================================
// 批量為 site1~site5 的 Page（about/contact/privacy）設定 imageUrl
// ---------------------------------------------------------
// 邏輯：
// - 從 Strapi 抓出所有 Page（limit=1000）
// - 只處理 site1~site5，且 type 為 about/contact/privacy
// - 從 html 中提取第一個 <img src="..."> 作為 imageUrl
// - 如果 html 沒有圖片，根據 site + type 推斷圖片 URL
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const SITES = ['site1', 'site2', 'site3', 'site4', 'site5'];
const PAGE_TYPES = ['home', 'about', 'contact', 'privacy'];

// =========================================================
// 從 Strapi 抓取所有 Page
// =========================================================

async function getAllPages() {
  const url = `${STRAPI_URL}/api/pages?pagination[limit]=1000`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`獲取 Page 失敗 (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

// =========================================================
// 從 html 裡抓第一個 <img src="..."> 當圖片 URL
// =========================================================

function extractImageUrlFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  return match ? match[1] : null;
}

// =========================================================
// 根據 site + type 推斷圖片 URL
// =========================================================

function guessPageImageUrl(site, type) {
  if (!site || !type) return null;
  
  // 根據 shared-assets 目錄的命名規則
  // site1-hero.webp, site1-about.webp, site1-contact.webp
  const baseUrl = 'https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets';
  
  if (type === 'home') {
    return `${baseUrl}/${site}-hero.webp?raw=true`;
  } else if (type === 'about' || type === 'contact') {
    return `${baseUrl}/${site}-${type}.webp?raw=true`;
  }
  
  // privacy 可能沒有專用圖片，返回 null
  return null;
}

// =========================================================
// 更新 Page 的 imageUrl
// =========================================================

async function updatePageImageUrl(pageIdOrDocumentId, imageUrl) {
  const url = `${STRAPI_URL}/api/pages/${pageIdOrDocumentId}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const payload = {
    data: {
      imageUrl: imageUrl
    }
  };

  let res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  // 如果 404，嘗試用 documentId 轉成真正的 id
  if (res.status === 404) {
    const allUrl = `${STRAPI_URL}/api/pages?pagination[limit]=1000`;
    const allRes = await fetch(allUrl, { headers });
    if (allRes.ok) {
      const allData = await allRes.json();
      const hit = (allData.data || []).find(
        (p) =>
          p.documentId === pageIdOrDocumentId ||
          String(p.id) === String(pageIdOrDocumentId)
      );
      if (hit && hit.id && String(hit.id) !== String(pageIdOrDocumentId)) {
        const newUrl = `${STRAPI_URL}/api/pages/${hit.id}`;
        res = await fetch(newUrl, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      }
    }
  }

  if (!res.ok) {
    throw new Error(`更新失敗 (${res.status}): ${await res.text()}`);
  }
}

// =========================================================
// 主流程
// =========================================================

async function main() {
  console.log('📷 開始為 site1~site5 的 Page 設定 imageUrl...\n');

  const pages = await getAllPages();
  console.log(`📊 取得 ${pages.length} 個 Page\n`);

  let updated = 0;
  let skipped = 0;

  for (const item of pages) {
    const attrs = item.attributes || item;
    const site = attrs.site;
    const type = attrs.type;
    const currentImageUrl = attrs.imageUrl;
    const html = attrs.html;

    if (!SITES.includes(site)) {
      skipped++;
      continue;
    }

    if (!PAGE_TYPES.includes(type)) {
      skipped++;
      continue;
    }

    // 1. 先嘗試從 html 中抓第一個 <img src="...">
    let imageUrl = extractImageUrlFromHtml(html);

    // 2. 如果 html 沒有圖片，再用推斷規則
    if (!imageUrl) {
      imageUrl = guessPageImageUrl(site, type);
    }

    if (!imageUrl) {
      console.log(`⏭️  跳過：${site} / ${type} - 找不到圖片 URL`);
      skipped++;
      continue;
    }

    // 如果已經有 imageUrl，且相同，就不再更新
    if (currentImageUrl && currentImageUrl === imageUrl) {
      console.log(`⏭️  已有相同 imageUrl，跳過：${site} / ${type}`);
      skipped++;
      continue;
    }

    console.log(`📝 更新 ${site} / ${type}`);
    console.log(`    imageUrl: ${currentImageUrl || '(空)'} -> ${imageUrl}`);

    const pageIdOrDocumentId = item.documentId || item.id;
    if (!pageIdOrDocumentId) {
      console.log(
        `    ❌ 找不到 id / documentId，跳過（拿到的 key 有：${Object.keys(item).join(
          ', '
        )}）`
      );
      skipped++;
      continue;
    }

    try {
      await updatePageImageUrl(pageIdOrDocumentId, imageUrl);
      updated++;
      console.log(`    ✅ 更新成功\n`);
    } catch (error) {
      console.error(`    ❌ 更新失敗: ${error.message}\n`);
      skipped++;
    }
  }

  console.log('========================================');
  console.log(`✅ 完成 - 更新 ${updated} 個，跳過 ${skipped} 個`);
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});

