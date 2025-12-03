import requests
import json
import sys

# =========================================================
# 🎯 設置區塊：請檢查並修改以下變數
# =========================================================

# 1. Strapi 伺服器基礎 URL (如果您的 Strapi 運行在本地 1337 端口，無需修改)
STRAPI_BASE_URL = "http://localhost:1337"

# 2. 您的 Full Access API 權杖
# 警告：此權杖具有完全存取權限，請務必保密。
API_TOKEN = "const STRAPI_TOKEN =  '602523cd2c05e98b4b946318de108421572ddb19784071a69f1cefd6db708b6a7c12249c0da2f2494b40cd6d89ba564a11d4e1f65de80198056b92d72826142ee5c7750b53a710edd079fd30cd23719a76194416e305bbced2518e63ca172840a3efaa6888501419bd9634ff5f78fc822158435e00d7180accf0838934888939';"

# 3. API 端點 (根據您的內容模型 'Post' 的複數形式)
# 備註：根據您之前遇到的 405 錯誤，請先嘗試 '/api/posts'。
# 如果 '/api/posts' 再次失敗，請將其替換為您介面中看到的 '/api/pos' 再次嘗試。
API_ENDPOINT = "/api/posts"

# 4. 要導入的文章數據範例
# 請根據您的 'Post' 內容模型中的欄位名稱來定義這個數據
NEW_POST_DATA = {
    "title": "使用 Python 導入的測試文章",
    "slug": "python-import-test-1201",
    "site": "site2",
    "category": "測試數據",
    # 如果您有其他必填欄位 (例如 Body, ArticleID)，請在此處加入
    # "ArticleID": "1001", 
    # "Body": "這是文章的詳細內容..."
}

# =========================================================
# 🚀 執行區塊：無需修改
# =========================================================

def create_strapi_post(data):
    """向 Strapi 伺服器發送 POST 請求以創建文章。"""
    
    url = f"{STRAPI_BASE_URL}{API_ENDPOINT}"
    
    # HTTP 請求標頭
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }
    
    # Strapi 要求的數據結構
    payload = {"data": data}
    
    print(f"嘗試向 {url} 發送 POST 請求...")

    try:
        # 發送請求
        response = requests.post(
            url, 
            headers=headers, 
            data=json.dumps(payload),
            # 設置超時時間，避免長時間等待
            timeout=10 
        )
        
        # 檢查響應狀態碼
        if response.status_code in [200, 201]:
            print("\n✅ 文章成功創建！")
            print(f"狀態碼: {response.status_code}")
            return response.json()
        else:
            print(f"\n❌ 創建失敗，狀態碼: {response.status_code}")
            print("Strapi 響應錯誤詳情:", response.text)
            return None

    except requests.exceptions.ConnectionError as e:
        print(f"\n⚠️ 連線錯誤：無法連接到 Strapi 伺服器。")
        print("請確認 Strapi 伺服器正在運行，並且運行在 http://localhost:1337。")
        print("詳細錯誤:", e)
        sys.exit(1) # 退出程序

    except requests.exceptions.Timeout:
        print("\n⚠️ 連線超時：請求 Strapi 伺服器超時。")
        sys.exit(1)

# 運行主程序
if __name__ == "__main__":
    result = create_strapi_post(NEW_POST_DATA)
    if result:
        print("\n創建的文章數據片段:")
        # 打印部分返回的數據，例如 ID 和標題
        print(f"ID: {result.get('data', {}).get('id')}")
        print(f"標題: {result.get('data', {}).get('attributes', {}).get('title')}")
    else:
        print("\n導入過程結束，未能成功創建文章。")