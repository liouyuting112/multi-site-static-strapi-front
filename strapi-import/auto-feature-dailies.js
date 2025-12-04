// =========================================================
// 自動維護每日精選的 isFeatured：每個 site 只保留 3 篇最新的 daily=true
// 用法：
//   node auto-feature-dailies.js          # 處理 site1–site5 所有站
//   node auto-feature-dailies.js site3    # 只處理指定站
// 前置條件：
//   1. Strapi 的 Post 型別中已新增 Boolean 欄位 isFeatured（預設 false）
//   2. category = 'daily' 的文章才會被納入計算
// =========================================================

import fetch from 'node-fetch';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const headers = {
  'Content-Type': 'application/json',
};
if (STRAPI_TOKEN) {
  headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
}

async function fetchDailyPosts(site) {
  const url =
    `${STRAPI_URL}/api/posts` +
    `?filters[site][$eq]=${site}` +
    `&filters[category][$eq]=daily` +
    `&sort[0]=updatedAt:desc&sort[1]=publishedAt:desc&pagination[pageSize]=100`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`抓取 ${site} daily 文章失敗 (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.data || [];
}

async function updatePostFeatureFlag(idOrDoc, isFeatured) {
  const url = `${STRAPI_URL}/api/posts/${idOrDoc}`;
  const body = JSON.stringify({ data: { isFeatured } });
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`更新文章 ${idOrDoc} 的 isFeatured 失敗 (${res.status}): ${text}`);
  }
}

async function autoFeatureForSite(site) {
  console.log(`\n🚀 處理 ${site} 的每日精選 isFeatured ...`);

  const posts = await fetchDailyPosts(site);
  if (posts.length === 0) {
    console.log(`ℹ️  ${site} 沒有 daily 文章，跳過`);
    return;
  }

  // 按 updatedAt / publishedAt 已經在 API 層排序好了，這裡只需依 index 分配
  const toFeature = posts.slice(0, 3); // 保留前三篇
  const toUnfeature = posts.slice(3);

  const makeId = (p) => p.documentId || p.id;

  // 先把前三篇設為 isFeatured=true
  for (const p of toFeature) {
    const id = makeId(p);
    const attrs = p.attributes || p;
    if (attrs.isFeatured !== true) {
      await updatePostFeatureFlag(id, true);
      console.log(`  ✅ 設為首頁每日精選: ${attrs.slug}`);
    } else {
      console.log(`  ℹ️ 已是首頁每日精選: ${attrs.slug}`);
    }
  }

  // 其餘設為 false
  for (const p of toUnfeature) {
    const id = makeId(p);
    const attrs = p.attributes || p;
    if (attrs.isFeatured !== false) {
      await updatePostFeatureFlag(id, false);
      console.log(`  ✅ 移出首頁每日精選（保留為過去文章）: ${attrs.slug}`);
    }
  }

  console.log(`🎉 完成 ${site} 的每日精選自動分配（保留 ${toFeature.length} 篇為 isFeatured=true）`);
}

// CLI 入口
const args = process.argv.slice(2);

if (args.length === 1) {
  const site = args[0];
  if (!/^site[1-5]$/.test(site)) {
    console.error('❌ 站點名稱必須是 site1 ~ site5');
    process.exit(1);
  }
  await autoFeatureForSite(site);
} else {
  const sites = ['site1', 'site2', 'site3', 'site4', 'site5'];
  for (const site of sites) {
    try {
      await autoFeatureForSite(site);
    } catch (e) {
      console.error(`❌ 處理 ${site} 時發生錯誤:`, e.message);
    }
  }
}



