// =========================================================
// 依 site 列出所有 Page 的圖片資訊（src / alt / imageUrl）
// 使用方法：
//   node list-page-images.js            -> 列出所有 site1~site5
//   node list-page-images.js site3      -> 只看 site3
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const args = process.argv.slice(2);
const siteFilter = args[0] || null;

function extractFirstImage(html) {
  if (!html || typeof html !== 'string') return null;
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;

  const src = match[1];
  const altMatch = html.match(/<img[^>]*alt=["']([^"']*)["'][^>]*>/i);
  const alt = altMatch ? altMatch[1] : '';

  return { src, alt };
}

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

async function main() {
  console.log('📋 列出所有 Page 的圖片資訊...\n');

  const pages = await getAllPages();
  const filtered = siteFilter
    ? pages.filter((p) => {
        const attrs = p.attributes || p;
        return attrs.site === siteFilter;
      })
    : pages;

  if (filtered.length === 0) {
    console.log('⚠️  沒有找到任何 Page');
    return;
  }

  // 依 site 和 type 分組
  const grouped = {};
  for (const item of filtered) {
    const attrs = item.attributes || item;
    const site = attrs.site;
    const type = attrs.type;

    if (!grouped[site]) {
      grouped[site] = {};
    }
    if (!grouped[site][type]) {
      grouped[site][type] = [];
    }
    grouped[site][type].push(item);
  }

  // 輸出
  for (const site of Object.keys(grouped).sort()) {
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📍 ${site.toUpperCase()}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    for (const type of ['home', 'about', 'contact', 'privacy']) {
      const items = grouped[site][type] || [];
      if (items.length === 0) continue;

      for (const item of items) {
        const attrs = item.attributes || item;
        const img = extractFirstImage(attrs.html || '');
        const imageUrl = attrs.imageUrl || '';

        console.log(`\n  📄 ${type.toUpperCase()}`);
        console.log(`     標題: ${attrs.title || '(無標題)'}`);
        console.log(`     Slug: ${attrs.slug || '(無)'}`);
        console.log(`     HTML 中的圖片:`);
        console.log(`       src: ${img?.src || '(無)'}`);
        console.log(`       alt: ${img?.alt || '(無描述)'}`);
        console.log(`     imageUrl: ${imageUrl || '(空)'}`);
      }
    }
  }

  console.log('\n');
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});

