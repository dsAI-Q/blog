"""把用户拖拽得到的顺序写回（改名后的）文章 frontmatter。"""

import re
from pathlib import Path

POSTS = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog\src\content\posts")

# 远端 4 个 order 提交对应的文章，按改名后的 slug 落回
ORDERS = {
    "resources-guide": 1,
    "wechat-2026-11-16-fbea6e": 3,   # 原 wechat-2026-11-23-fbea6e
    "wechat-2026-11-14-621cc6": 2,   # 原 wechat-2026-11-23-621cc6
    "post-20261123-2028": 4,
}

for slug, order in ORDERS.items():
    path = POSTS / f"{slug}.md"
    if not path.is_file():
        print(f"跳过（不存在）：{slug}")
        continue

    text = path.read_text(encoding="utf-8")
    if re.search(r"^order:.*$", text, flags=re.M):
        text = re.sub(r"^order:.*$", f"order: {order}", text, flags=re.M)
    elif re.search(r"^draft:.*$", text, flags=re.M):
        text = re.sub(r"^draft:.*$", f"order: {order}\ndraft: false", text, flags=re.M)
    else:
        text = re.sub(r"^---\s*$", f"---\norder: {order}", text, count=1, flags=re.M)

    path.write_text(text, encoding="utf-8")
    print(f"order {order} -> {slug}.md")
