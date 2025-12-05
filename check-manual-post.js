// 檢查手動建立的 Post 資料結構
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const STRAPI_URL = 'https://effortless-whisper-83765d99df.strapiapp.com';
const STRAPI_TOKEN = '446fe66486fe83089d7896c67dd887a320d7447ac262207eb1715eb986b1c9d5f70db63f14b85f45eef6b7215b1b135b296321627e1d3f7fbabffff78add450c0b58f19123586773cb04d620d62ac713f97802ecc9b479f05ab100d4c1c973341e6de9f5aa799cf3436690e8e29b42ac5e8c754d1510805127323f205d4015ef';

const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Authorization': `Bearer ${STRAPI_TOKEN}`
};

async function checkManualPosts() {
    console.log('🔍 檢查手動建立的 Posts...\n');
    
    try {
        const response = await fetch(`${STRAPI_URL}/api/posts?pagination[limit]=5&sort=createdAt:desc`, {
            headers
        });
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            console.log(`找到 ${data.data.length} 篇手動建立的文章\n`);
            
            const post = data.data[0];
            const attrs = post.attributes || post;
            
            console.log('📋 文章資料結構：');
            console.log(JSON.stringify({
                id: post.id,
                documentId: post.documentId,
                site: attrs.site,
                category: attrs.category,
                slug: attrs.slug,
                title: attrs.title,
                html: attrs.html ? attrs.html.substring(0, 100) + '...' : null,
                htmlLength: attrs.html ? attrs.html.length : 0,
                excerpt: attrs.excerpt,
                date: attrs.date,
                imageUrl: attrs.imageUrl,
                isFeatured: attrs.isFeatured,
                publishedAt: attrs.publishedAt,
                createdAt: attrs.createdAt
            }, null, 2));
            
            console.log('\n📝 HTML 內容預覽（前 200 字元）：');
            if (attrs.html) {
                console.log(attrs.html.substring(0, 200));
                console.log('\nHTML 內容長度：', attrs.html.length, '字元');
            }
            
            return post;
        } else {
            console.log('⚠️  沒有找到手動建立的文章');
            console.log('   請先在 Strapi 後台手動建立一篇 Post，然後再執行此腳本');
            return null;
        }
    } catch (error) {
        console.error('❌ 查詢錯誤:', error.message);
        return null;
    }
}

checkManualPosts().catch(console.error);



