// =========================================================
// 列出目前「首頁每日精選」三篇文章（isFeatured=true）
// 用法：
//   node list-featured-dailies.js          # 顯示 site1~site5 所有站的每日精選
//   node list-featured-dailies.js site3    # 只顯示指定網站的每日精選
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const headers = { 'Content-Type': 'application/json' };
if (STRAPI_TOKEN) {
  headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

function getPostAttributes(item) {
  if (item.attributes) return item.attributes;
  const { id, documentId, ...rest } = item;
  return rest;
}

async function fetchFeaturedDaily(site) {
  const url =
    `${STRAPI_URL}/api/posts` +
    `?filters[site][$eq]=${site}` +
    `&filters[category][$eq]=daily` +
    `&filters[isFeatured][$eq]=true` +
    `&sort[0]=updatedAt:desc&sort[1]=publishedAt:desc&pagination[pageSize]=10`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`抓取 ${site} featured daily 失敗 (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.data || [];
}

async function showForSite(site) {
  console.log(`\n=== ${site} 的首頁每日精選（isFeatured = true）===`);
  let posts = await fetchFeaturedDaily(site);
  if (posts.length === 0) {
    console.log('  （目前沒有任何 featured daily）');
    return;
  }

  // 以 date（或 publishedAt/updatedAt）由新到舊排序，確保最新在最上面
  posts = posts
    .map((item) => {
      const attrs = getPostAttributes(item);
      const dateValue = attrs.date || attrs.publishedAt || attrs.updatedAt || null;
      return { item, attrs, dateValue };
    })
    .sort((a, b) => {
      // 沒有日期的排在最後
      if (!a.dateValue && !b.dateValue) return 0;
      if (!a.dateValue) return 1;
      if (!b.dateValue) return -1;
      // 字串日期可以直接比較，較新的（較大的）排前面
      return a.dateValue < b.dateValue ? 1 : -1;
    });

  // 為了看得更清楚，用「日期在最前面」的方式列出
  posts.forEach(({ item, attrs }, index) => {
    const id = item.documentId || item.id;
    const displayDate = attrs.date || attrs.publishedAt || attrs.updatedAt || '無日期';

    console.log(
      `  ${index + 1}. ${displayDate} | slug: ${attrs.slug} | title: ${attrs.title} | id: ${id}`
    );
  });

  console.log('\n  ※ 日期越上面代表越新（依 updatedAt / publishedAt 排序）。你可以根據日期、slug 或 id，決定要在後台修改哪一篇，或用腳本調整 isFeatured。');
}

// CLI 入口
const args = process.argv.slice(2);

if (args.length === 1) {
  const site = args[0];
  if (!/^site[1-5]$/.test(site)) {
    console.error('❌ 站點名稱必須是 site1 ~ site5');
    process.exit(1);
  }
  await showForSite(site);
} else {
  const sites = ['site1', 'site2', 'site3', 'site4', 'site5'];
  for (const site of sites) {
    try {
      await showForSite(site);
    } catch (e) {
      console.error(`❌ 顯示 ${site} featured daily 時發生錯誤：`, e.message);
    }
  }
}


