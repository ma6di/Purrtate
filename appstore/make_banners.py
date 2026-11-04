"""
Product page header and search result artwork for App Store Connect.

    python3 appstore/make_banners.py

Writes every size App Store Connect lists into appstore/out/header/ and
appstore/out/search/. Reuses the phone frame and fonts from make_screenshots.
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))

from make_screenshots import (
    DISPLAY,
    BODY,
    HIGHLIGHT,
    HONEY,
    INK,
    PINK,
    SOFT,
    SRC,
    OUT,
    PROJECT,
    font,
    phone,
    wrap,
)

ICON = PROJECT / "assets/images/icon.png"

HEADER_SIZES = [(5244, 2950), (3840, 1646)]
SEARCH_SIZES = [(5244, 2950), (3840, 2560), (1920, 1280)]

TITLE = "Toys that feel"
TITLE_HIGHLIGHT = "new again."
SUB = "Three baskets, one out. Purrtate tells you when to swap."


def scaled_phone(src: str, height: int) -> Image.Image:
    layer = phone(Image.open(SRC / src).convert("RGB"))
    k = height / layer.height
    return layer.resize((round(layer.width * k), height), Image.LANCZOS)


def rounded_icon(size: int) -> Image.Image:
    icon = Image.open(ICON).convert("RGB").resize((size, size), Image.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1], radius=round(size * 0.225), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    return out


def render(w: int, h: int, bg) -> Image.Image:
    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    u = min(w / 16, h / 9)  # layout unit, keeps proportions across sizes

    # Phones on the right, bottom cropped, kept inside the middle 90% horizontally.
    ph = round(h * 0.92)
    back = scaled_phone("add-toy.png", ph)
    front = scaled_phone("today.png", ph)
    right_edge = round(w * 0.93)
    fx = right_edge - front.width
    bx = fx - round(back.width * 0.62)
    top = round(h * 0.10)
    img.paste(back, (bx, top + round(h * 0.06)), back)
    img.paste(front, (fx, top), front)

    # Text block on the left, vertically centred.
    left = round(w * 0.07)
    max_w = bx - left - round(u * 0.4)
    # Fixed two-line headline, sized to fit the space left of the phones.
    size = round(u * 1.25)
    while size > 20:
        tf = font(DISPLAY, size)
        widest = max(d.textlength(TITLE, font=tf), d.textlength(TITLE_HIGHLIGHT, font=tf) + size * 0.25)
        if widest <= max_w:
            break
        size -= 4
    u = size / 1.25  # scale the rest of the block with the headline
    sf = font(BODY, round(u * 0.42))
    icon = rounded_icon(round(u * 1.5))

    title_lines = [TITLE]
    hl_lines = [TITLE_HIGHLIGHT]
    sub_lines = wrap(d, SUB, sf, max_w)
    line_h, sub_h = round(u * 1.42), round(u * 0.6)
    block = icon.height + round(u * 0.6) + line_h * (len(title_lines) + len(hl_lines)) + round(u * 0.4) + sub_h * len(sub_lines)
    y = (h - block) // 2

    img.paste(icon, (left, y), icon)
    y += icon.height + round(u * 0.6)
    for line in title_lines:
        d.text((left, y), line, font=tf, fill=INK)
        y += line_h
    pad = round(u * 0.16)
    for line in hl_lines:
        _, t, r, b = d.textbbox((left + pad, y), line, font=tf)
        d.rectangle([left, t - pad, r + pad, b + pad], fill=HIGHLIGHT)
        d.text((left + pad, y), line, font=tf, fill=INK)
        y += line_h
    y += round(u * 0.4)
    for line in sub_lines:
        d.text((left, y), line, font=sf, fill=SOFT)
        y += sub_h
    return img


def main() -> None:
    for kind, sizes, bg in (("header", HEADER_SIZES, PINK), ("search", SEARCH_SIZES, HONEY)):
        folder = OUT / kind
        folder.mkdir(parents=True, exist_ok=True)
        for old in folder.glob("*.png"):
            old.unlink()
        for w, h in sizes:
            out = folder / f"{kind}-{w}x{h}.png"
            render(w, h, bg).save(out, optimize=True)
            print(out.relative_to(PROJECT))


if __name__ == "__main__":
    main()
