import os
import re
from pathlib import Path
from typing import List, Tuple

from bs4 import BeautifulSoup  # type: ignore


BASE_DIR = Path(__file__).resolve().parent
SITES = [f"site{i}" for i in range(1, 6)]
SHARED_ASSETS_DIR = BASE_DIR / "shared-assets"


def find_html_files() -> List[Path]:
    html_files: List[Path] = []
    for site in SITES:
        site_dir = BASE_DIR / site
        if not site_dir.exists():
            continue
        for root, _, files in os.walk(site_dir):
            for name in files:
                if name.lower().endswith(".html"):
                    html_files.append(Path(root) / name)
    return html_files


def parse_img_tags(html_path: Path) -> List[Tuple[str, str]]:
    results: List[Tuple[str, str]] = []
    with html_path.open("r", encoding="utf-8") as f:
        content = f.read()
    soup = BeautifulSoup(content, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src") or ""
        alt = img.get("alt") or ""
        if not src or not alt:
            continue
        results.append((src, alt))
    return results


def extract_filename_from_src(src: str) -> str:
    # 專門處理 GitHub raw 網址形式，保留原本的檔名
    # 例如: https://github.com/.../shared-assets/site2-about.webp?raw=true
    # 會取出 site2-about.webp
    basename = src.split("/")[-1]
    basename = basename.split("?")[0]
    return basename


def image_exists(filename: str) -> bool:
    target = SHARED_ASSETS_DIR / filename
    return target.exists()


def generate_image_from_alt(alt_text: str, output_path: Path) -> None:
    """
    這裡預留給實際的 AI 圖片生成模型。
    目前先寫成占位函式，你可以在這裡串接自己慣用的圖片生成服務。
    """
    # 範例: 呼叫本機 Stable Diffusion、或雲端 API
    # generate_image(prompt=alt_text, output=str(output_path))
    print(f"TODO: 根據 alt 文字生成圖片: {alt_text}")
    print(f"預期輸出檔案: {output_path}")


def ensure_webp_extension(filename: str) -> str:
    name, ext = os.path.splitext(filename)
    if ext.lower() != ".webp":
        return f"{name}.webp"
    return filename


def main() -> None:
    SHARED_ASSETS_DIR.mkdir(exist_ok=True)
    html_files = find_html_files()
    print(f"掃描到 HTML 檔案數量: {len(html_files)}")

    for html_path in html_files:
        print(f"處理: {html_path}")
        img_tags = parse_img_tags(html_path)
        for src, alt in img_tags:
            filename = extract_filename_from_src(src)
            filename = ensure_webp_extension(filename)
            target_path = SHARED_ASSETS_DIR / filename

            if image_exists(filename):
                print(f"已存在圖片，略過: {filename}")
                continue

            # 真正生成圖片
            generate_image_from_alt(alt, target_path)


if __name__ == "__main__":
    main()


