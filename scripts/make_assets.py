"""把用户给的横幅和头像处理成站点素材。

输入：
  图1 1568x670 黑金横幅  -> public/images/banner.webp / banner.jpg（OG 用）
  图2 150x170  猴子头像  -> public/images/avatar.webp, icon-180.png, favicon-32.png
"""

from pathlib import Path

from PIL import Image

SRC_BANNER = Path(r"C:\Users\ASUS\.dsh\attachments\v1\objects\87\8726f63be987ac16c0083fe82565e7526fe326e407c2942ebad76d4716e5c130")
SRC_AVATAR = Path(r"C:\Users\ASUS\.dsh\attachments\v1\objects\9a\9ad01d9a07a8048597d7d7a8260fc1ea2c925a77146094bdf8c6ed959037a337")
OUT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog\public\images")
OUT.mkdir(parents=True, exist_ok=True)


def main() -> None:
    banner = Image.open(SRC_BANNER).convert("RGB")

    # 首屏横幅：1568 宽够 2x，WebP 质量 82
    banner.save(OUT / "banner.webp", "WEBP", quality=82, method=6)
    # 社交分享 / 老浏览器兜底：1200 宽 JPEG
    og = banner.resize((1200, round(1200 * banner.height / banner.width)), Image.LANCZOS)
    og.save(OUT / "banner.jpg", "JPEG", quality=80, optimize=True, progressive=True)

    avatar = Image.open(SRC_AVATAR).convert("RGB")

    # 头像：保持原比例，WebP
    avatar.save(OUT / "avatar.webp", "WEBP", quality=88, method=6)

    # 图标必须方形：按长边缩放到方形画布，用图片自身左上角像素做底色（原图接近纯黑）
    bg = avatar.getpixel((2, 2))
    side = max(avatar.size)
    square = Image.new("RGB", (side, side), bg)
    square.paste(avatar, ((side - avatar.width) // 2, (side - avatar.height) // 2))
    square.resize((180, 180), Image.LANCZOS).save(OUT / "icon-180.png", "PNG", optimize=True)
    square.resize((32, 32), Image.LANCZOS).save(OUT / "favicon-32.png", "PNG", optimize=True)

    for name in ("banner.webp", "banner.jpg", "avatar.webp", "icon-180.png", "favicon-32.png"):
        p = OUT / name
        print(f"{name:16} {Image.open(p).size}  {p.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
