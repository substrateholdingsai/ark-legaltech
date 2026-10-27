#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AUREUS — Capa Raster SEO / Social / PWA
Única excepción justificada con Pillow: crawlers de WhatsApp/FB/LinkedIn/X no rasterizan SVG.
"""

import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
import json
from datetime import datetime, timezone
from html import escape
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print(
        "❌ Pillow requerido para la capa raster.\n"
        "Instala con: python -m pip install Pillow"
    )
    raise SystemExit(1)


SCALE = 4

BG_PRIMARY = (16, 15, 13)
BG_CANVAS = (23, 21, 18)
BG_SURFACE = (33, 30, 26)
BORDER_LINE = (59, 52, 43)

TEXT_PRIMARY = (243, 236, 223)
TEXT_SECONDARY = (184, 174, 158)
TEXT_MUTED = (154, 145, 133)

ACCENT_500 = (201, 166, 100)
ACCENT_400 = (220, 189, 133)
ACCENT_FOREGROUND = (20, 17, 13)

SEAL_PORPHYRY = (139, 74, 90)
RISK_TERRACOTTA = (204, 118, 108)
PENDING_BRONZE = (201, 138, 61)
APPROVED_OLIVE = (126, 154, 110)
AGENT_STEEL = (110, 143, 163)
WATERMARK = (42, 37, 31)

FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/cormorant-garamond/CormorantGaramond-Medium.ttf",
        "/usr/share/fonts/truetype/cormorant-garamond/CormorantGaramond-SemiBold.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "C:/Windows/Fonts/georgia.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Regular.ttf",
    ],
    "body": [
        "/usr/share/fonts/truetype/inter/Inter-Regular.ttf",
        "/usr/share/fonts/truetype/inter/Inter-Medium.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "C:/Windows/Fonts/arial.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ],
    "mono": [
        "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Regular.ttf",
        "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "C:/Windows/Fonts/consola.ttf",
        "C:/Windows/Fonts/cour.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationMono-Regular.ttf",
    ],
}

SEVERITY_MAP = {
    "critical": RISK_TERRACOTTA,
    "high": PENDING_BRONZE,
    "medium": AGENT_STEEL,
    "low": APPROVED_OLIVE,
    "info": TEXT_MUTED,
}


def ss(value: float) -> int:
    return int(round(value * SCALE))


def ensure_dir(path: Path) -> Path:
    path.mkdir(parents=True, exist_ok=True)
    return path


def kb(path: Path) -> float:
    return round(path.stat().st_size / 1024, 2)


def load_font(kind: str, size: int):
    size = max(1, int(size))
    for font_path in FONT_CANDIDATES.get(kind, []):
        try:
            return ImageFont.truetype(font_path, size)
        except Exception:
            continue
    try:
        return ImageFont.load_default(size=size)
    except TypeError:
        return ImageFont.load_default()


def rounded_rect(draw, box, radius, fill=None, outline=None, width=1):
    try:
        if outline is None:
            draw.rounded_rectangle(box, radius=radius, fill=fill)
        else:
            draw.rounded_rectangle(
                box,
                radius=radius,
                fill=fill,
                outline=outline,
                width=max(1, width),
            )
    except AttributeError:
        if outline is None:
            draw.rectangle(box, fill=fill)
        else:
            draw.rectangle(box, fill=fill, outline=outline, width=max(1, width))


def text_length(draw, text, font):
    try:
        return draw.textlength(text, font=font)
    except AttributeError:
        bbox = text_bbox(draw, text, font)
        return bbox[2] - bbox[0]


def text_bbox(draw, text, font):
    try:
        return draw.textbbox((0, 0), text, font=font)
    except AttributeError:
        w, h = font.getsize(text)
        return (0, 0, w, h)


def draw_mark(draw, x, y, size, simplified=False):
    u = size / 64.0

    def p(value):
        return int(round(value))

    gold = ACCENT_500
    gold_light = ACCENT_400
    purple = SEAL_PORPHYRY

    line_width = max(1, p(4 * u))
    cx = x + 32 * u
    cy = y + 30 * u
    r = 14 * u

    draw.arc(
        [p(cx - r), p(cy - r), p(cx + r), p(cy + r)],
        180,
        360,
        fill=gold_light,
        width=line_width,
    )
    draw.line(
        [p(cx - r), p(cy), p(cx - r), p(y + 46 * u)],
        fill=gold_light,
        width=line_width,
    )
    draw.line(
        [p(cx + r), p(cy), p(cx + r), p(y + 46 * u)],
        fill=gold_light,
        width=line_width,
    )

    if not simplified:
        keystone = 8 * u
        draw.rectangle(
            [
                p(cx - keystone / 2),
                p(y + 22 * u),
                p(cx + keystone / 2),
                p(y + 22 * u + keystone),
            ],
            fill=purple,
            outline=gold_light,
            width=max(1, p(1.5 * u)),
        )

    draw.line(
        [p(x + 22 * u), p(y + 46 * u), p(x + 42 * u), p(y + 46 * u)],
        fill=gold,
        width=max(1, p(3 * u)),
    )


def add_texture(img: Image.Image, intensity: float = 0.05, color=(201, 166, 100)):
    try:
        small = (max(1, img.width // 4), max(1, img.height // 4))
        noise = Image.effect_noise(small, 22).convert("L")
        noise = noise.resize(img.size, Image.LANCZOS)

        overlay = Image.new("RGBA", img.size, tuple(color) + (0,))
        overlay.putalpha(noise.point(lambda pixel: int(pixel * intensity)))

        base = img.convert("RGBA")
        base.alpha_composite(overlay)
        return base.convert("RGB")
    except Exception:
        return img


def make_og(domain_text: str = "aureus.arksystems.site") -> Image.Image:
    if len(domain_text) > 34:
        domain_text = domain_text[:31] + "…"

    width = ss(1200)
    height = ss(630)

    img = Image.new("RGB", (width, height), BG_PRIMARY)
    draw = ImageDraw.Draw(img)

    draw.rectangle(
        [ss(40), ss(40), ss(1160), ss(590)],
        outline=BORDER_LINE,
        width=max(1, ss(1)),
    )

    draw_mark(draw, ss(100), ss(190), ss(210), simplified=False)

    title_font = load_font("display", ss(104))
    subtitle_font = load_font("body", ss(34))
    tagline_font = load_font("body", ss(24))
    mono_font = load_font("mono", ss(22))

    draw.text((ss(380), ss(220)), "AUREUS", font=title_font, fill=ACCENT_400)
    draw.text(
        (ss(382), ss(330)),
        "Legal Tech Romano",
        font=subtitle_font,
        fill=TEXT_PRIMARY,
    )
    draw.text(
        (ss(382), ss(382)),
        "Autoridad mineral · precisión jurídica · confianza acuñada",
        font=tagline_font,
        fill=TEXT_SECONDARY,
    )
    draw.text(
        (ss(382), ss(470)),
        domain_text,
        font=mono_font,
        fill=ACCENT_500,
    )

    cx = ss(1020)
    cy = ss(180)
    r = ss(70)
    draw.ellipse(
        [cx - r, cy - r, cx + r, cy + r],
        fill=SEAL_PORPHYRY,
        outline=ACCENT_400,
        width=max(1, ss(3)),
    )

    inner_r = ss(54)
    draw.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        outline=ACCENT_400,
        width=max(1, ss(1)),
    )

    arch_r = ss(26)
    arch_cy = cy + ss(6)
    draw.arc(
        [cx - arch_r, arch_cy - arch_r, cx + arch_r, arch_cy + arch_r],
        180,
        360,
        fill=ACCENT_400,
        width=max(1, ss(3)),
    )
    draw.line(
        [cx - arch_r, arch_cy, cx - arch_r, arch_cy + ss(18)],
        fill=ACCENT_400,
        width=max(1, ss(3)),
    )
    draw.line(
        [cx + arch_r, arch_cy, cx + arch_r, arch_cy + ss(18)],
        fill=ACCENT_400,
        width=max(1, ss(3)),
    )
    draw.line(
        [cx - arch_r, arch_cy + ss(18), cx + arch_r, arch_cy + ss(18)],
        fill=ACCENT_500,
        width=max(1, ss(3)),
    )

    img = img.resize((1200, 630), Image.LANCZOS)
    return add_texture(img, intensity=0.045, color=ACCENT_500)


def make_icon(size: int, maskable: bool = False) -> Image.Image:
    canvas = ss(size)
    img = Image.new("RGB", (canvas, canvas), BG_PRIMARY)
    draw = ImageDraw.Draw(img)

    if not maskable:
        radius = max(2, int(round(14 * size / 64 * SCALE)))
        border_width = max(1, int(round(1.5 * size / 64 * SCALE)))
        rounded_rect(
            draw,
            [0, 0, canvas - 1, canvas - 1],
            radius,
            outline=BORDER_LINE,
            width=border_width,
        )

    ratio = 0.72 if maskable else 0.78
    mark_size = int(canvas * ratio)
    x = (canvas - mark_size) // 2
    y = (canvas - mark_size) // 2

    draw_mark(draw, x, y, mark_size, simplified=size <= 32)

    img = img.resize((size, size), Image.LANCZOS)
    intensity = 0.045 if size >= 180 else 0.025
    return add_texture(img, intensity=intensity, color=ACCENT_500)


def draw_pill(
    draw,
    x,
    y,
    text,
    font,
    fill=None,
    outline=None,
    text_fill=TEXT_PRIMARY,
    pad_x=18,
):
    px = ss(pad_x)
    pill_h = ss(48)
    tw = int(text_length(draw, text, font))
    bbox = text_bbox(draw, text, font)
    th = bbox[3] - bbox[1]

    box = [x, y, x + tw + 2 * px, y + pill_h]
    rounded_rect(
        draw,
        box,
        pill_h // 2,
        fill=fill if fill is not None else BG_PRIMARY,
        outline=outline,
        width=max(1, ss(1.5)) if outline else 0,
    )

    tx = x + px
    ty = y + (pill_h - th) // 2 - bbox[1]
    draw.text((tx, ty), text, font=font, fill=text_fill)

    return x + tw + 2 * px


def wrap_lines(draw, text, font, max_width, max_lines=3):
    words = text.split()
    lines = []
    current = ""

    for word in words:
        test = (current + " " + word).strip()
        if text_length(draw, test, font) <= max_width:
            current = test
        else:
            if current:
                lines.append(current)
                current = word
            else:
                lines.append(word)
                current = ""

            if len(lines) == max_lines:
                break

    if current and len(lines) < max_lines:
        lines.append(current)

    if len(lines) > max_lines:
        lines = lines[:max_lines]

    joined = " ".join(lines)
    if len(lines) == max_lines and joined != text:
        last = lines[-1]
        while last and text_length(draw, last + "…", font) > max_width:
            last = last[:-1]
        lines[-1] = last + "…"

    return lines


def make_alert_card(args) -> Image.Image:
    width = ss(1200)
    height = ss(630)

    img = Image.new("RGB", (width, height), BG_PRIMARY)
    draw = ImageDraw.Draw(img)

    severity = SEVERITY_MAP.get(str(args.severity).lower(), AGENT_STEEL)

    draw.rectangle([0, 0, ss(14), height], fill=severity)
    draw.rectangle(
        [ss(40), ss(40), ss(1160), ss(590)],
        outline=BORDER_LINE,
        width=max(1, ss(1)),
    )

    mono_small = load_font("mono", ss(22))
    x = ss(100)
    y = ss(100)

    x = draw_pill(
        draw,
        x,
        y,
        str(args.severity).upper(),
        mono_small,
        fill=severity,
        text_fill=ACCENT_FOREGROUND,
    )
    x += ss(16)

    draw_pill(
        draw,
        x,
        y,
        str(args.channel).upper(),
        mono_small,
        outline=BORDER_LINE,
        text_fill=TEXT_SECONDARY,
    )

    title_font = load_font("display", ss(64))
    lines = wrap_lines(draw, args.title, title_font, ss(880), max_lines=3)

    ty = ss(200)
    line_height = ss(76)
    for line in lines:
        draw.text((ss(100), ty), line, font=title_font, fill=TEXT_PRIMARY)
        ty += line_height

    draw.line(
        [ss(100), ss(455), ss(760), ss(455)],
        fill=BORDER_LINE,
        width=max(1, ss(1)),
    )

    footer_font = load_font("mono", ss(24))
    footer = f"{args.folio} · {args.date}"
    draw.text((ss(100), ss(485)), footer, font=footer_font, fill=ACCENT_500)

    watermark_font = load_font("display", ss(48))
    try:
        draw.text(
            (ss(1100), ss(530)),
            "AUREUS",
            font=watermark_font,
            fill=WATERMARK,
            anchor="rb",
        )
    except Exception:
        draw.text(
            (ss(880), ss(470)),
            "AUREUS",
            font=watermark_font,
            fill=WATERMARK,
        )

    img = img.resize((1200, 630), Image.LANCZOS)
    return add_texture(img, intensity=0.04, color=ACCENT_500)


def absolute_url(domain: str, base_path: str, filename: str) -> str:
    base = base_path.strip("/")
    domain = domain.rstrip("/")
    if base:
        return f"{domain}/{base}/{filename}"
    return f"{domain}/{filename}"


def write_metadata(args, out_dir: Path) -> list:
    if not args.web_root:
        return []

    web_root = ensure_dir(Path(args.web_root))
    written = []

    manifest = {
        "name": args.name,
        "short_name": args.short_name,
        "start_url": args.start_url,
        "scope": "/",
        "display": "standalone",
        "background_color": "#F8F3E9",
        "theme_color": "#100F0D",
        "icons": [
            {
                "src": absolute_url(args.domain, args.base_path, "android-chrome-192.png"),
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any maskable",
            },
            {
                "src": absolute_url(args.domain, args.base_path, "android-chrome-512.png"),
                "sizes": "512x512",
                "type": "image/png",
                "purpose": "any maskable",
            },
            {
                "src": absolute_url(args.domain, args.base_path, "apple-touch-icon.png"),
                "sizes": "180x180",
                "type": "image/png",
            },
        ],
    }

    manifest_path = web_root / "site.webmanifest"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    written.append(manifest_path)

    robots = "User-agent: *\nDisallow: /api/v1/\n"
    if args.sitemap:
        robots += f"Sitemap: {args.sitemap}\n"

    robots_path = web_root / "robots.txt"
    robots_path.write_text(robots, encoding="utf-8")
    written.append(robots_path)

    canonical = args.domain.rstrip("/") + "/"
    og_image = absolute_url(args.domain, args.base_path, "og-image.png")
    twitter_image = absolute_url(args.domain, args.base_path, "twitter-card.png")
    favicon_32 = absolute_url(args.domain, args.base_path, "favicon-32.png")
    favicon_16 = absolute_url(args.domain, args.base_path, "favicon-16.png")
    apple_icon = absolute_url(args.domain, args.base_path, "apple-touch-icon.png")
    manifest_url = args.domain.rstrip("/") + "/site.webmanifest"

    svg_favicon_link = ""
    if args.svg_favicon:
        svg_favicon_link = (
            f'<link rel="icon" type="image/svg+xml" href="{escape(args.svg_favicon)}">\n'
        )

    meta_html = f"""<!-- AUREUS · Legal Tech Romano — SEO/social meta generated by generate_seo_assets.py -->
<meta name="theme-color" content="#100F0D">
<link rel="manifest" href="{escape(manifest_url)}">
{svg_favicon_link}<link rel="icon" type="image/png" sizes="32x32" href="{escape(favicon_32)}">
<link rel="icon" type="image/png" sizes="16x16" href="{escape(favicon_16)}">
<link rel="apple-touch-icon" sizes="180x180" href="{escape(apple_icon)}">
<link rel="canonical" href="{escape(canonical)}">

<meta property="og:type" content="website">
<meta property="og:site_name" content="{escape(args.short_name)}">
<meta property="og:title" content="{escape(args.name)}">
<meta property="og:description" content="{escape(args.description)}">
<meta property="og:url" content="{escape(canonical)}">
<meta property="og:image" content="{escape(og_image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="AUREUS Legal Tech Romano">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{escape(args.name)}">
<meta name="twitter:description" content="{escape(args.description)}">
<meta name="twitter:image" content="{escape(twitter_image)}">
<meta name="twitter:image:alt" content="AUREUS Legal Tech Romano">
"""

    meta_path = web_root / "meta-tags.html"
    meta_path.write_text(meta_html, encoding="utf-8")
    written.append(meta_path)

    return written


def print_summary(paths: list, title: str) -> None:
    print(f"\n🏛️  {title}")
    print("─" * 54)
    total = 0
    for path in paths:
        size = path.stat().st_size
        total += size
        print(f"{path.name:<32} {size / 1024:>8.2f} KB")
    print("─" * 54)
    print(f"{'TOTAL':<32} {total / 1024:>8.2f} KB")
    print("✅ Capa raster lista. Supersampling 4× + LANCZOS.\n")


def run_static(args) -> None:
    out_dir = ensure_dir(Path(args.out))
    display_domain = args.domain.split("//")[-1].rstrip("/")

    og = make_og(display_domain)
    og_path = out_dir / "og-image.png"
    og.save(og_path, format="PNG", optimize=True)

    twitter = og.copy()
    twitter_path = out_dir / "twitter-card.png"
    twitter.save(twitter_path, format="PNG", optimize=True)

    apple = make_icon(180, maskable=False)
    apple_path = out_dir / "apple-touch-icon.png"
    apple.save(apple_path, format="PNG", optimize=True)

    favicon_32 = make_icon(32, maskable=False)
    favicon_32_path = out_dir / "favicon-32.png"
    favicon_32.save(favicon_32_path, format="PNG", optimize=True)

    favicon_16 = make_icon(16, maskable=False)
    favicon_16_path = out_dir / "favicon-16.png"
    favicon_16.save(favicon_16_path, format="PNG", optimize=True)

    android_192 = make_icon(192, maskable=True)
    android_192_path = out_dir / "android-chrome-192.png"
    android_192.save(android_192_path, format="PNG", optimize=True)

    android_512 = make_icon(512, maskable=True)
    android_512_path = out_dir / "android-chrome-512.png"
    android_512.save(android_512_path, format="PNG", optimize=True)

    ico_base = make_icon(48, maskable=False)
    ico_path = out_dir / "favicon.ico"
    ico_base.save(
        ico_path,
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48)],
    )

    paths = [
        og_path,
        twitter_path,
        apple_path,
        favicon_32_path,
        favicon_16_path,
        android_192_path,
        android_512_path,
        ico_path,
    ]

    paths.extend(write_metadata(args, out_dir))
    print_summary(paths, "AUREUS — Static SEO / Social / PWA")


def run_alert(args) -> None:
    if not args.date:
        args.date = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    out_path = Path(args.out)
    if out_path.suffix.lower() == ".png":
        ensure_dir(out_path.parent)
        target = out_path
    else:
        ensure_dir(out_path)
        target = out_path / "alert-card.png"

    card = make_alert_card(args)
    card.save(target, format="PNG", optimize=True)
    print_summary([target], f"AUREUS — Alert Card · {args.severity}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AUREUS raster forge — OG, Twitter, favicons, PWA metadata y alert cards."
    )

    parser.add_argument("--out", default="assets/aureus-seo")
    parser.add_argument("--web-root", default=None)
    parser.add_argument("--domain", default="https://aureus.arksystems.site")
    parser.add_argument("--name", default="AUREUS · Legal Tech Romano")
    parser.add_argument("--short-name", default="AUREUS")
    parser.add_argument(
        "--description",
        default="Design system legal-tech romano para despachos serios: autoridad mineral, precisión jurídica y confianza acuñada.",
    )
    parser.add_argument("--base-path", default="/assets/aureus-seo")
    parser.add_argument("--start-url", default="/")
    parser.add_argument("--sitemap", default="")
    parser.add_argument("--svg-favicon", default="")

    parser.add_argument("--alert", action="store_true")
    parser.add_argument("--channel", default="AUREUS")
    parser.add_argument("--severity", default="info")
    parser.add_argument(
        "--title",
        default="El agente detectó una inconsistencia en la minuta de cierre",
    )
    parser.add_argument("--date", default="")
    parser.add_argument("--folio", default="AUR-000000")

    args = parser.parse_args()

    if args.alert:
        run_alert(args)
    else:
        run_static(args)


if __name__ == "__main__":
    main()
