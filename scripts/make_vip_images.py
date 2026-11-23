"""把招生简章里的两张二维码压好放进 public/images/vip/。

收款码要保证能扫：只缩宽 + 轻压缩，不做有损到糊的处理。
"""

from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\ASUS\.dsh\bot\workspace\_vip-src\图片和附件")
OUT = Path(r"C:\Users\ASUS\.dsh\bot\workspace\blog\public\images\vip")
OUT.mkdir(parents=True, exist_ok=True)


def main() -> None:
    alipay = Image.open(SRC / "支付宝收款码.jpg").convert("RGB")
    alipay.thumbnail((760, 760 * 3), Image.LANCZOS)
    alipay.save(OUT / "alipay-qr.jpg", "JPEG", quality=88, optimize=True, progressive=True)

    wechat = Image.open(SRC / "046a02d362041205a91b90f132f6ed0f.png")
    if wechat.mode not in ("RGB", "L"):
        wechat = wechat.convert("RGB")
    wechat.thumbnail((760, 760 * 3), Image.LANCZOS)
    # 量化到 256 色：二维码本来就是黑白，体积极小且边缘不糊
    wechat.quantize(colors=256, method=Image.Quantize.MEDIANCUT).save(
        OUT / "wechat-qr.png", "PNG", optimize=True
    )

    for name in ("alipay-qr.jpg", "wechat-qr.png"):
        p = OUT / name
        print(f"{name:16} {Image.open(p).size}  {p.stat().st_size / 1024:.0f} KB")


if __name__ == "__main__":
    main()
