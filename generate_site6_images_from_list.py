import base64
import io
import os
from pathlib import Path

import requests
from PIL import Image

BASE_DIR = Path(__file__).resolve().parent
SHARED_ASSETS_DIR = BASE_DIR / "shared-assets"

# 直接根據 site6-images.md 整理好的清單
SITE6_IMAGES = {
    "site6-hero.webp": "basketball player practicing alone in a quiet indoor court at dawn, soft window light coming in from the side, wooden floor with subtle reflections, realistic sports photography, slightly cinematic mood, no crowd, focus on rhythm of dribbling, 3:2 ratio",
    "site6-about.webp": "close up of a single basketball resting on a clean wooden court at early morning, empty bleachers in the background slightly out of focus, natural warm indoor light, realistic sports photography, calm and thoughtful atmosphere, 3:2 ratio",
    "site6-contact.webp": "notebook and pencil on a wooden bench beside an indoor basketball court, faint lines of the court visible in the background, soft overhead lighting, realistic documentary style photo, inviting and simple composition, 3:2 ratio",
    "site6-privacy.webp": "laptop and open notebook on a wooden desk at night, small warm desk lamp on the side, subtle basketball tactics sketch in the notebook, realistic indoor photography, calm and focused mood, 3:2 ratio",
    "site6-fixed1.webp": "coach holding a tablet and drawing plays on the screen while players in practice jerseys stand around listening on an indoor basketball court, realistic sports photo, natural arena lighting, focus on communication and tactics, 3:2 ratio",
    "site6-fixed2.webp": "basketball player sitting at the sideline using a foam roller on legs, training shoes and water bottle nearby, wooden court floor with clear lines, realistic sports medicine style photography, neutral color tones, 3:2 ratio",
    "site6-fixed3.webp": "lone amateur basketball player sitting on the empty bleachers at night, looking at a small notebook, indoor court lights partially turned off, realistic low light sports photography, reflective and slightly melancholic mood, 3:2 ratio",
    "site6-article1.webp": "coach and player reviewing game footage on a tablet at the bench, paused basketball game visible on the screen, arena lights in the background, realistic sports analytics photo, focus on hands and screen, 3:2 ratio",
    "site6-article2.webp": "athletic trainer helping a basketball player stretch leg muscles at the side of an indoor court, foam roller and resistance bands nearby, realistic sports medicine photography, clean and practical setting, 3:2 ratio",
    "site6-article3.webp": "amateur basketball player sitting alone high on the bleachers at night, looking at the hoop in the distance, only a few lights on, realistic indoor sports photo, slightly grainy for a real life feeling, 3:2 ratio",
    "site6-daily1.webp": "basketball player standing alone at the free throw line in a quiet gym, focusing before a shot, scoreboard faintly lit in the background, realistic sports photography, emphasis on concentration and atmosphere, 3:2 ratio",
    "site6-daily2.webp": "indoor basketball court at night with most lights turned off, only a few ceiling lamps lighting part of the floor, one person walking out of the court in the distance, realistic low light sports photography, quiet and reflective atmosphere, 3:2 ratio",
    "site6-daily3.webp": "close up of worn basketball shoes on a wooden court, outsole pattern visibly flattened, subtle dust on the floor, realistic product style photo with natural indoor light, focus on texture and wear, 3:2 ratio",
}

def ensure_dir() -> None:
    if not SHARED_ASSETS_DIR.exists():
        SHARED_ASSETS_DIR.mkdir(parents=True, exist_ok=True)

def call_gemini_image_api(prompt: str) -> bytes:
    """
    呼叫 Gemini HTTP API 產生一張 PNG 圖，回傳 bytes。
    需要：
    - pip install requests pillow
    - 在環境變數設定 GEMINI_API_KEY 或 GOOGLE_API_KEY
    """
    api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("請先在環境變數設定 GEMINI_API_KEY 或 GOOGLE_API_KEY")

    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/"
        "models/gemini-1.5-flash-latest:generateContent"
    )

    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "responseMimeType": "image/png"
        }
    }

    resp = requests.post(
        endpoint,
        params={"key": api_key},
        json=payload,
        timeout=180,
    )
    resp.raise_for_status()
    data = resp.json()

    try:
        b64 = data["candidates"][0]["content"]["parts"][0]["inlineData"]["data"]
    except (KeyError, IndexError) as exc:
        raise RuntimeError(f"Gemini 回傳格式不如預期：{data}") from exc

    return base64.b64decode(b64)

def generate_image_bytes(prompt: str) -> bytes:
    png_bytes = call_gemini_image_api(prompt)
    img = Image.open(io.BytesIO(png_bytes))
    buf = io.BytesIO()
    img.save(buf, format="WEBP")
    return buf.getvalue()

def main() -> None:
    ensure_dir()

    for filename, prompt in SITE6_IMAGES.items():
        target = SHARED_ASSETS_DIR / filename
        if target.exists():
            print(f"已存在，略過：{target.name}")
            continue

        print(f"使用 Gemini 生成圖片：{target.name}")
        try:
            data = generate_image_bytes(prompt)
        except Exception as exc:
            print(f"生成失敗 {target.name}: {exc}")
            continue

        with target.open("wb") as f:
            f.write(data)

if __name__ == "__main__":
    main()