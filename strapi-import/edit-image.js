// =========================================================
// 針對「圖片」進行快速編輯
// 功能：
//   - 顯示指定文章目前的 img / imageUrl
//   - 讓你選擇：
//       1) 編輯 html 裡第一個 <img>（同時改 src + alt）
//       2) 只改 imageUrl
// 使用方法：
//   node edit-image.js site3 2025-12-02
//   node edit-image.js site1 retro-vs-modern
// =========================================================

import fetch from 'node-fetch';
import readline from 'readline';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const [siteArg, slugArg] = process.argv.slice(2);

if (!siteArg || !slugArg) {
  console.error('用法：');
  console.error('  node edit-image.js site3 2025-12-02');
  console.error('  node edit-image.js site1 retro-vs-modern');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise((resolve) => rl.question(q, resolve));
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

function replaceFirstImage(html, newSrc, newAlt) {
  if (!html || typeof html !== 'string') return html;

  // 如果沒有 <img>，直接在最前面插一張
  if (!/<img[^>]*>/i.test(html)) {
    const imgTag = `<img src="${newSrc}" alt="${newAlt || ''}">`;
    return imgTag + '\n' + html;
  }

  let updated = html;

  // 更新 src
  updated = updated.replace(
    /(<img[^>]+src=["'])([^"']+)(["'][^>]*>)/i,
    (_m, p1, _old, p3) => `${p1}${newSrc}${p3}`
  );

  if (newAlt !== undefined) {
    if (/<img[^>]+alt=["'][^"']*["'][^>]*>/i.test(updated)) {
      updated = updated.replace(
        /(<img[^>]+alt=["'])([^"']*)(["'][^>]*>)/i,
        (_m, p1, _old, p3) => `${p1}${newAlt}${p3}`
      );
    } else {
      // 沒有 alt，就插入一個
      updated = updated.replace(
        /(<img[^>]*)(>)/i,
        (_m, p1, p2) => `${p1} alt="${newAlt}"${p2}`
      );
    }
  }

  return updated;
}

async function getPostBySiteAndSlug(site, slug) {
  const qs = `filters[site][$eq]=${encodeURIComponent(
    site
  )}&filters[slug][$eq]=${encodeURIComponent(slug)}`;
  const url = `${STRAPI_URL}/api/posts?${qs}&pagination[limit]=1`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`查詢文章失敗 (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  if (!data.data || data.data.length === 0) return null;
  return data.data[0];
}

async function updatePost(idOrDocumentId, patch) {
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;

  const payload = { data: patch };

  let url = `${STRAPI_URL}/api/posts/${idOrDocumentId}`;
  let res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (res.status === 404) {
    // 嘗試用 documentId 轉 id
    const allUrl = `${STRAPI_URL}/api/posts?pagination[limit]=1000`;
    const allRes = await fetch(allUrl, { headers });
    if (allRes.ok) {
      const allData = await allRes.json();
      const hit = (allData.data || []).find(
        (p) =>
          p.documentId === idOrDocumentId ||
          String(p.id) === String(idOrDocumentId)
      );
      if (hit && hit.id && String(hit.id) !== String(idOrDocumentId)) {
        url = `${STRAPI_URL}/api/posts/${hit.id}`;
        res = await fetch(url, {
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

async function main() {
  console.log(`🖼  編輯圖片：site=${siteArg}, slug=${slugArg}\n`);

  const post = await getPostBySiteAndSlug(siteArg, slugArg);
  if (!post) {
    console.error('⚠️ 找不到這篇文章，請確認 site / slug 是否正確');
    rl.close();
    return;
  }

  const attrs = post.attributes || post;
  const img = extractFirstImage(attrs.html || '');
  const imageUrl = attrs.imageUrl || '';

  console.log(`標題     : ${attrs.title}`);
  console.log(`分類     : ${attrs.category}`);
  console.log(`目前 img : ${img.tag || '(沒有 <img>)'}`);
  console.log(`imageUrl : ${imageUrl || '(空)'}`);
  console.log('\n你想要怎麼改？');
  console.log('1) 改 html 裡第一張圖（src + alt）');
  console.log('2) 只改 imageUrl（首頁縮圖）');

  const choice = await question('請輸入選項 (1/2): ');

  if (choice.trim() === '1') {
    const newSrc =
      (await question(`新圖片 URL（目前: ${img.src || '(無)'}）：`)) ||
      img.src ||
      '';
    const newAlt =
      (await question(`新描述 alt（目前: ${img.alt || '(空)'}）：`)) ||
      img.alt ||
      '';

    const newHtml = replaceFirstImage(attrs.html || '', newSrc, newAlt);
    await updatePost(post.documentId || post.id, { html: newHtml });
    console.log('\n✅ 已更新 html 裡的圖片（src + alt）');
  } else if (choice.trim() === '2') {
    const newUrl =
      (await question(`新 imageUrl（目前: ${imageUrl || '(空)'}）：`)) ||
      imageUrl ||
      '';
    await updatePost(post.documentId || post.id, { imageUrl: newUrl });
    console.log('\n✅ 已更新 imageUrl');
  } else {
    console.log('已取消，不做任何修改');
  }

  rl.close();
}

main().catch((err) => {
  console.error('❌ 執行失敗：', err);
  rl.close();
  process.exit(1);
});




