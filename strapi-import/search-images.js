// =========================================================
// 依描述或圖片網址關鍵字搜尋圖片
// 使用方法：
//   node search-images.js 關鍵字
//   node search-images.js 瑪利歐
//   node search-images.js site1-daily1.webp
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const keyword = (process.argv[2] || '').trim();
if (!keyword) {
  console.error('請輸入要搜尋的關鍵字，例如：');
  console.error('  node search-images.js 瑪利歐');
  console.error('  node search-images.js site1-daily1.webp');
  process.exit(1);
}

function extractFirstImage(html) {
  if (!html || typeof html !== 'string') return null;
  const tagMatch = html.match(/<img[^>]*>/i);
  const srcMatch = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
  const altMatch = html.match(/<img[^>]+alt=["']([^"']*)["'][^>]*>/i);
  return {
    tag: tagMatch ? tagMatch[0] : '',
    src: srcMatch ? srcMatch[1] : '',
    alt: altMatch ? altMatch[1] : ''
  };
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
  console.log(`🖼  搜尋圖片關鍵字：「${keyword}」...\n`);
  const posts = await getAllPosts();

  const lower = keyword.toLowerCase();
  const hits = [];

  for (const item of posts) {
    const attrs = item.attributes || item;
    const img = extractFirstImage(attrs.html || '');
    const imageUrl = attrs.imageUrl || '';

    const haystack = [
      attrs.site || '',
      attrs.category || '',
      attrs.title || '',
      attrs.slug || '',
      img.tag || '',
      img.src || '',
      img.alt || '',
      imageUrl
    ]
      .join(' ')
      .toLowerCase();

    if (haystack.includes(lower)) {
      hits.push({ item, attrs, img, imageUrl });
    }
  }

  if (hits.length === 0) {
    console.log('⚠️ 沒有找到符合關鍵字的圖片');
    return;
  }

  hits.forEach(({ attrs, img, imageUrl }) => {
    console.log('----------------------------------------');
    console.log(`site      : ${attrs.site}`);
    console.log(`category  : ${attrs.category}`);
    console.log(`title     : ${attrs.title}`);
    console.log(`slug      : ${attrs.slug}`);
    console.log(`html img  : ${img.tag || '(無)'}`);
    console.log(`imageUrl  : ${imageUrl || '(空)'}`);
  });

  console.log(`\n✅ 找到 ${hits.length} 筆結果`);
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  process.exit(1);
});





