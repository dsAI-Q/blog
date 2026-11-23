"""把 public/uploads 里的图片压成 WebP，并改掉 Markdown 里的引用。

公众号导出的是截图，动辄 300–500 KB；转 WebP 后一般能小一半以上，
顺手把宽度上限压到 1400（公众号正文最大显示宽），手机上也不吃亏。
"""

from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog")
UPLOADS = ROOT / "public" / "uploads"
POSTS = ROOT / "src" / "content" / "posts"
MAX_WIDTH = 1400
QUALITY = 82


def main() -> None:
    if not UPLOADS.exists():
        print("没有 public/uploads")
        return

    replacements: dict[str, str] = {}
    saved_total = 0

    for src in sorted(UPLOADS.rglob("*")):
        if not src.is_file() or src.suffix.lower() not in {".png", ".jpg", ".jpeg"}:
            continue

        before = src.stat().st_size
        image = Image.open(src)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGB")
        if image.width > MAX_WIDTH:
            height = round(image.height * MAX_WIDTH / image.width)
            image = image.resize((MAX_WIDTH, height), Image.LANCZOS)

        target = src.with_suffix(".webp")
        image.save(target, "WEBP", quality=QUALITY, method=6)
        after = target.stat().st_size
        saved_total += before - after

        old_ref = f"/uploads/{src.relative_to(UPLOADS).as_posix()}"
        new_ref = f"/uploads/{target.relative_to(UPLOADS).as_posix()}"
        replacements[old_ref] = new_ref

        src.unlink()
        print(f"{src.name:28} {before / 1024:6.0f} KB -> {after / 1024:6.0f} KB")

    if not replacements:
        print("没有需要压缩的图片")
        return

    for md in POSTS.glob("*.md"):
        text = md.read_text(encoding="utf-8")
        original = text
        for old, new in replacements.items():
            text = text.replace(old, new)
        if text != original:
            md.write_text(text, encoding="utf-8")
            print(f"已更新引用：{md.name}")

    print(f"\n合计省下 {saved_total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
