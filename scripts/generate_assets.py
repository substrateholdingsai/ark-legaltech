#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AUREUS — Fábrica Vectorial Legal Tech Romano
Stdlib only. Genera SVGs + manifest.json.
"""

import sys

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import argparse
import json
import random
from pathlib import Path


XML = '<?xml version="1.0" encoding="UTF-8"?>\n'
_rng = random.Random(20261027)
NOISE_SEED = _rng.randint(1000, 9999)


FAVICON_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="aureusGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCBD85"/>
      <stop offset="1" stop-color="#C9A664"/>
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="#100F0D"/>
  <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="#3B342B" stroke-width="1.5"/>
  <path d="M18 46 V30 A14 14 0 0 1 46 30 V46" fill="none" stroke="url(#aureusGold)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="28" y="22" width="8" height="8" rx="2" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1.5"/>
  <path d="M22 46 H42" stroke="#C9A664" stroke-width="3" stroke-linecap="round"/>
</svg>
"""


LOGO_LOCKUP_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 160" width="640" height="160">
  <defs>
    <linearGradient id="lockupGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCBD85"/>
      <stop offset="1" stop-color="#C9A664"/>
    </linearGradient>
  </defs>

  <g transform="translate(24 24) scale(1.75)">
    <rect width="64" height="64" rx="14" fill="#100F0D"/>
    <rect x="1.5" y="1.5" width="61" height="61" rx="12.5" fill="none" stroke="#3B342B" stroke-width="1.5"/>
    <path d="M18 46 V30 A14 14 0 0 1 46 30 V46" fill="none" stroke="url(#lockupGold)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="28" y="22" width="8" height="8" rx="2" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1.5"/>
    <path d="M22 46 H42" stroke="#C9A664" stroke-width="3" stroke-linecap="round"/>
  </g>

  <text x="160" y="82" font-family="Cormorant Garamond, EB Garamond, Georgia, serif" font-size="58" font-weight="600" letter-spacing="6" fill="#DCBD85">AUREUS</text>
  <text x="162" y="116" font-family="Inter, Helvetica, Arial, sans-serif" font-size="17" font-weight="500" letter-spacing="4" fill="#B8AE9E">LEGAL TECH ROMANO</text>
  <path d="M160 132 H600" stroke="#3B342B" stroke-width="1"/>
</svg>
"""


def build_tessera_svg() -> str:
    parts = []
    for gy in range(0, 64, 16):
        for gx in range(0, 64, 16):
            cx = gx + 8
            cy = gy + 8
            parts.append(
                f'<path d="M{cx} {cy - 3} L{cx + 3} {cy} L{cx} {cy + 3} L{cx - 3} {cy} Z"/>'
            )
    body = "\n    ".join(parts)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <g fill="#C9A664" opacity="0.065">
    {body}
  </g>
</svg>
"""


def build_texture_basalt_svg() -> str:
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="basalt" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" seed="{NOISE_SEED}" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.13
                                                     0 0 0 0 0.11
                                                     0 0 0 0 0.09
                                                     0 0 0 0.30 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="#171512"/>
  <rect width="512" height="512" filter="url(#basalt)"/>
</svg>
"""


def build_texture_parchment_svg() -> str:
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="parchment" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" seed="{NOISE_SEED + 1}" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.96
                                                     0 0 0 0 0.93
                                                     0 0 0 0 0.88
                                                     0 0 0 0.22 0" result="tint"/>
      <feComposite in="tint" in2="SourceGraphic" operator="in"/>
    </filter>
  </defs>
  <rect width="512" height="512" fill="#F8F3E9"/>
  <rect width="512" height="512" filter="url(#parchment)"/>
</svg>
"""


MONOGRAM_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="monoGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCBD85"/>
      <stop offset="1" stop-color="#C9A664"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="58" fill="#100F0D" stroke="#3B342B" stroke-width="2"/>
  <circle cx="64" cy="64" r="48" fill="none" stroke="#C9A664" stroke-width="1" opacity="0.35"/>
  <g transform="translate(32 32)">
    <path d="M18 46 V30 A14 14 0 0 1 46 30 V46" fill="none" stroke="url(#monoGold)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="28" y="22" width="8" height="8" rx="2" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1.5"/>
    <path d="M22 46 H42" stroke="#C9A664" stroke-width="3" stroke-linecap="round"/>
  </g>
</svg>
"""


SEAL_STATE_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="sealGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCBD85"/>
      <stop offset="1" stop-color="#C9A664"/>
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="54" fill="#8B4A5A" stroke="url(#sealGold)" stroke-width="3"/>
  <circle cx="64" cy="64" r="44" fill="none" stroke="#DCBD85" stroke-width="1.5" stroke-dasharray="4 7" opacity="0.8"/>
  <g transform="translate(32 32)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 46 V30 A14 14 0 0 1 46 30 V46" stroke="#DCBD85" stroke-width="4"/>
    <rect x="28" y="22" width="8" height="8" rx="2" fill="#100F0D" stroke="#DCBD85" stroke-width="1.5"/>
    <path d="M22 46 H42" stroke="#C9A664" stroke-width="3"/>
  </g>
</svg>
"""


ARCH_DIVIDER_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 60" width="600" height="60">
  <path d="M0 40 H260" stroke="#3B342B" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M340 40 H600" stroke="#3B342B" stroke-width="1.5" stroke-linecap="round"/>
  <path d="M270 40 A30 30 0 0 1 330 40" fill="none" stroke="#C9A664" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="292" y="18" width="16" height="16" rx="3" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1.5"/>
  <circle cx="260" cy="40" r="2.5" fill="#C9A664"/>
  <circle cx="340" cy="40" r="2.5" fill="#C9A664"/>
</svg>
"""


KEYSTONE_NODE_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
  <rect x="8" y="8" width="32" height="32" rx="6" fill="#211E1A" stroke="#C9A664" stroke-width="2"/>
  <path d="M16 32 V24 A8 8 0 0 1 32 24 V32" fill="none" stroke="#DCBD85" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="21" y="17" width="6" height="6" rx="1" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1"/>
  <path d="M16 32 H32" stroke="#C9A664" stroke-width="2" stroke-linecap="round"/>
</svg>
"""


VIA_PROGRESS_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 48" width="320" height="48">
  <path d="M16 32 H304" stroke="#3B342B" stroke-width="3" stroke-linecap="round"/>
  <path d="M16 32 H112" stroke="#C9A664" stroke-width="3" stroke-linecap="round"/>
  <circle cx="16" cy="32" r="6" fill="#100F0D" stroke="#C9A664" stroke-width="2"/>
  <circle cx="112" cy="32" r="7" fill="#8B4A5A" stroke="#DCBD85" stroke-width="2"/>
  <circle cx="208" cy="32" r="6" fill="#100F0D" stroke="#3B342B" stroke-width="2"/>
  <circle cx="304" cy="32" r="6" fill="#100F0D" stroke="#3B342B" stroke-width="2"/>
  <path d="M112 18 V12 M208 18 V12 M304 18 V12" stroke="#3B342B" stroke-width="1.5" stroke-linecap="round"/>
</svg>
"""


ARC_MASK_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 160" width="320" height="160">
  <defs>
    <linearGradient id="arcMaskGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9A664" stop-opacity="0.34"/>
      <stop offset="1" stop-color="#8B4A5A" stop-opacity="0.08"/>
    </linearGradient>
  </defs>
  <path d="M0 160 V96 A160 96 0 0 1 320 96 V160 Z" fill="url(#arcMaskGrad)" opacity="0.18"/>
  <path d="M20 132 A140 82 0 0 1 300 132" fill="none" stroke="#DCBD85" stroke-width="1" opacity="0.22"/>
</svg>
"""


OG_IMAGE_SVG = XML + """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="ogGold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#DCBD85"/>
      <stop offset="1" stop-color="#C9A664"/>
    </linearGradient>
    <filter id="ogNoise" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="27" stitchTiles="stitch" result="noise"/>
      <feColorMatrix in="noise" type="matrix" values="0 0 0 0 0.79
                                                     0 0 0 0 0.65
                                                     0 0 0 0 0.39
                                                     0 0 0 0.07 0"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="#100F0D"/>
  <rect width="1200" height="630" filter="url(#ogNoise)"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="#3B342B" stroke-width="1"/>

  <g transform="translate(100 190) scale(3.2)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 46 V30 A14 14 0 0 1 46 30 V46" stroke="url(#ogGold)" stroke-width="4"/>
    <rect x="28" y="22" width="8" height="8" rx="2" fill="#8B4A5A" stroke="#DCBD85" stroke-width="1.5"/>
    <path d="M22 46 H42" stroke="#C9A664" stroke-width="3"/>
  </g>

  <text x="380" y="285" font-family="Cormorant Garamond, EB Garamond, Georgia, serif" font-size="104" font-weight="600" letter-spacing="4" fill="#DCBD85">AUREUS</text>
  <text x="382" y="345" font-family="Inter, Helvetica, Arial, sans-serif" font-size="34" font-weight="500" fill="#F3ECDF">Legal Tech Romano</text>
  <text x="382" y="395" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" font-weight="400" fill="#B8AE9E">Autoridad mineral · precisión jurídica · confianza acuñada</text>
  <text x="382" y="480" font-family="JetBrains Mono, IBM Plex Mono, Consolas, monospace" font-size="22" fill="#C9A664">aureus.arksystems.site</text>

  <circle cx="1020" cy="180" r="70" fill="#8B4A5A" stroke="#DCBD85" stroke-width="3"/>
  <circle cx="1020" cy="180" r="54" fill="none" stroke="#DCBD85" stroke-width="1.5" stroke-dasharray="5 8" opacity="0.75"/>
  <path d="M995 210 V185 A25 25 0 0 1 1045 185 V210" fill="none" stroke="#DCBD85" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M995 210 H1045" stroke="#C9A664" stroke-width="3" stroke-linecap="round"/>
</svg>
"""


SPRITE_ICONS = [
    (
        "codex",
        """<rect x="5" y="3" width="14" height="18" rx="2"/>
    <path d="M8 3v18"/>
    <path d="M11 8h5M11 12h5M11 16h3"/>""",
    ),
    (
        "sigillum",
        """<circle cx="12" cy="9" r="5"/>
    <path d="M9.5 13.2 7 21l5-2.5L17 21l-2.5-7.8"/>
    <path d="M10 9h4"/>""",
    ),
    (
        "arcus",
        """<path d="M4 20v-7a8 8 0 0 1 16 0v7"/>
    <path d="M2 20h20"/>
    <rect x="10.5" y="4.5" width="3" height="3" rx=".5"/>""",
    ),
    (
        "tabula",
        """<rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="M7 9h10M7 13h6"/>
    <path d="M16 3l4 4"/>""",
    ),
    (
        "via",
        """<path d="M4 20 9 4M20 20 15 4"/>
    <path d="M6.5 15h11M8.5 10h7M10.5 6h3"/>""",
    ),
    (
        "contractus",
        """<rect x="4" y="4" width="16" height="16" rx="2"/>
    <path d="M8 9h8M8 13h5"/>
    <circle cx="16" cy="16" r="2.5"/>""",
    ),
    (
        "scutum",
        """<path d="M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6z"/>
    <path d="M12 8v9"/>""",
    ),
    (
        "horologium",
        """<circle cx="12" cy="12" r="8"/>
    <path d="M12 7v5l3 2"/>""",
    ),
]


def build_sprite_svg() -> str:
    groups = []
    for i, (icon_id, paths) in enumerate(SPRITE_ICONS):
        x = i * 24
        groups.append(
            f'<g id="{icon_id}" transform="translate({x} 0)" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">\n    {paths}\n  </g>'
        )
    body = "\n  ".join(groups)
    return XML + f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 24" width="192" height="24" style="color:#C9A664">
  {body}
</svg>
"""


def write_asset(out_dir: Path, name: str, content: str) -> Path:
    path = out_dir / name
    if not content.endswith("\n"):
        content += "\n"
    path.write_text(content, encoding="utf-8")
    return path


def kb(size_bytes: int) -> float:
    return round(size_bytes / 1024, 2)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="AUREUS vector forge — genera SVGs y manifest.json con stdlib pura."
    )
    parser.add_argument(
        "--out",
        default="assets/aureus",
        help="Directorio de salida. Ej.: assets/aureus",
    )
    args = parser.parse_args()

    out_dir = Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    assets = [
        ("favicon.svg", FAVICON_SVG),
        ("logo-lockup.svg", LOGO_LOCKUP_SVG),
        ("pattern-tessera.svg", build_tessera_svg()),
        ("texture-basalt.svg", build_texture_basalt_svg()),
        ("texture-parchment.svg", build_texture_parchment_svg()),
        ("monogram-aureus.svg", MONOGRAM_SVG),
        ("seal-state.svg", SEAL_STATE_SVG),
        ("arch-divider.svg", ARCH_DIVIDER_SVG),
        ("keystone-node.svg", KEYSTONE_NODE_SVG),
        ("via-progress.svg", VIA_PROGRESS_SVG),
        ("arc-mask.svg", ARC_MASK_SVG),
        ("og-image.svg", OG_IMAGE_SVG),
        ("sprite-gremial.svg", build_sprite_svg()),
    ]

    records = []
    for name, content in assets:
        path = write_asset(out_dir, name, content)
        size = path.stat().st_size
        records.append(
            {
                "path": name,
                "bytes": size,
                "kb": kb(size),
            }
        )

    manifest = {
        "schema": "bobs.asset-manifest.v1",
        "system": "AUREUS",
        "slug": "legaltech-aureus",
        "kind": "vector-forge",
        "stdlib_only": True,
        "noise_seed": NOISE_SEED,
        "files": records,
        "total_bytes": sum(r["bytes"] for r in records),
        "total_kb": round(sum(r["bytes"] for r in records) / 1024, 2),
    }

    manifest_path = out_dir / "manifest.json"
    manifest_path.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )

    manifest_size = manifest_path.stat().st_size

    print("\n🏛️  AUREUS — Fábrica Vectorial Romana")
    print(f"📁 Salida: {out_dir.resolve()}")
    print("─" * 54)
    for record in records:
        print(f"{record['path']:<28} {record['kb']:>8.2f} KB")
    print("─" * 54)
    print(f"{'manifest.json':<28} {kb(manifest_size):>8.2f} KB")
    print(f"{'TOTAL SVG':<28} {manifest['total_kb']:>8.2f} KB")
    print("✅ Listo. Zero Pillow. Zero dependencias externas.\n")


if __name__ == "__main__":
    main()
