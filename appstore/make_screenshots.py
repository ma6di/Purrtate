"""
App Store screenshots for Purrtate.

Puts each screenshot from appstore/source/ into an iPhone frame with a
headline, at 1320 x 2868 (6.9" display, the size App Store Connect requires).
Replace a source PNG or edit SHOTS, then run again:

    python3 appstore/make_screenshots.py
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
SRC = ROOT / "source"
OUT = ROOT / "out"

W, H = 1320, 2868
MARGIN = 104

INK = (42, 33, 24)
SOFT = (74, 62, 52)
APP_BG = (243, 230, 212)
FRAME = (24, 18, 13)
HIGHLIGHT = (242, 201, 92)

# Brand backgrounds, one per screenshot.
PINK = (236, 200, 184)
HONEY = (240, 215, 168)
SAGE = (205, 222, 202)
CREAM = (234, 217, 194)

FONTS = PROJECT / "node_modules/@expo-google-fonts"
DISPLAY = FONTS / "fraunces/700Bold/Fraunces_700Bold.ttf"
BODY = FONTS / "nunito/600SemiBold/Nunito_600SemiBold.ttf"
BOLD = FONTS / "nunito/700Bold/Nunito_700Bold.ttf"

# (source, background, plain headline, highlighted headline, subtitle)
# The first three show in App Store search results.
SHOTS = [
    ("today.png", PINK, "What’s out,", "when to swap.", "One basket out, two resting. Swap early if your cat is already bored."),
    ("baskets.png", HONEY, "Three baskets.", "One out.", "Two rest so they feel new. Mix a chase, a stalk and a grab toy in each."),
    ("add-toy.png", SAGE, "Add a toy", "in seconds.", "A name, a type and a colour. No photos needed."),
    ("energy.png", CREAM, "Swap at", "your cat’s pace.", "Start with a suggestion, then adjust to how they really play."),
    ("name.png", PINK, "Several cats?", "One schedule.", "Cats share the toys, so they share the baskets too."),
    ("welcome.png", HONEY, "No account.", "No tracking.", "Everything stays on your iPhone."),
]

# Phone geometry
SCREEN_W = 940
BEZEL = 24
SCREEN_R = 130
SHADOW = 44


def font(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


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


def clean_status_bar(screen: Image.Image) -> Image.Image:
    """Replace the real status bar (time, low battery) with a tidy 9:41 bar."""
    s = screen.copy()
    sw, _ = s.size
    k = sw / 1170
    d = ImageDraw.Draw(s)
    d.rectangle([0, 0, sw, int(132 * k)], fill=APP_BG)
    cy = int(76 * k)
    d.text((int(96 * k), cy), "9:41", font=font(BOLD, int(46 * k)), fill=INK, anchor="lm")
    bx, bw, bh = sw - int(150 * k), int(72 * k), int(34 * k)
    d.rounded_rectangle([bx, cy - bh // 2, bx + bw, cy + bh // 2], radius=int(10 * k), outline=INK, width=max(2, int(3 * k)))
    d.rounded_rectangle([bx + int(5 * k), cy - bh // 2 + int(5 * k), bx + bw - int(5 * k), cy + bh // 2 - int(5 * k)], radius=int(6 * k), fill=INK)
    d.rounded_rectangle([bx + bw + int(3 * k), cy - int(7 * k), bx + bw + int(8 * k), cy + int(7 * k)], radius=int(2 * k), fill=INK)
    wx = bx - int(62 * k)
    for r in (int(30 * k), int(20 * k)):
        d.arc([wx - r, cy - r + int(10 * k), wx + r, cy + r + int(10 * k)], 225, 315, fill=INK, width=max(3, int(6 * k)))
    d.ellipse([wx - int(5 * k), cy + int(2 * k), wx + int(5 * k), cy + int(12 * k)], fill=INK)
    sx = wx - int(110 * k)
    for i in range(4):
        h = int((12 + i * 8) * k)
        d.rounded_rectangle([sx + i * int(15 * k), cy + int(16 * k) - h, sx + i * int(15 * k) + int(10 * k), cy + int(16 * k)], radius=int(3 * k), fill=INK)
    return s


def phone(screen: Image.Image) -> Image.Image:
    """Phone body with side buttons and a solid offset shadow, on a transparent layer."""
    screen = clean_status_bar(screen)
    sh = round(SCREEN_W * screen.height / screen.width)
    screen = screen.resize((SCREEN_W, sh), Image.LANCZOS)
    bw, bh = SCREEN_W + BEZEL * 2, sh + BEZEL * 2
    btn = 16  # side buttons stick out on the left
    layer = Image.new("RGBA", (bw + btn + SHADOW, bh + SHADOW), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    ox = btn
    r = SCREEN_R + BEZEL

    # Solid offset shadow, then the body on top.
    d.rounded_rectangle([ox + SHADOW, SHADOW, ox + SHADOW + bw - 1, SHADOW + bh - 1], radius=r, fill=FRAME)
    for top, height in ((300, 90), (440, 150), (620, 150)):
        d.rounded_rectangle([0, top, ox + 10, top + height], radius=6, fill=FRAME)
    d.rounded_rectangle([ox, 0, ox + bw - 1, bh - 1], radius=r, fill=FRAME)

    mask = Image.new("L", (SCREEN_W, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, SCREEN_W - 1, sh - 1], radius=SCREEN_R, fill=255)
    layer.paste(screen, (ox + BEZEL, BEZEL), mask)

    iw, ih = 236, 68
    ix = ox + (bw - iw) // 2
    d.rounded_rectangle([ix, BEZEL + 28, ix + iw, BEZEL + 28 + ih], radius=ih // 2, fill=(8, 8, 8))
    return layer


def render(src: str, bg, plain: str, highlight: str, sub: str) -> Image.Image:
    img = Image.new("RGB", (W, H), bg)
    d = ImageDraw.Draw(img)
    max_w = W - MARGIN * 2

    tf = font(DISPLAY, 128)
    y = 150
    for line in wrap(d, plain, tf, max_w):
        d.text((MARGIN, y), line, font=tf, fill=INK)
        y += 140
    for line in wrap(d, highlight, tf, max_w - 40):
        left, top, right, bottom = d.textbbox((MARGIN + 20, y), line, font=tf)
        d.rectangle([MARGIN, top - 14, right + 20, bottom + 18], fill=HIGHLIGHT)
        d.text((MARGIN + 20, y), line, font=tf, fill=INK)
        y += 150

    y += 36
    sf = font(BODY, 48)
    for line in wrap(d, sub, sf, max_w - 40):
        d.text((MARGIN, y), line, font=sf, fill=SOFT)
        y += 66

    device = phone(Image.open(SRC / src).convert("RGB"))
    # Never cover the text: push the phone down (cropping its bottom) if needed.
    top = max(H - device.height - 90, y + 60)
    x = (W - device.width) // 2 + 6
    img.paste(device, (x, top), device)
    return img


def main() -> None:
    OUT.mkdir(exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    for i, (src, bg, plain, highlight, sub) in enumerate(SHOTS, start=1):
        if not (SRC / src).exists():
            print(f"skip {src} (missing)")
            continue
        out = OUT / f"{i:02d}-{Path(src).stem}.png"
        render(src, bg, plain, highlight, sub).save(out, optimize=True)
        print(out.relative_to(PROJECT))


if __name__ == "__main__":
    main()
