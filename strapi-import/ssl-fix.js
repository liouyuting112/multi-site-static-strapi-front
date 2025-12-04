// =========================================================
// SSL/TLS 修復模組
// 在所有腳本開頭 import 這個模組即可
// =========================================================

// 強制設定 SSL 選項
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// 對於 Node.js 18+，還需要設定其他選項
if (typeof process.env.OPENSSL_CONF === 'undefined') {
    // 不設定 OPENSSL_CONF，讓 Node.js 使用預設值
}

export default {};

