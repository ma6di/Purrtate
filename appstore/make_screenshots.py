"""
App Store screenshots for Purrtate.

Puts each screenshot from appstore/source/ into an iPhone frame on a cream
background with a headline, at 1320 x 2868 (6.9" display, the size App Store
Connect requires). Replace a source PNG and run again to regenerate:

    python3 appstore/make_screenshots.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
SRC = ROOT / "source"
OUT = ROOT / "out"

W, H = 1320, 2868

CREAM_TOP = (247, 236, 222)
CREAM_BOTTOM = (236, 217, 194)
INK = (42, 33, 24)
SOFT = (92, 78, 66)
TERRA = (212, 101, 74)
HONEY = (212, 160, 84)
SAGE = (107, 143, 113)
APP_BG = (243, 230, 212)
FRAME = (31, 24, 18)

FONTS = PROJECT / "node_modules/@expo-google-fonts"
DISPLAY = FONTS / "fraunces/700Bold/Fraunces_700Bold.ttf"
LABEL = FONTS / "nunito/800ExtraBold/Nunito_800ExtraBold.ttf"
BODY = FONTS / "nunito/600SemiBold/Nunito_600SemiBold.ttf"
BOLD = FONTS / "nunito/700Bold/Nunito_700Bold.ttf"

# Order matters: the first three show in App Store search results.
SHOTS = [
    ("today.png", "TODAY", "Know what’s out, and when to swap", "One basket out, two resting. Swap early if they’re bored."),
    ("baskets.png", "THREE BASKETS", "One out, two resting", "Mix a chase, a stalk and a grab toy into every basket."),
    ("add-toy.png", "YOUR TOYS", "Add a toy in seconds", "A name, a type and a colour. No photos needed."),
    ("energy.png", "YOUR CAT’S PACE", "Swap as often as they need", "Start with a suggestion, then adjust to your cat."),
    ("name.png", "ONE HOME", "Several cats? One schedule", "Cats share the toys, so they share the baskets too."),
    ("welcome.png", "PRIVATE", "No account. No tracking.", "Everything stays on your iPhone."),
]

# Phone geometry
SCREEN_W = 990
BEZEL = 26
SCREEN_R = 140


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def gradient() -> Image.Image:
    img = Image.new("RGB", (W, H))
    px = img.load()
    for y in range(H):
        t = y / (H - 1)
        c = tuple(round(CREAM_TOP[i] + (CREAM_BOTTOM[i] - CREAM_TOP[i]) * t) for i in range(3))
        for x in range(W):
            px[x, y] = c
    return img


def blobs(img: Image.Image, seed: int) -> None:
    """Soft decorative circles in brand colours."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    spots = [
        ((-220, 1500), 520, TERRA),
        ((W - 200, 900), 460, HONEY),
        ((W - 420, H - 260), 520, SAGE),
    ]
    for i, ((cx, cy), r, col) in enumerate(spots):
        if (i + seed) % 3 == 2:
            continue
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col + (46,))
    layer = layer.filter(ImageFilter.GaussianBlur(120))
    img.paste(layer, (0, 0), layer)


def wrap(draw: ImageDraw.ImageDraw, text: str, f: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words, lines, line = text.split(), [], ""
    for w in words:
        trial = f"{line} {w}".strip()
        if draw.textlength(trial, font=f) <= max_w:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def spaced(draw: ImageDraw.ImageDraw, xy, text: str, f, fill, tracking: float) -> None:
    """Centered text with letter spacing."""
    widths = [draw.textlength(ch, font=f) for ch in text]
    total = sum(widths) + tracking * (len(text) - 1)
    x = xy[0] - total / 2
    for ch, w in zip(text, widths):
        draw.text((x, xy[1]), ch, font=f, fill=fill)
        x += w + tracking


def clean_status_bar(screen: Image.Image) -> Image.Image:
    """Replace the real status bar (time, low battery) with a tidy 9:41 bar."""
    s = screen.copy()
    sw, _ = s.size
    k = sw / 1170
    d = ImageDraw.Draw(s)
    d.rectangle([0, 0, sw, int(132 * k)], fill=APP_BG)
    cy = int(76 * k)
    d.text((int(96 * k), cy), "9:41", font=font(BOLD, int(46 * k)), fill=INK, anchor="lm")
    # Battery
    bx, bw, bh = sw - int(150 * k), int(72 * k), int(34 * k)
    d.rounded_rectangle([bx, cy - bh // 2, bx + bw, cy + bh // 2], radius=int(10 * k), outline=INK, width=max(2, int(3 * k)))
    d.rounded_rectangle([bx + int(5 * k), cy - bh // 2 + int(5 * k), bx + bw - int(5 * k), cy + bh // 2 - int(5 * k)], radius=int(6 * k), fill=INK)
    d.rounded_rectangle([bx + bw + int(3 * k), cy - int(7 * k), bx + bw + int(8 * k), cy + int(7 * k)], radius=int(2 * k), fill=INK)
    # Wifi
    wx = bx - int(62 * k)
    for i, r in enumerate((int(30 * k), int(20 * k), int(10 * k))):
        if i < 2:
            d.arc([wx - r, cy - r + int(10 * k), wx + r, cy + r + int(10 * k)], 225, 315, fill=INK, width=max(3, int(6 * k)))
        else:
            d.ellipse([wx - int(5 * k), cy + int(2 * k), wx + int(5 * k), cy + int(12 * k)], fill=INK)
    # Signal
    sx = wx - int(110 * k)
    for i in range(4):
        h = int((12 + i * 8) * k)
        d.rounded_rectangle([sx + i * int(15 * k), cy + int(16 * k) - h, sx + i * int(15 * k) + int(10 * k), cy + int(16 * k)], radius=int(3 * k), fill=INK)
    return s


def phone(screen: Image.Image) -> Image.Image:
    screen = clean_status_bar(screen)
    sh = round(SCREEN_W * screen.height / screen.width)
    screen = screen.resize((SCREEN_W, sh), Image.LANCZOS)
    bw, bh = SCREEN_W + BEZEL * 2, sh + BEZEL * 2

    body = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
    d = ImageDraw.Draw(body)
    d.rounded_rectangle([0, 0, bw - 1, bh - 1], radius=SCREEN_R + BEZEL, fill=FRAME)
    d.rounded_rectangle([3, 3, bw - 4, bh - 4], radius=SCREEN_R + BEZEL - 3, outline=(70, 58, 48), width=3)

    mask = Image.new("L", (SCREEN_W, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, SCREEN_W - 1, sh - 1], radius=SCREEN_R, fill=255)
    body.paste(screen, (BEZEL, BEZEL), mask)

    # Dynamic Island
    iw, ih = 250, 72
    ix = (bw - iw) // 2
    d.rounded_rectangle([ix, BEZEL + 30, ix + iw, BEZEL + 30 + ih], radius=ih // 2, fill=(0, 0, 0))
    return body


def text_block(d: ImageDraw.ImageDraw, label: str, title: str, sub: str):
    """Lines to draw as (y offset, text, font, colour, kind); returns them and the total height."""
    tf, sf, lf = font(DISPLAY, 104), font(BODY, 44), font(LABEL, 38)
    items, y = [("label", 0, label, lf, TERRA)], 78
    for line in wrap(d, title, tf, W - 160):
        items.append(("text", y, line, tf, INK))
        y += 118
    y += 30
    for line in wrap(d, sub, sf, W - 220):
        items.append(("text", y, line, sf, SOFT))
        y += 60
    return items, y


def render(src: str, label: str, title: str, sub: str, idx: int) -> Image.Image:
    img = gradient()
    blobs(img, idx)
    d = ImageDraw.Draw(img)

    # Phone pinned to the same spot on every screenshot.
    device = phone(Image.open(SRC / src).convert("RGB"))
    top = H - 70 - device.height
    x = (W - device.width) // 2

    # Text centred in the space above the phone.
    items, block_h = text_block(d, label, title, sub)
    y0 = max(70, (top - block_h) // 2)
    for kind, dy, text, f, col in items:
        if kind == "label":
            spaced(d, (W / 2, y0 + dy), text, f, col, 7)
        else:
            d.text((W / 2, y0 + dy), text, font=f, fill=col, anchor="ma")

    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle(
        [x + 10, top + 40, x + device.width - 10, top + device.height + 30],
        radius=SCREEN_R + BEZEL,
        fill=(60, 40, 20, 90),
    )
    shadow = shadow.filter(ImageFilter.GaussianBlur(50))
    img.paste(shadow, (0, 0), shadow)
    img.paste(device, (x, top), device)
    return img


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for i, (src, label, title, sub) in enumerate(SHOTS, start=1):
        if not (SRC / src).exists():
            print(f"skip {src} (missing)")
            continue
        out = OUT / f"{i:02d}-{Path(src).stem}.png"
        render(src, label, title, sub, i).save(out, optimize=True)
        print(out.relative_to(PROJECT))


if __name__ == "__main__":
    main()
