#!/usr/bin/env python3
"""Render the ExamSathi logo (assets/img/logo.svg) to PNG + ICO.

The vector master is logo.svg / favicon.svg. This script redraws the same
artwork — diagonal brand gradient, white open book, green check badge — with
Pillow so browsers without SVG favicon support and mobile home screens still
get a crisp icon. Re-run after any logo change:

    python3 tools/generate-icons.py
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, "assets", "img")

GRID = 64          # artwork coordinates live on the 64x64 SVG grid
MASTER = 512       # master render size, downscaled for every target
S = MASTER / GRID  # grid -> pixel scale

C1 = (79, 70, 229)    # #4f46e5
C2 = (124, 58, 237)   # #7c3aed
C3 = (168, 85, 247)   # #a855f7
GREEN = (34, 197, 94)  # #22c55e
WHITE = (255, 255, 255)


def lerp(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(size):
    """Diagonal 3-stop gradient matching --grad-brand (135deg)."""
    tiny = Image.new("RGB", (GRID, GRID))
    px = tiny.load()
    for y in range(GRID):
        for x in range(GRID):
            t = (x + y) / (2 * (GRID - 1))
            if t <= 0.55:
                px[x, y] = lerp(C1, C2, t / 0.55)
            else:
                px[x, y] = lerp(C2, C3, (t - 0.55) / 0.45)
    return tiny.resize((size, size), Image.BILINEAR)


def cubic(p0, p1, p2, p3, n=28):
    pts = []
    for i in range(n + 1):
        t = i / n
        u = 1 - t
        pts.append((
            u**3 * p0[0] + 3 * u*u * t * p1[0] + 3 * u * t*t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u*u * t * p1[1] + 3 * u * t*t * p2[1] + t**3 * p3[1],
        ))
    return pts


def page_polygon(top, bottom):
    """Sample the two cubics of one book page into a polygon (grid units)."""
    pts = cubic(*top)
    pts += cubic(*bottom)[1:]
    return [(x * S, y * S) for x, y in pts]


def render_master(full_bleed=False):
    """Render the 512px master. full_bleed skips rounded corners (Apple icon)."""
    base = gradient(MASTER).convert("RGBA")

    overlay = Image.new("RGBA", (MASTER, MASTER), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    # Open book: solid left page, slightly shaded right page.
    left = page_polygon(
        ((29, 14.5), (24.4, 12.3), (19.2, 11.7), (14, 12.3)),
        ((14, 39.7), (19.2, 39.1), (24.4, 39.7), (29, 41.9)),
    )
    right = page_polygon(
        ((29, 14.5), (33.6, 12.3), (38.8, 11.8), (43.5, 12.4)),
        ((43.5, 39.8), (38.8, 39.2), (33.6, 39.7), (29, 41.9)),
    )
    d.polygon(left, fill=WHITE + (255,))
    d.polygon(right, fill=WHITE + (int(255 * 0.88),))
    d.line([(29 * S, 14.5 * S), (29 * S, 41.9 * S)], fill=C1 + (255,),
           width=max(1, round(2.4 * S)))

    # Check badge: white ring, green disc, white check.
    cx, cy = 45.5 * S, 45.5 * S
    ring_r = (11.5 + 1.75) * S
    disc_r = 11.5 * S
    d.ellipse([cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
              fill=WHITE + (255,))
    d.ellipse([cx - disc_r, cy - disc_r, cx + disc_r, cy + disc_r],
              fill=GREEN + (255,))
    check = [(40.2 * S, 45.7 * S), (44.1 * S, 49.6 * S), (51.2 * S, 41.7 * S)]
    w = 3.4 * S
    d.line(check, fill=WHITE + (255,), width=round(w), joint="curve")
    for x, y in (check[0], check[-1]):  # round caps
        d.ellipse([x - w / 2, y - w / 2, x + w / 2, y + w / 2],
                  fill=WHITE + (255,))

    img = Image.alpha_composite(base, overlay)

    if not full_bleed:
        mask = Image.new("L", (MASTER, MASTER), 0)
        ImageDraw.Draw(mask).rounded_rectangle(
            [round(1 * S), round(1 * S), round(63 * S), round(63 * S)],
            radius=round(17 * S), fill=255)
        img.putalpha(mask)
    return img


def main():
    os.makedirs(IMG, exist_ok=True)
    master = render_master()
    targets = [
        ("android-chrome-512x512.png", 512),
        ("android-chrome-192x192.png", 192),
        ("favicon-32x32.png", 32),
        ("favicon-16x16.png", 16),
    ]
    for name, size in targets:
        out = master if size == MASTER else master.resize((size, size), Image.LANCZOS)
        out.save(os.path.join(IMG, name))
        print("wrote", name, out.size)
    master.save(os.path.join(IMG, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    print("wrote favicon.ico (16/32/48)")
    # Apple touch icon: full-bleed square, iOS applies its own mask.
    apple = render_master(full_bleed=True).resize((180, 180), Image.LANCZOS)
    apple.convert("RGB").save(os.path.join(IMG, "apple-touch-icon.png"))
    print("wrote apple-touch-icon.png (180, 180)")


if __name__ == "__main__":
    main()
