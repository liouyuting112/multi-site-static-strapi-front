// =========================================================
// 將 site1 ~ site5 裡「純文字的 2023」批次改成 2025
// ---------------------------------------------------------
// 安全設計：
// - 只處理 site1 ~ site5 目錄
// - 只處理 .html / .css 檔案（不動 .js、Strapi 工具）
// - 使用正則：只替換「單純的 2023」，不動像 2023-12-01 這種 slug / 日期
//   也就是說：
//   - "2023"      -> "2025"
//   - "2023年"    -> "2025年"
//   - "&copy; 2023" -> "&copy; 2025"
//   - 不會改 "2023-12-01"、"2023-11-25" 等
// ---------------------------------------------------------
// 使用方式（在專案根目錄執行）：
//   node update-2023-to-2025.js
// =========================================================

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const SITES = ['site1', 'site2', 'site3', 'site4', 'site5'];

/** 判斷是否是要處理的檔案 */
function shouldProcessFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.html' && ext !== '.css') return false;
  // 只處理 site1~5 目錄底下的檔案
  return SITES.some((site) => filePath.includes(path.sep + site + path.sep));
}

/** 將內容中的「純文字 2023」改成 2025（保留 2023-xx-xx 這種） */
function replaceYear(content, filePath) {
  // 只要不是緊接著 -NN-NN 的 2023 都會被換成 2025
  // 例如：
  //   2023         -> 2025
  //   2023年       -> 2025年
  //   &copy; 2023  -> &copy; 2025
  //   2023-12-01   -> 保留
  const before = content;
  const after = content.replace(/2023(?!-\d{2}-\d{2})/g, '2025');

  if (before !== after) {
    console.log(`✅ 已更新年份: ${filePath}`);
  }

  return after;
}

function walkAndUpdate(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walkAndUpdate(fullPath);
    } else if (entry.isFile()) {
      if (!shouldProcessFile(fullPath)) continue;

      const content = fs.readFileSync(fullPath, 'utf-8');
      if (!content.includes('2023')) continue;

      const updated = replaceYear(content, fullPath);
      if (updated !== content) {
        fs.writeFileSync(fullPath, updated, 'utf-8');
      }
    }
  }
}

function main() {
  console.log('📆 開始將 site1~site5 的文字年份 2023 批次改成 2025（保留 2023-xx-xx slug）');
  for (const site of SITES) {
    const sitePath = path.join(ROOT, site);
    if (fs.existsSync(sitePath)) {
      console.log(`\n=== 處理 ${site} ===`);
      walkAndUpdate(sitePath);
    } else {
      console.log(`⚠️ 找不到目錄: ${sitePath}，跳過`);
    }
  }
  console.log('\n✅ 處理完成。請重新整理瀏覽器檢查效果。');
}

main();




