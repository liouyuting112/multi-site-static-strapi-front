// =========================================================
// 編輯?��??��?/?�述工具
// ?�於修改首�??��??��??��?述�?�?
// =========================================================

import fetch from 'node-fetch';
import readline from 'readline';

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.STRAPI_TOKEN || '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';

async function getPostFromStrapi(site, slug) {
    try {
        const url = `${STRAPI_URL}/api/posts?filters[site][$eq]=${site}&filters[slug][$eq]=${slug}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
            console.error(`???��??��?失�? (${response.status}):`, await response.text());
            return null;
        }
        
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            return data.data[0];
        }
        
        return null;
    } catch (error) {
        console.error('???��??��?失�?:', error.message);
        return null;
    }
}

async function updatePostExcerpt(postId, excerpt) {
    try {
        const url = `${STRAPI_URL}/api/posts/${postId}`;
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (STRAPI_TOKEN) {
            headers['Authorization'] = `Bearer ${STRAPI_TOKEN}`;
        }
        
        const payload = {
            data: {
                excerpt: excerpt
            }
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`???�新失�? (${response.status}):`, errorText);
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('???�新失�?:', error.message);
        return false;
    }
}

async function editExcerpt(site, slug) {
    console.log(`\n?? �?��?��??��?: ${site} - ${slug}...\n`);
    
    const post = await getPostFromStrapi(site, slug);
    
    if (!post) {
        console.error(`???��??��?�? ${site} - ${slug}`);
        return;
    }
    
    const attrs = post.attributes || post;
    const postId = post.documentId || post.id;
    const currentExcerpt = attrs.excerpt || '';
    
    console.log(`???�到?��?: ${attrs.title}\n`);
    console.log(`?? ?��??�述:`);
    console.log(`   ${currentExcerpt || '(?��?�?'}\n`);
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    return new Promise((resolve) => {
        rl.question('請輸?�新?��?述�???Enter 使用?��??�述�?\n', async (newExcerpt) => {
            rl.close();
            
            const finalExcerpt = newExcerpt.trim() || currentExcerpt;
            
            if (!finalExcerpt) {
                console.log('?��?  ?�述?�空，已?��?');
                resolve(false);
                return;
            }
            
            console.log(`\n?? �?��?�新??Strapi...`);
            console.log(`?��?�? ${finalExcerpt}\n`);
            
            const success = await updatePostExcerpt(postId, finalExcerpt);
            
            if (success) {
                console.log('???�述已�??�更?��?');
                console.log('?�� ?�新?�端?�面?�可?�到?��?述\n');
            } else {
                console.log('???�新失�?\n');
            }
            
            resolve(success);
        });
    });
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 3 || args[0] !== 'edit') {
        console.log(`
?? 編輯?��??�述工具

使用?��?:
  node edit-excerpt.js edit <site> <slug>

範�?:
  node edit-excerpt.js edit site1 retro-vs-modern

說�?:
  - ?�個工?�用?�修?��??�固定�?章�??�述?��?
  - ?�述?�顯示在首�??�「精?�攻?�」�?塊中
  - 如�? Strapi 中�???excerpt 字段，�??�在 Content-Type Builder 中添??
        `);
        return;
    }
    
    await editExcerpt(args[1], args[2]);
}

main().catch(error => {
    console.error('???��?失�?:', error);
    process.exit(1);
});






