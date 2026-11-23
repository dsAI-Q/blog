"""把 public/uploads 里的图片压成 WebP（已是 WebP 的就地重压），并改掉 Markdown 里的引用。

公众号导出的是截图，动辄 300–500 KB。宽度上限压到 1100（正文栏最宽约 1050px，
够 1x 清晰，手机端也够用），质量 76 后单张一般在 100–180 KB。
"""

from pathlib import Path

from PIL import Image, ImageSequence

ROOT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog")
UPLOADS = ROOT / "public" / "uploads"
POSTS = ROOT / "src" / "content" / "posts"
MAX_WIDTH = 1100
QUALITY = 76
SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def resize_if_needed(image: Image.Image, force_rgb: bool = True) -> Image.Image:
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGB")
    if image.width > MAX_WIDTH:
        height = round(image.height * MAX_WIDTH / image.width)
        image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
    return image


def convert_gif(src: Path, target: Path) -> None:
    """动图：逐帧转成动图 WebP，体积通常只有 GIF 的十分之一。"""
    with Image.open(src) as gif:
        frames = []
        durations = []
        for frame in ImageSequence.Iterator(gif):
            frames.append(resize_if_needed(frame.convert("RGB")))
            durations.append(frame.info.get("duration", 100))

    if not frames:
        raise ValueError("GIF 没有帧")

    frames[0].save(
        target,
        format="WEBP",
        save_all=True,
        append_images=frames[1:],
        duration=durations,
        loop=0,
        quality=70,
        method=6,
    )


def main() -> None:
    if not UPLOADS.exists():
        print("没有 public/uploads")
        return

    replacements: dict[str, str] = {}
    saved_total = 0
    count = 0

    for src in sorted(UPLOADS.rglob("*")):
        if not src.is_file() or src.suffix.lower() not in SUFFIXES:
            continue

        before = src.stat().st_size
        target = src.with_suffix(".webp")
        tmp = target.with_name(f"{target.stem}.tmp.webp")

        if src.suffix.lower() == ".gif":
            convert_gif(src, tmp)
        else:
            image = Image.open(src)
            resize_if_needed(image).save(tmp, "WEBP", quality=QUALITY, method=6)

        tmp.replace(target)
        if target != src:
            src.unlink()
            replacements[f"/uploads/{src.relative_to(UPLOADS).as_posix()}"] = (
                f"/uploads/{target.relative_to(UPLOADS).as_posix()}"
            )

        after = target.stat().st_size
        saved_total += before - after
        count += 1
        print(f"{src.name:28} {before / 1024:6.0f} KB -> {after / 1024:6.0f} KB")

    for md in POSTS.glob("*.md"):
        text = md.read_text(encoding="utf-8")
        original = text
        for old, new in replacements.items():
            text = text.replace(old, new)
        if text != original:
            md.write_text(text, encoding="utf-8")
            print(f"已更新引用：{md.name}")

    total = sum(p.stat().st_size for p in UPLOADS.rglob("*") if p.is_file())
    print(f"\n{count} 张，省下 {saved_total / 1024 / 1024:.2f} MB，现共 {total / 1024 / 1024:.2f} MB")


if __name__ == "__main__":
    main()
