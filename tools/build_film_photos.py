#!/usr/bin/env python3
"""Export the extra photos that only the 2026 birthday film uses.

Usage: python3 tools/build_film_photos.py path/to/Fraela_pics_compressed.pdf PAGE [PAGE ...]

The film uses every photo on the 2026 page (public/media/2026/photos/) plus a few
more from the same shoots. Those extras are written to video/src/photos/NNNN.webp,
where the film imports them, so they are not published with the website.
Requires poppler (pdfimages) and Pillow with WebP support.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'video' / 'src' / 'photos'
LONG_SIDE = 1400


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    pdf = Path(sys.argv[1])
    if not pdf.is_file():
        sys.exit(f'PDF not found: {pdf}')
    pages = sorted({int(page) for page in sys.argv[2:]})
    OUT.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        for page in pages:
            prefix = workdir / f'p{page:04d}'
            subprocess.run(['pdfimages', '-j', '-f', str(page), '-l', str(page), str(pdf), str(prefix)], check=True)
            found = sorted(workdir.glob(f'p{page:04d}-*'))
            if len(found) != 1:
                sys.exit(f'Page {page} holds {len(found)} images; expected exactly one')
            with Image.open(found[0]) as opened:
                image = ImageOps.exif_transpose(opened).convert('RGB')
            scale = min(1, LONG_SIDE / max(image.size))
            if scale < 1:
                size = (round(image.width * scale), round(image.height * scale))
                image = image.resize(size, Image.Resampling.LANCZOS)
            image.save(OUT / f'{page:04d}.webp', 'WEBP', quality=84, method=6)
            print(f'page {page}: {image.width}x{image.height}')


if __name__ == '__main__':
    main()
