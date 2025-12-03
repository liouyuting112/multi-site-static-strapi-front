import io
from pathlib import Path

import torch
from diffusers import StableDiffusionPipeline
from PIL import Image  # pip install pillow

BASE_DIR = Path(__file__).resolve().parent
SHARED_ASSETS_DIR = BASE_DIR / "shared-assets"

IMAGE_PROMPT_MAP = {
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

def ensure_dir():
    if not SHARED_ASSETS_DIR.exists():
        SHARED_ASSETS_DIR.mkdir(parents=True, exist_ok=True)

def main():
    ensure_dir()

    # 使用公開的 Stable Diffusion v1-5，不用自己管理模型路徑
    model_id = "runwayml/stable-diffusion-v1-5"
    print("下載或載入模型：", model_id)

    pipe = StableDiffusionPipeline.from_pretrained(
        model_id,
        torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        safety_checker=None,
    )

    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        print("使用 GPU 執行")
    else:
        print("⚠ 沒有偵測到 GPU，將使用 CPU，速度會比較慢")

    for filename, prompt in IMAGE_PROMPT_MAP.items():
        target = SHARED_ASSETS_DIR / filename
        if target.exists():
            print(f"已存在，略過：{filename}")
            continue

        print(f"生成圖片：{filename}")
        image = pipe(
            prompt,
            height=720,
            width=1080,           # 大約 3:2 比例
            num_inference_steps=30,
        ).images[0]

        buf = io.BytesIO()
        image.save(buf, format="WEBP", quality=90, method=6)
        with target.open("wb") as f:
            f.write(buf.getvalue())

if __name__ == "__main__":
    main()