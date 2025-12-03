// =========================================================
// 將所有站點的「每日精選」文章 slug 一次改回對應的檔名
// 目標：避免 404（例如 slug 是 2025-11-29，但檔名是 2023-12-01.html）
//
// 規則：
// - 每個站點（site1~site5）都有 3 篇 daily 文章
// - 專案中的檔名固定為：
//   - 2023-12-03.html
//   - 2023-12-02.html
//   - 2023-12-01.html
// - 依照目前 Strapi 的排序（publishedAt:desc），
//   依序把這三個 slug 指派給最新、第二新、第三新的文章
//
// 💡 日期顯示與排序由 publishedAt 控制，slug 只用來對應檔名
// =========================================================

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

// 每個站點 daily 對應的檔名（slug）
const TARGET_SLUGS = ['2023-12-03', '2023-12-02', '2023-12-01'];

// =========================================================
// 工具函數：從 Strapi 抓取某站點的 daily 文章（已按 publishedAt:desc 排序）
// =========================================================

async function getDailyPostsForSite(site) {
  try {
    const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[category][$eq]=daily&pagination[limit]=10&sort=publishedAt:desc`;
    const headers = { 'Content-Type': 'application/json' };

    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      console.error(`❌ 獲取 ${site} daily 文章失敗 (${res.status}):`, await res.text());
      return [];
    }

    const data = await res.json();
    return Array.isArray(data.data) ? data.data : [];
  } catch (err) {
    console.error(`❌ 獲取 ${site} daily 文章失敗:`, err.message);
    return [];
  }
}

// =========================================================
// 工具函數：更新單篇文章的 slug
// =========================================================

async function updatePostSlug(postId, newSlug) {
  try {
    const url = `${STRAPI_URL}/api/posts/${postId}`;
    const headers = { 'Content-Type': 'application/json' };
    if (STRAPI_TOKEN) {
      headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
    }

    const payload = { data: { slug: newSlug } };

    console.log(`     🔄 發送更新請求: PUT ${url}`);
    console.log(`     📦 更新內容:`, JSON.stringify(payload, null, 2));

    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload)
    });

    console.log(`     📥 回應狀態: ${res.status}`);

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`     ❌ 更新 slug 失敗 (${res.status}):`, errorText);
      return false;
    }

    // 驗證更新是否成功
    const result = await res.json();
    const updatedSlug = result.data?.attributes?.slug || result.data?.slug;
    console.log(`     ✅ slug 已更新為 ${updatedSlug}`);
    return true;
  } catch (err) {
    console.error('     ❌ 更新 slug 失敗:', err.message);
    return false;
  }
}

// =========================================================
// 主流程：依照目前排序，為每個站點指派對應的檔名 slug
// =========================================================

async function main() {
  console.log('\n📚 重設每日文章 slug，讓它們對應專案檔名 (2023-12-03/02/01)\n');

  const sites = ['site1', 'site2', 'site3', 'site4', 'site5'];

  let totalUpdated = 0;

  for (const site of sites) {
    console.log('\n' + '='.repeat(50));
    console.log(`🧭 處理 ${site}`);
    console.log('='.repeat(50));

    const posts = await getDailyPostsForSite(site);

    if (posts.length === 0) {
      console.log(`⚠️  ${site} 沒有 daily 文章，跳過`);
      continue;
    }

    console.log(`📊 ${site} 共有 ${posts.length} 篇 daily 文章（已按日期排序）`);

    const count = Math.min(TARGET_SLUGS.length, posts.length);

    for (let i = 0; i < count; i++) {
      const post = posts[i];
      const attrs = post.attributes || post;
      // Strapi v4 使用 id 或 documentId，優先使用 id
      const postId = post.id || post.documentId;
      const oldSlug = attrs.slug;
      const newSlug = TARGET_SLUGS[i];

      console.log(`\n  📄 第 ${i + 1} 篇: ${attrs.title}`);
      console.log(`     舊 slug: ${oldSlug}`);
      console.log(`     新 slug: ${newSlug}`);
      console.log(`     Post ID: ${postId} (id: ${post.id}, documentId: ${post.documentId})`);

      if (oldSlug === newSlug) {
        console.log('     ⏭️  slug 相同，跳過');
        continue;
      }

      // 嘗試使用 id，如果失敗則嘗試 documentId
      let ok = false;
      if (post.id) {
        ok = await updatePostSlug(post.id, newSlug);
      }
      if (!ok && post.documentId && post.documentId !== post.id) {
        console.log(`     🔄 嘗試使用 documentId: ${post.documentId}`);
        ok = await updatePostSlug(post.documentId, newSlug);
      }
      
      if (ok) totalUpdated++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ 完成！共更新 slug: ${totalUpdated} 篇文章`);
  console.log('='.repeat(50) + '\n');
}

main().catch((err) => {
  console.error('❌ 發生錯誤:', err);
  process.exit(1);
});


