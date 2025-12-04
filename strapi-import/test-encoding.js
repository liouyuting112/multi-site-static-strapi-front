// 測試檔案編碼
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const testFile = path.join(__dirname, '..', 'site1', 'index.html');

console.log('測試檔案:', testFile);
console.log('檔案是否存在:', fs.existsSync(testFile));
console.log('');

if (fs.existsSync(testFile)) {
  // 讀取為 Buffer
  const buffer = fs.readFileSync(testFile);
  console.log('Buffer 長度:', buffer.length);
  console.log('前 20 個 bytes:', Array.from(buffer.slice(0, 20)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' '));
  console.log('');
  
  // 嘗試 UTF-8
  const utf8Content = buffer.toString('utf-8');
  console.log('UTF-8 讀取結果（前 200 字元）:');
  console.log('----------------------------------------');
  console.log(utf8Content.substring(0, 200));
  console.log('----------------------------------------');
  console.log('');
  
  // 檢查是否包含中文
  const hasChinese = /[\u4e00-\u9fff]/.test(utf8Content);
  console.log('是否包含中文字元:', hasChinese);
  
  // 檢查是否包含亂碼特徵
  const hasGarbled = /[\uFFFD]/.test(utf8Content) || (utf8Content.match(/\?[^\s<]/g) || []).length > 5;
  console.log('是否包含亂碼特徵:', hasGarbled);
  
  // 檢查特定字串
  const testStr = '這裡沒有 4K 畫質';
  const found = utf8Content.includes(testStr);
  console.log(`是否包含測試字串「${testStr}」:`, found);
  
  if (!found) {
    // 嘗試找類似的字串
    const similar = utf8Content.match(/[^\s<]{0,20}4K[^\s<]{0,20}/);
    if (similar) {
      console.log('找到類似字串:', similar[0]);
    }
  }
}


