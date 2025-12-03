// =========================================================
// 批量為 site1~site5 的文章設定 imageUrl（圖片 URL）
// ---------------------------------------------------------
// 邏輯：
// - 從 Strapi 抓出所有 post（limit=1000）
// - 只處理 site1~site5，且目前 imageUrl 為空的文章
// - 依照 site + category + slug 推斷原本使用的圖片 URL
//   （規則與 home-cms.js 的固定圖邏輯一致）
// - 將計算出的 URL 寫入 post.imageUrl
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
// 請確認這個 Token 與其他匯入腳本相同，具有 post update 權限
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

// 站點列表（只處理這幾個）
const SITES = ['site1', 'site2', 'site3', 'site4', 'site5'];

// =========================================================
// 從 Strapi 抓取所有 post
// =========================================================

async function getAllPosts() {
  const url = `${STRAPI_URL}/api/posts?pagination[limit]=1000`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`獲取文章失敗 (${res.status}): ${await res.text()}`);
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
// 根據 site / category / slug 推斷原本使用的圖片 URL
// （與 home-cms.js 的邏輯保持一致）
// =========================================================

function guessImageUrl(attrs) {
  const { site, category, slug } = attrs;
  if (!site || !slug) return null;

  // daily：使用 siteX-daily1/2/3
  if (category === 'daily') {
    let imgName = 'daily1';
    if (slug.includes('12-03')) {
      imgName = 'daily3';
    } else if (slug.includes('12-02')) {
      imgName = 'daily2';
    } else {
      imgName = 'daily1';
    }
    return `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgName}.webp?raw=true`;
  }

  // fixed / 其他：沿用 home-cms.js 的 fixed 圖片邏輯
  let imgName = 'fixed1';

  if (site === 'site1') {
    imgName =
      slug.includes('cartridge') || slug.includes('care')
        ? 'fixed2'
        : slug.includes('collector') || slug.includes('guide')
        ? 'fixed3'
        : slug.includes('retro') || slug.includes('modern')
        ? 'fixed1'
        : 'fixed1';
  } else if (site === 'site2') {
    imgName =
      slug.includes('keyboard') || slug.includes('switches')
        ? 'fixed1'
        : slug.includes('aim') || slug.includes('training')
        ? 'fixed2'
        : slug.includes('monitor') || slug.includes('hz')
        ? 'fixed3'
        : 'fixed1';
  } else if (site === 'site3') {
    imgName =
      slug.includes('narrative')
        ? 'fixed1'
        : slug.includes('pixel')
        ? 'fixed2'
        : slug.includes('steam') || slug.includes('wishlist')
        ? 'fixed3'
        : 'fixed1';
  } else if (site === 'site4') {
    imgName =
      slug.includes('100') || slug.includes('percent')
        ? 'fixed1'
        : slug.includes('open') || slug.includes('world')
        ? 'fixed2'
        : slug.includes('souls') || slug.includes('combat')
        ? 'fixed3'
        : 'fixed1';
  } else if (site === 'site5') {
    imgName =
      slug.includes('f2p') || slug.includes('guide')
        ? 'fixed1'
        : slug.includes('phone') || slug.includes('heating')
        ? 'fixed2'
        : slug.includes('portrait') || slug.includes('games')
        ? 'fixed3'
        : 'fixed1';
  }

  return `https://github.com/liouyuting112/static-sites-monorepo-1/blob/main/shared-assets/${site}-${imgName}.webp?raw=true`;
}

// =========================================================
// 更新單篇文章的 imageUrl（支援使用 id 或 documentId）
// =========================================================

async function updatePostImageUrl(postIdOrDocumentId, imageUrl) {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const payload = { data: { imageUrl } };

  // 先直接用傳入的 postIdOrDocumentId 嘗試一次
  let url = `${STRAPI_URL}/api/posts/${postIdOrDocumentId}`;
  let res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  // 如果是 404，嘗試把 documentId 轉成真正的數字 id 再更新一次
  if (res.status === 404) {
    try {
      const all = await getAllPosts();
      const hit = all.find(
        (p) =>
          p.documentId === postIdOrDocumentId ||
          String(p.id) === String(postIdOrDocumentId)
      );
      if (hit && hit.id && String(hit.id) !== String(postIdOrDocumentId)) {
        url = `${STRAPI_URL}/api/posts/${hit.id}`;
        res = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      }
    } catch (e) {
      // 如果這一步也失敗，就維持原本的 404 錯誤
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
  console.log('📷 開始為 site1~site5 的文章設定 imageUrl...\n');

  const posts = await getAllPosts();
  console.log(`📊 取得 ${posts.length} 篇文章\n`);

  let updated = 0;
  let skipped = 0;

  for (const item of posts) {
    const attrs = item.attributes || item;
    const site = attrs.site;
    const category = attrs.category;
    const slug = attrs.slug;
    const currentImageUrl = attrs.imageUrl;
    const html = attrs.html;

    if (!SITES.includes(site)) {
      skipped++;
      continue;
    }

    // 1. 先嘗試從 html 中抓第一個 <img src="...">
    let imageUrl = extractImageUrlFromHtml(html);

    // 2. 如果 html 沒有圖片，再用舊的「猜測規則」
    if (!imageUrl) {
      imageUrl = guessImageUrl(attrs);
    }

    if (!imageUrl) {
      console.log(`⏭️  跳過：${site} / ${slug} - 找不到圖片 URL`);
      skipped++;
      continue;
    }

    // 如果已經有 imageUrl，且相同，就不再更新
    if (currentImageUrl && currentImageUrl === imageUrl) {
      console.log(`⏭️  已有相同 imageUrl，跳過：${site} / ${slug}`);
      skipped++;
      continue;
    }

    console.log(`📝 更新 ${site} / ${category} / ${slug}`);
    console.log(`    imageUrl: ${currentImageUrl || '(空)'} -> ${imageUrl}`);

    // 這裡先拿 documentId || id，實際更新時會自動在 404 時轉成真正的數字 id
    const postIdOrDocumentId = item.documentId || item.id;
    if (!postIdOrDocumentId) {
      console.log(
        `    ❌ 找不到 id / documentId，跳過（拿到的 key 有：${Object.keys(item).join(
          ', '
        )}）`
      );
      skipped++;
      continue;
    }

    try {
      await updatePostImageUrl(postIdOrDocumentId, imageUrl);
      console.log('    ✅ 已更新');
      updated++;
    } catch (err) {
      console.log(`    ❌ 更新失敗：${err.message}`);
    }
  }

  console.log('\n========================================');
  console.log(`✅ 完成！已更新 ${updated} 篇文章，跳過 ${skipped} 篇。`);
  console.log('========================================\n');
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});


