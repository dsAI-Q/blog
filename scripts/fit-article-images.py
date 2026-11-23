"""按文章统计图片体积，并逐篇压到 1 MB 以内。

某篇引用图片合计超过 1 MB 时，只对这篇自己的图逐轮重压：
    (宽 900, 质量 72) → (800, 64) → (700, 56)
动图抽帧降帧率（体积能降一个数量级），扩展名统一成 .webp 并同步改 Markdown 引用。
已经达标的文章不动。
"""

import re
from pathlib import Path

from PIL import Image, ImageSequence

ROOT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog")
UPLOADS = ROOT / "public" / "uploads"
POSTS = ROOT / "src" / "content" / "posts"
LIMIT = 1024 * 1024
STEPS = [(900, 72, 12), (800, 64, 10), (700, 56, 8)]

IMG_RE = re.compile(r'(?:!\[[^\]]*\]\(|src=")(/uploads/[^")]+)')


def resolve(ref: str) -> Path:
    return ROOT / "public" / ref.lstrip("/")


def total_size(paths) -> int:
    return sum(p.stat().st_size for p in paths if p.is_file())


def reencode(path: Path, width: int, quality: int, max_fps: int) -> Path:
    """按新参数重压，返回实际文件路径（扩展名可能从 gif 变成 webp）。"""
    target = path.with_suffix(".webp")
    tmp = target.with_name(f"{target.stem}.tmp.webp")

    with Image.open(path) as im:
        animated = getattr(im, "is_animated", False) and getattr(im, "n_frames", 1) > 1

        if not animated:
            image = im.convert("RGB") if im.mode not in ("RGB", "RGBA") else im
            if image.width > width:
                height = round(image.height * width / image.width)
                image = image.resize((width, height), Image.LANCZOS)
            image.save(tmp, "WEBP", quality=quality, method=6)
        else:
            frames = []
            durations = []
            for index, frame in enumerate(ImageSequence.Iterator(im)):
                durations.append(frame.info.get("duration", 100))
                if index % 2 != 0:  # 隔帧保留，帧率减半
                    continue
                image = frame.convert("RGB")
                if image.width > width:
                    height = round(image.height * width / image.width)
                    image = image.resize((width, height), Image.LANCZOS)
                frames.append(image)

            if not frames:
                raise ValueError("动图没有可用帧")

            seconds = sum(durations) / 1000
            duration = round(seconds * 1000 / len(frames)) if seconds else 80
            duration = max(duration, 1000 // max_fps)

            frames[0].save(
                tmp,
                format="WEBP",
                save_all=True,
                append_images=frames[1:],
                duration=duration,
                loop=0,
                quality=quality,
                method=6,
            )

    tmp.replace(target)
    if target != path:
        path.unlink()
    return target


def main() -> None:
    reports = []

    for md in sorted(POSTS.glob("*.md")):
        text = md.read_text(encoding="utf-8")
        refs = [r for r in dict.fromkeys(IMG_RE.findall(text))]
        if not refs:
            continue

        paths = {ref: resolve(ref) for ref in refs if resolve(ref).is_file()}
        if not paths:
            continue

        start = total_size(paths.values())
        used = None
        final_paths = dict(paths)

        if start > LIMIT:
            for width, quality, fps in STEPS:
                for ref, path in list(final_paths.items()):
                    final_paths[ref] = reencode(path, width, quality, fps)
                used = (width, quality)
                if total_size(final_paths.values()) <= LIMIT:
                    break

        # 同步引用（gif → webp 这类改名）
        updated = text
        for ref, path in final_paths.items():
            new_ref = "/uploads/" + path.relative_to(UPLOADS).as_posix()
            if new_ref != ref:
                updated = updated.replace(ref, new_ref)
        if updated != text:
            md.write_text(updated, encoding="utf-8")

        final = total_size(final_paths.values())
        reports.append((md.name, len(final_paths), start, final, used))

    print(f"{'文章':44} {'图':>2} {'原':>7} {'现':>7}  参数")
    for name, count, start, final, used in reports:
        flag = "" if final <= LIMIT else "  ← 仍超"
        params = f"{used[0]}px/q{used[1]}" if used else "无需压缩"
        print(f"{name[:42]:44} {count:>2} {start / 1048576:>6.2f}M {final / 1048576:>6.2f}M  {params}{flag}")

    total = sum(p.stat().st_size for p in UPLOADS.rglob("*") if p.is_file())
    print(f"\nuploads 合计 {total / 1048576:.2f} MB")


if __name__ == "__main__":
    main()
