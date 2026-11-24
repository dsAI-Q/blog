"""把「加入团队指导说明」docx 转成 Markdown + 站内图片。

输出：
  src/content/pages/team.md
  public/uploads/team/*.webp
"""

import re
from pathlib import Path

from docx import Document
from docx.table import Table
from docx.text.paragraph import Paragraph
from PIL import Image

SRC = Path(
    r"C:\Users\ASUS\Desktop\临时\「大圣Ai自习室」ComfyUI 一对一教学招生简章\加入「大圣Ai自习室」团队指导说明.docx"
)
ROOT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog")
OUT_MD = ROOT / "src" / "content" / "pages" / "team.md"
IMG_DIR = ROOT / "public" / "uploads" / "team"
MAX_WIDTH = 1100
QUALITY = 76


def iter_blocks(doc: Document):
    body = doc.element.body
    for child in body.iterchildren():
        tag = child.tag.split('}')[-1]
        if tag == 'p':
            yield Paragraph(child, doc)
        elif tag == 'tbl':
            yield Table(child, doc)


def run_markdown(paragraph: Paragraph) -> str:
    """把段落转成 markdown，保留加粗。"""
    parts = []
    for run in paragraph.runs:
        text = run.text
        if not text:
            continue
        if run.bold and text.strip():
            parts.append(f"**{text.strip()}**" if text.strip() else text)
        else:
            parts.append(text)
    return ''.join(parts).strip()


def heading_level(paragraph: Paragraph) -> int:
    style = (paragraph.style.name or '').lower()
    if 'heading' in style:
        digits = re.findall(r'\d+', style)
        return int(digits[0]) if digits else 2
    return 0


def save_image(blob: bytes, index: int) -> str:
    IMG_DIR.mkdir(parents=True, exist_ok=True)
    tmp = IMG_DIR / f"raw-{index}.img"
    tmp.write_bytes(blob)
    with Image.open(tmp) as image:
        if image.mode not in ('RGB', 'RGBA'):
            image = image.convert('RGB')
        if image.width > MAX_WIDTH:
            height = round(image.height * MAX_WIDTH / image.width)
            image = image.resize((MAX_WIDTH, height), Image.LANCZOS)
        target = IMG_DIR / f"{index:02d}.webp"
        image.save(target, 'WEBP', quality=QUALITY, method=6)
    tmp.unlink()
    return f"/uploads/team/{target.name}"


def main() -> None:
    doc = Document(SRC)
    lines: list[str] = []
    image_count = 0
    stats = {'p': 0, 'table': 0, 'img': 0}

    for block in iter_blocks(doc):
        if isinstance(block, Table):
            rows = []
            for row in block.rows:
                cells = [cell.text.strip().replace('\n', ' ') for cell in row.cells]
                rows.append(cells)
            if not rows:
                continue
            header = rows[0]
            lines.append('| ' + ' | '.join(header) + ' |')
            lines.append('| ' + ' | '.join('---' for _ in header) + ' |')
            for row in rows[1:]:
                lines.append('| ' + ' | '.join(row) + ' |')
            lines.append('')
            stats['table'] += 1
            continue

        # 图片：按段落内嵌对象顺序导出
        rel_ids = block._p.xpath('.//a:blip/@r:embed')
        for rel_id in rel_ids:
            try:
                part = doc.part.related_parts[rel_id]
                image_count += 1
                path = save_image(part.blob, image_count)
                lines.append(f'![团队指导配图 {image_count}]({path})')
                lines.append('')
                stats['img'] += 1
            except Exception as error:  # 图片坏了也不要中断整体转换
                print(f'图片 {rel_id} 导出失败：{error}')

        text = run_markdown(block)
        if not text:
            continue

        level = heading_level(block)
        if level == 1:
            lines.append(f'## {text}')
        elif level >= 2:
            lines.append(f'{"#" * min(level, 4)} {text}')
        else:
            style = (block.style.name or '').lower()
            if 'list' in style:
                lines.append(f'- {text}')
            else:
                lines.append(text)
        lines.append('')
        stats['p'] += 1

    body = '\n'.join(lines).strip()
    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    OUT_MD.write_text(body + '\n', encoding='utf-8')

    print(f'段落 {stats["p"]} / 表格 {stats["table"]} / 图片 {stats["img"]}')
    print(f'输出 {OUT_MD}（{len(body)} 字）')
    total = sum(p.stat().st_size for p in IMG_DIR.glob('*') if p.is_file())
    print(f'图片合计 {total / 1024 / 1024:.2f} MB')


if __name__ == '__main__':
    main()
