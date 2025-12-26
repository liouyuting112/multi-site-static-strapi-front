// 同步本機 HTML 的 imageUrl 到 Strapi posts/pages
// 只更新 imageUrl，其他欄位維持後台現有內容

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const path = require('path');

// 使用現有的核心模組 & API 模組
const core = require('./上傳核心模組.cjs');
const api = require('./上傳API模組.cjs');

// 專案根目錄（「一個主題多個站(雲端)」）
const ROOT_DIR = path.resolve(__dirname, '..');

// ===== Strapi 設定（Railway 雲端環境） =====
const CONFIGS = {
  production: {
    url: 'https://multi-site-strapi-backend-production.up.railway.app',
    token: '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993'
  },
  development: {
    url: 'https://multi-site-strapi-backend-production.up.railway.app',
    token: '55f0580acab131abb8b2ddf799949b620a5ce912870030d61a46732f92e794512eda3634fe07397be92e6bc5399a444534269c0affd7b3eabd3a80136146406bf012eb491b17dcf8587af650e9b0a68f75d63cd733b748352df1da591f5c811c4e29ded4b64d9c016ab8f91dd623fc5c813b7705162b87fa29443d3a5e6b1993'
  }
};

// ===== 掃描 HTML 檔案 =====
function walkHtmlFiles(baseDir) {
  const result = [];
  function walk(dir) {
    const list = fs.readdirSync(dir);
    for (const name of list) {
      const p = path.join(dir, name);
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        // 跳過不相關資料夾
        if (['node_modules', '獨立腳本包', '.git', '圖片偵測測試'].includes(name)) continue;
        walk(p);
      } else if (name.endsWith('.html')) {
        result.push(p);
      }
    }
  }
  walk(baseDir);
  return result;
}

// 用本機 HTML 推算出應該的 imageUrl
function getImageUrlFromHtml(filePath) {
  const html = core.readHtmlFile(filePath);
  if (!html) return null;

  // 先用核心模組抓第一張圖片
  const img = core.extractImageUrl(html);
  if (img) return img;

  return null;
}

// 從檔案路徑推 site / slug / type / title
function getMetaFromFile(filePath) {
  const html = core.readHtmlFile(filePath);
  if (!html) return null;

  const fileType = core.detectFileType(filePath, html); // {type, category, slug, pageType}
  if (!fileType) return null;

  // 站點名稱：用上傳核心模組的 extractSiteName
  const folderPath = path.dirname(filePath);
  const site = core.extractSiteName(folderPath);
  const title = core.extractTitle(html, null);

  return {
    site,
    fileType,
    title
  };
}

// ===== 更新 Strapi =====

// 只改 imageUrl，其它欄位用後台現有的 attributes
async function updatePostImageUrl(strapiUrl, token, existing, newImageUrl) {
  const attrs = existing.attributes || existing;

  if (!newImageUrl || attrs.imageUrl === newImageUrl) {
    return { updated: false, reason: '無新圖片或相同 URL' };
  }

  // 只更新 imageUrl，避免夾帶 id 造成 Strapi 驗證錯誤
  const payload = {
    imageUrl: newImageUrl
  };

  await api.savePost(strapiUrl, token, existing, payload);
  return { updated: true, oldUrl: attrs.imageUrl || null, newUrl: newImageUrl };
}

// extraMeta: { slug?, type?, title? }，只在後台為空時補上
async function updatePageImageUrl(strapiUrl, token, existing, newImageUrl, extraMeta = {}) {
  const attrs = existing.attributes || existing;

  const payload = {};

  // imageUrl
  if (newImageUrl && attrs.imageUrl !== newImageUrl) {
    payload.imageUrl = newImageUrl;
  }

  // 只有在後台沒填時，才補 slug / type / title
  if (!attrs.slug && extraMeta.slug) {
    payload.slug = extraMeta.slug;
  }
  if (!attrs.type && extraMeta.type) {
    payload.type = extraMeta.type;
  }
  if (!attrs.title && extraMeta.title) {
    payload.title = extraMeta.title;
  }

  if (Object.keys(payload).length === 0) {
    return { updated: false, reason: '無需更新' };
  }

  await api.savePage(strapiUrl, token, existing, payload);
  return { updated: true, oldUrl: attrs.imageUrl || null, newUrl: newImageUrl };
}

// 把單一 HTML 對應到 Strapi 並更新 imageUrl
async function syncOneFile(strapiUrl, token, filePath) {
  const meta = getMetaFromFile(filePath);
  if (!meta) return { skipped: true, reason: '無法判斷型別' };

  const imageUrl = getImageUrlFromHtml(filePath);
  if (!imageUrl) return { skipped: true, reason: 'HTML 沒有圖片' };

  const { site, fileType, title } = meta;
  const { type, slug, category, pageType } = fileType;

  if (type === 'post') {
    const existing = await api.findExistingPost(strapiUrl, token, site, slug);
    if (!existing) return { skipped: true, reason: '後台找不到對應 post' };

    const r = await updatePostImageUrl(strapiUrl, token, existing, imageUrl);
    return { ...r, kind: 'post', site, slug, filePath };
  }

  if (type === 'page') {
    const existing = await api.findExistingPage(strapiUrl, token, site, fileType.pageType);
    if (!existing) return { skipped: true, reason: '後台找不到對應 page' };

    const r = await updatePageImageUrl(strapiUrl, token, existing, imageUrl, {
      slug: fileType.slug,
      type: fileType.pageType,
      title
    });
    return { ...r, kind: 'page', site, slug: fileType.pageType, filePath };
  }

  return { skipped: true, reason: '不支援的型別' };
}

// 同步整個環境（所有 html）
async function syncAllForEnv(envKey) {
  const cfg = CONFIGS[envKey];
  console.log(`\n🚀 開始同步 ${envKey} 環境 (${cfg.url}) 的 imageUrl`);

  const htmlFiles = walkHtmlFiles(ROOT_DIR);
  console.log(`📂 找到 HTML 檔案 ${htmlFiles.length} 個\n`);

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of htmlFiles) {
    try {
      const res = await syncOneFile(cfg.url, cfg.token, file);
      if (res.updated) {
        updated++;
        console.log(`✅ [${res.kind}] ${res.site} - ${res.slug}`);
        console.log(`   檔案: ${path.relative(ROOT_DIR, file)}`);
        console.log(`   舊: ${res.oldUrl || '(空)'}`);
        console.log(`   新: ${res.newUrl}\n`);
      } else {
        skipped++;
      }
    } catch (e) {
      errors++;
      console.log(`❌ 同步失敗: ${path.relative(ROOT_DIR, file)} → ${e.message}\n`);
    }

    // 稍微休息一下，避免請求太頻繁
    await new Promise(r => setTimeout(r, 80));
  }

  console.log(`\n📊 統計 (${envKey}):`);
  console.log(`   ✅ 更新: ${updated}`);
  console.log(`   ⏭️ 略過: ${skipped}`);
  console.log(`   ❌ 失敗: ${errors}\n`);
}

(async () => {
  const arg = process.argv[2] || 'all';
  if (arg === 'all') {
    await syncAllForEnv('production');
    await syncAllForEnv('development');
  } else if (arg === 'production' || arg === 'development') {
    await syncAllForEnv(arg);
  } else {
    console.log('用法:');
    console.log('  node 同步ImageUrl到Strapi.cjs production');
    console.log('  node 同步ImageUrl到Strapi.cjs development');
    console.log('  node 同步ImageUrl到Strapi.cjs all');
  }
})();


