#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
匯入內容到雲端 Strapi
使用方式：
    python import-to-cloud.py
"""

import os
import json
import requests
import re
from pathlib import Path

# 設定（從環境變數讀取）
STRAPI_URL = os.getenv('STRAPI_URL', 'https://tidy-fireworks-ad201d981a.strapiapp.com')
STRAPI_TOKEN = os.getenv('STRAPI_TOKEN', '')

if not STRAPI_TOKEN:
    print('❌ 錯誤：請設定 STRAPI_TOKEN 環境變數')
    print('\n請執行：')
    print('  $env:STRAPI_URL="https://tidy-fireworks-ad201d981a.strapiapp.com"')
    print('  $env:STRAPI_TOKEN="你的API_TOKEN"')
    print('  python import-to-cloud.py')
    exit(1)

# 設定 headers
headers = {
    'Content-Type': 'application/json',
    'Authorization': f'Bearer {STRAPI_TOKEN}'
}

# 禁用 SSL 驗證（僅用於開發/測試）
requests.packages.urllib3.disable_warnings()

def extract_title(html_content):
    """從 HTML 提取標題"""
    match = re.search(r'<title>([^<]+)</title>', html_content, re.IGNORECASE)
    if match:
        title = match.group(1).strip()
        # 移除網站名稱
        title = re.sub(r'\s*\|\s*.*$', '', title)
        return title
    return 'Untitled'

def extract_content(html_content):
    """從 HTML 提取內容"""
    # 優先提取 <main> 內容
    match = re.search(r'<main[^>]*>([\s\S]*?)</main>', html_content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    # 退而求其次：提取 <body> 內容
    match = re.search(r'<body[^>]*>([\s\S]*?)</body>', html_content, re.IGNORECASE)
    if match:
        return match.group(1).strip()
    
    return html_content

def import_page(site, page_type, file_path):
    """匯入單個頁面"""
    try:
        # 讀取 HTML 檔案
        with open(file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        title = extract_title(html_content)
        content = extract_content(html_content)
        
        # 檢查是否已存在
        check_url = f'{STRAPI_URL}/api/pages?filters[site][$eq]={site}&filters[type][$eq]={page_type}'
        response = requests.get(check_url, headers=headers, verify=False, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            existing = data.get('data', [])
            
            payload = {
                'data': {
                    'site': site,
                    'type': page_type,
                    'slug': page_type if page_type != 'home' else 'index',
                    'title': title,
                    'html': content
                }
            }
            
            if existing and len(existing) > 0:
                # 更新
                page_id = existing[0].get('id')
                update_url = f'{STRAPI_URL}/api/pages/{page_id}'
                response = requests.put(update_url, headers=headers, json=payload, verify=False, timeout=30)
                if response.status_code == 200:
                    print(f'  ✅ 更新：{page_type}')
                    return True
                else:
                    print(f'  ❌ 更新失敗：{page_type} ({response.status_code})')
                    return False
            else:
                # 建立
                create_url = f'{STRAPI_URL}/api/pages'
                response = requests.post(create_url, headers=headers, json=payload, verify=False, timeout=30)
                if response.status_code == 200:
                    print(f'  ✅ 建立：{page_type}')
                    return True
                else:
                    print(f'  ❌ 建立失敗：{page_type} ({response.status_code})')
                    print(f'     錯誤：{response.text[:200]}')
                    return False
        else:
            print(f'  ❌ 查詢失敗：{page_type} ({response.status_code})')
            return False
            
    except Exception as e:
        print(f'  ❌ 錯誤：{page_type} - {str(e)}')
        return False

def main():
    print('🚀 開始匯入內容到雲端 Strapi...')
    print(f'📍 Strapi URL: {STRAPI_URL}\n')
    
    # 測試連接
    try:
        print('🔍 測試連接到 Strapi...')
        response = requests.get(f'{STRAPI_URL}/api', headers=headers, verify=False, timeout=30)
        if response.status_code == 200:
            print('✅ 連接成功！\n')
        else:
            print(f'❌ 連接失敗: {response.status_code}')
            return
    except Exception as e:
        print(f'❌ 連接錯誤: {str(e)}')
        return
    
    # 匯入頁面
    print('📄 開始匯入頁面...\n')
    
    page_defs = [
        {'type': 'home', 'file': 'index.html', 'slug': 'index'},
        {'type': 'contact', 'file': 'contact.html', 'slug': 'contact'},
        {'type': 'about', 'file': 'about.html', 'slug': 'about'},
        {'type': 'privacy', 'file': 'privacy.html', 'slug': 'privacy'}
    ]
    
    base_dir = Path(__file__).parent.parent
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
            
            if import_page(site, page_def['type'], file_path):
                success_count += 1
            else:
                fail_count += 1
    
    print(f'\n📊 頁面匯入完成：成功 {success_count}，失敗 {fail_count}')
    print('\n✅ 匯入完成！')
    print('\n⚠️  注意：')
    print('   1. 固定文章和每日文章需要手動匯入')
    print('   2. 或使用 Node.js 腳本（如果 SSL 問題解決）')

if __name__ == '__main__':
    main()

