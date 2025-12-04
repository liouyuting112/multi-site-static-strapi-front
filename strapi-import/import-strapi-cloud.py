import requests
import json
import sys
import os
import re
import ssl
from pathlib import Path
from urllib3.util.ssl_ import create_urllib3_context

# 禁用 SSL 警告和驗證
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 創建自定義的 SSL 適配器（最徹底的 SSL 設定）
class SSLAdapter(requests.adapters.HTTPAdapter):
    def init_poolmanager(self, *args, **kwargs):
        # 創建最寬鬆的 SSL 上下文
        ctx = ssl._create_unverified_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        # 設定較低的安全級別和較舊的協議
        try:
            ctx.set_ciphers('DEFAULT:@SECLEVEL=1')
            # 允許較舊的 TLS 版本
            ctx.minimum_version = ssl.TLSVersion.MINIMUM_SUPPORTED
            ctx.maximum_version = ssl.TLSVersion.MAXIMUM_SUPPORTED
        except:
            pass
        kwargs['ssl_context'] = ctx
        return super().init_poolmanager(*args, **kwargs)

# 創建 session 並設定 SSL 適配器
session = requests.Session()
session.mount('https://', SSLAdapter())

# 額外設定：強制 urllib3 使用不驗證的 SSL
try:
    import urllib3.poolmanager
    orig_init = urllib3.poolmanager.PoolManager.__init__
    def new_init(self, *args, **kwargs):
        if 'ssl_context' not in kwargs:
            ctx = ssl._create_unverified_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            kwargs['ssl_context'] = ctx
        return orig_init(self, *args, **kwargs)
    urllib3.poolmanager.PoolManager.__init__ = new_init
except:
    pass

# =========================================================
# 🎯 設置區塊：請檢查並修改以下變數
# =========================================================

# 1. Strapi 伺服器基礎 URL（雲端 Strapi）
STRAPI_BASE_URL = os.getenv('STRAPI_URL', 'https://tidy-fireworks-ad201d981a.strapiapp.com')

# 2. 您的 Full Access API 權杖（從環境變數讀取）
API_TOKEN = os.getenv('STRAPI_TOKEN', '')

if not API_TOKEN:
    print('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數')
    print('\n請執行：')
    print('  $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"')
    print('  $env:STRAPI_TOKEN="你的API_TOKEN"')
    print('  python import-strapi-cloud.py')
    sys.exit(1)

# 3. API 端點
POSTS_ENDPOINT = "/api/posts"
PAGES_ENDPOINT = "/api/pages"

# =========================================================
# 🛠️ 工具函數
# =========================================================

def extract_title(html_content):
    """從 HTML 提取標題"""
    match = re.search(r'<title>([^<]+)</title>', html_content, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        # 移除網站名稱（例如 " | 像素時光"）
        title = re.sub(r'\s*\|\s*.*$', '', title)
        return title
    return 'Untitled'

def extract_article_content(html_content):
    """從 HTML 提取文章內容（<article class="article-content">）"""
    # 優先提取 <article class="article-content">
    match = re.search(r'<article[^>]*class="article-content"[^>]*>([\s\S]*?)</article>', html_content, re.IGNORECASE)
    if match:
        content = match.group(1).strip()
        # 移除 <h1> 標題
        content = re.sub(r'<h1[^>]*>[\s\S]*?</h1>', '', content, flags=re.IGNORECASE)
        return content
    
    # 退而求其次：提取任意 <article>
    match = re.search(r'<article[^>]*>([\s\S]*?)</article>', html_content, re.IGNORECASE)
    if match:
        content = match.group(1).strip()
        content = re.sub(r'<h1[^>]*>[\s\S]*?</h1>', '', content, flags=re.IGNORECASE)
        return content
    
    return None

def extract_page_content(html_content):
    """從 HTML 提取頁面內容（<main> 或 <body>）"""
    # 優先提取 <main> 內容
    match = re.search(r'<main[^>]*>([\s\S]*?)</main>', html_content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    # 退而求其次：提取 <body> 內容
    match = re.search(r'<body[^>]*>([\s\S]*?)</body>', html_content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    return html_content

def extract_date_from_filename(filename):
    """從檔名提取日期（例如：2025-12-03.html -> 2025-12-03）"""
    match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    return match.group(1) if match else None

def extract_image_url(html_content):
    """從 HTML 提取圖片 URL"""
    match = re.search(r'<img[^>]*src=["\']([^"\']+)["\']', html_content, re.IGNORECASE)
    return match.group(1) if match else None

# =========================================================
# 🚀 API 函數
# =========================================================

def create_strapi_post(data):
    """向 Strapi 伺服器發送 POST 請求以創建文章"""
    url = f"{STRAPI_BASE_URL}{POSTS_ENDPOINT}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    payload = {"data": data}
    
    try:
        response = session.post(
            url,
            headers=headers,
            data=json.dumps(payload),
            verify=False,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"❌ 創建失敗，狀態碼: {response.status_code}")
            print(f"   錯誤: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ 請求錯誤: {str(e)}")
        return None

def update_strapi_post(post_id, data):
    """更新 Strapi 文章"""
    url = f"{STRAPI_BASE_URL}{POSTS_ENDPOINT}/{post_id}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    payload = {"data": data}
    
    try:
        response = session.put(
            url,
            headers=headers,
            data=json.dumps(payload),
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ 更新失敗，狀態碼: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 請求錯誤: {str(e)}")
        return None

def find_post_by_slug(site, slug):
    """根據 site 和 slug 查找文章"""
    url = f"{STRAPI_BASE_URL}{POSTS_ENDPOINT}?filters[site][$eq]={site}&filters[slug][$eq]={slug}"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    try:
        response = session.get(url, headers=headers, verify=False, timeout=30)
        if response.status_code == 200:
            data = response.json()
            posts = data.get('data', [])
            return posts[0] if posts else None
        return None
    except Exception as e:
        print(f"❌ 查詢錯誤: {str(e)}")
        return None

def create_strapi_page(data):
    """創建 Strapi 頁面"""
    url = f"{STRAPI_BASE_URL}{PAGES_ENDPOINT}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    payload = {"data": data}
    
    try:
        response = session.post(
            url,
            headers=headers,
            data=json.dumps(payload),
            verify=False,
            timeout=30
        )
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"❌ 創建失敗，狀態碼: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 請求錯誤: {str(e)}")
        return None

def update_strapi_page(page_id, data):
    """更新 Strapi 頁面"""
    url = f"{STRAPI_BASE_URL}{PAGES_ENDPOINT}/{page_id}"
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    payload = {"data": data}
    
    try:
        response = session.put(
            url,
            headers=headers,
            data=json.dumps(payload),
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ 更新失敗，狀態碼: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ 請求錯誤: {str(e)}")
        return None

def find_page_by_type(site, page_type):
    """根據 site 和 type 查找頁面"""
    url = f"{STRAPI_BASE_URL}{PAGES_ENDPOINT}?filters[site][$eq]={site}&filters[type][$eq]={page_type}"
    
    headers = {
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    try:
        response = session.get(url, headers=headers, verify=False, timeout=30)
        if response.status_code == 200:
            data = response.json()
            pages = data.get('data', [])
            return pages[0] if pages else None
        return None
    except Exception as e:
        print(f"❌ 查詢錯誤: {str(e)}")
        return None

# =========================================================
# 📄 匯入頁面
# =========================================================

def import_pages():
    """匯入所有站點的頁面"""
    print('📄 開始匯入頁面...\n')
    
    base_dir = Path(__file__).parent.parent
    page_defs = [
        {'type': 'home', 'file': 'index.html', 'slug': 'index'},
        {'type': 'contact', 'file': 'contact.html', 'slug': 'contact'},
        {'type': 'about', 'file': 'about.html', 'slug': 'about'},
        {'type': 'privacy', 'file': 'privacy.html', 'slug': 'privacy'}
    ]
    
    success_count = 0
    fail_count = 0
    
    for site_num in range(1, 6):
        site = f'site{site_num}'
        site_dir = base_dir / site
        
        if not site_dir.exists():
            print(f'⚠️  找不到目錄：{site}，跳過')
            continue
        
        print(f'\n處理 {site}...')
        
        for page_def in page_defs:
            file_path = site_dir / page_def['file']
            if not file_path.exists():
                print(f'  ⏭️  跳過：{page_def["file"]}（檔案不存在）')
                continue
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    html_content = f.read()
                
                title = extract_title(html_content)
                content = extract_page_content(html_content)
                
                # 檢查是否已存在
                existing = find_page_by_type(site, page_def['type'])
                
                page_data = {
                    'site': site,
                    'type': page_def['type'],
                    'slug': page_def['slug'],
                    'title': title,
                    'html': content
                }
                
                if existing:
                    # 更新
                    page_id = existing.get('id')
                    result = update_strapi_page(page_id, page_data)
                    if result:
                        print(f'  ✅ 更新：{page_def["type"]}')
                        success_count += 1
                    else:
                        print(f'  ❌ 更新失敗：{page_def["type"]}')
                        fail_count += 1
                else:
                    # 建立
                    result = create_strapi_page(page_data)
                    if result:
                        print(f'  ✅ 建立：{page_def["type"]}')
                        success_count += 1
                    else:
                        print(f'  ❌ 建立失敗：{page_def["type"]}')
                        fail_count += 1
                        
            except Exception as e:
                print(f'  ❌ 錯誤：{page_def["type"]} - {str(e)}')
                fail_count += 1
    
    print(f'\n📊 頁面匯入完成：成功 {success_count}，失敗 {fail_count}')
    return success_count, fail_count

# =========================================================
# 📝 匯入文章
# =========================================================

def import_article(site, slug, file_path, category='daily'):
    """匯入單篇文章"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        title = extract_title(html_content)
        content = extract_article_content(html_content)
        date = extract_date_from_filename(file_path.name)
        image_url = extract_image_url(html_content)
        
        if not content:
            print(f'  ⚠️  無法提取內容：{slug}')
            return False
        
        # 檢查是否已存在
        existing = find_post_by_slug(site, slug)
        
        post_data = {
            'site': site,
            'category': category,
            'slug': slug,
            'title': title,
            'html': content,
            'date': date,
            'isFeatured': True if category == 'daily' else False
        }
        
        if image_url:
            post_data['imageUrl'] = image_url
        
        if existing:
            # 更新
            post_id = existing.get('id')
            result = update_strapi_post(post_id, post_data)
            if result:
                print(f'  ✅ 更新：{slug}')
                return True
            else:
                print(f'  ❌ 更新失敗：{slug}')
                return False
        else:
            # 建立
            result = create_strapi_post(post_data)
            if result:
                print(f'  ✅ 建立：{slug}')
                return True
            else:
                print(f'  ❌ 建立失敗：{slug}')
                return False
                
    except Exception as e:
        print(f'  ❌ 錯誤：{slug} - {str(e)}')
        return False

# =========================================================
# 🚀 主程序
# =========================================================

def main():
    print('🚀 開始匯入內容到雲端 Strapi...')
    print(f'📍 Strapi URL: {STRAPI_BASE_URL}\n')
    
    # 測試連接
    try:
        print('🔍 測試連接到 Strapi...')
        response = session.get(
            f'{STRAPI_BASE_URL}/api',
            headers={'Authorization': f'Bearer {API_TOKEN}'},
            verify=False,
            timeout=30
        )
        if response.status_code == 200:
            print('✅ 連接成功！\n')
        else:
            print(f'❌ 連接失敗: {response.status_code}')
            return
    except Exception as e:
        print(f'❌ 連接錯誤: {str(e)}')
        return
    
    # 匯入頁面
    import_pages()
    
    print('\n✅ 頁面匯入完成！')
    print('\n⚠️  注意：')
    print('   1. 固定文章和每日文章需要手動匯入')
    print('   2. 使用方式：')
    print('      import_article("site1", "2025-12-03", Path("site1/articles/2025-12-03.html"), "daily")')
    print('      import_article("site1", "retro-vs-modern", Path("site1/articles/retro-vs-modern.html"), "fixed")')

if __name__ == "__main__":
    main()

