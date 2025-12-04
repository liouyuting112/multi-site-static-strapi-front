// =========================================================
// 編輯 Page 的圖片（about/contact/privacy）
// 使用方法：
//   node edit-page-image.js site1 about
//   node edit-page-image.js site2 contact
// =========================================================

import fetch from 'node-fetch';
import readline from 'readline';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

const args = process.argv.slice(2);
const siteArg = args[0];
const typeArg = args[1];

if (!siteArg || !typeArg) {
  console.error('❌ 請提供 site 和 type 參數');
  console.error('   範例: node edit-page-image.js site1 about');
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(q) {
  return new Promise((resolve) => {
    rl.question(q, resolve);
  });
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
  if (!html.includes('<img')) return html;

  // 替換第一個 <img> 標籤的 src 和 alt
  return html.replace(
    /<img([^>]*?)src=["']([^"']*)["']([^>]*?)>/i,
    (match, before, oldSrc, after) => {
      // 檢查是否有 alt 屬性
      if (match.includes('alt=')) {
        return match.replace(/alt=["']([^"']*)["']/i, `alt="${newAlt}"`);
      } else {
        // 如果沒有 alt，添加一個
        return match.replace(/>$/, ` alt="${newAlt}">`);
      }
    }
  ).replace(/<img([^>]*?)src=["']([^"']*)["']/i, `<img$1src="${newSrc}"`);
}

async function getPageBySiteAndType(site, type) {
  const url = `${STRAPI_URL}/api/pages?filters[site][$eq]=${site}&filters[type][$eq]=${type}&pagination[limit]=1`;
  const headers = { 'Content-Type': 'application/json' };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`查詢失敗 (${res.status}): ${await res.text()}`);
  }

  const data = await res.json();
  if (data.data && data.data.length > 0) {
    return data.data[0];
  }
  return null;
}

async function updatePage(idOrDocumentId, patch) {
  const url = `${STRAPI_URL}/api/pages/${idOrDocumentId}`;
  const headers = {
    'Content-Type': 'application/json'
  };
  if (STRAPI_TOKEN) {
    headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
  }

  const payload = { data: patch };

  let res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(payload)
  });

  if (res.status === 404) {
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

async function main() {
  console.log(`🖼  編輯 Page 圖片：site=${siteArg}, type=${typeArg}\n`);

  const page = await getPageBySiteAndType(siteArg, typeArg);
  if (!page) {
    console.error('⚠️ 找不到這個 Page，請確認 site / type 是否正確');
    rl.close();
    return;
  }

  const attrs = page.attributes || page;
  const img = extractFirstImage(attrs.html || '');
  const imageUrl = attrs.imageUrl || '';

  console.log(`標題     : ${attrs.title || '(無標題)'}`);
  console.log(`類型     : ${attrs.type}`);
  console.log(`目前 img : ${img.tag || '(沒有 <img>)'}`);
  console.log(`imageUrl : ${imageUrl || '(空)'}`);
  console.log('\n你想要怎麼改？');
  console.log('1) 改 html 裡第一張圖（src + alt）');
  console.log('2) 只改 imageUrl（用於集中管理）');

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
    await updatePage(page.documentId || page.id, { html: newHtml });
    console.log('\n✅ 已更新 html 裡的圖片（src + alt）');
  } else if (choice.trim() === '2') {
    const newUrl =
      (await question(`新 imageUrl（目前: ${imageUrl || '(空)'}）：`)) ||
      imageUrl ||
      '';
    await updatePage(page.documentId || page.id, { imageUrl: newUrl });
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


