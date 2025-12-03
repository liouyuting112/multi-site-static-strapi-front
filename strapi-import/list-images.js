// =========================================================
// 依 site 列出所有圖片資訊（src / alt / imageUrl）
// 使用方法：
//   node list-images.js            -> 列出所有 site1~site5
//   node list-images.js site3      -> 只看 site3
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

async function getAllPosts() {
  const url = `${STRAPI_URL}/api/posts?pagination[limit]=1000`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`取得文章失敗 (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  return Array.isArray(data.data) ? data.data : [];
}

async function main() {
  console.log('🖼  讀取 Strapi 中的圖片資訊...\n');
  const posts = await getAllPosts();

  const filtered = posts.filter((item) => {
    const attrs = item.attributes || item;
    if (!attrs.site) return false;
    if (!siteFilter) return true;
    return attrs.site === siteFilter;
  });

  if (filtered.length === 0) {
    console.log('⚠️ 沒有符合條件的文章');
    return;
  }

  filtered.forEach((item) => {
    const attrs = item.attributes || item;
    const { site, category, slug, title, html, imageUrl } = attrs;
    const img = extractFirstImage(html);

    console.log('----------------------------------------');
    console.log(`site      : ${site}`);
    console.log(`category  : ${category}`);
    console.log(`title     : ${title}`);
    console.log(`slug      : ${slug}`);
    if (img) {
      console.log(`html src  : ${img.src}`);
      console.log(`html alt  : ${img.alt}`);
    } else {
      console.log('html img  : (無圖片)');
    }
    console.log(`imageUrl  : ${imageUrl || '(空)'}`);
  });

  console.log('\n✅ 完成列出圖片資訊');
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});




