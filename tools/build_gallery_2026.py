#!/usr/bin/env python3
"""Build the curated 2026 photos from Fraela_pics_compressed.pdf.

Usage: python3 tools/build_gallery_2026.py path/to/Fraela_pics_compressed.pdf

The PDF holds one JPEG per page. The pages to export are the ones listed in
src/gallery-2026.json (chapter photos and hero layers). For each page the script
writes two WebP files to public/media/2026/photos/ and records the pixel size of
the large file in src/gallery-2026-photos.json, which the page and the Remotion
film both read. Requires poppler (pdfimages) and Pillow with WebP support.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / 'src' / 'gallery-2026.json'
SIZES = ROOT / 'src' / 'gallery-2026-photos.json'
OUT = ROOT / 'public' / 'media' / '2026' / 'photos'
SMALL_WIDTH = 640
LARGE_LONG_SIDE = 1400


def pages_from_content():
    content = json.loads(CONTENT.read_text())
    pages = [photo['page'] for chapter in content['chapters'] for photo in chapter['photos']]
    if len(pages) != len(set(pages)):
        sys.exit('A page appears in more than one chapter of src/gallery-2026.json')
    missing = [page for page in content['hero'] if page not in pages]
    if missing:
        sys.exit(f'Hero pages must also be chapter photos: {missing}')
    return sorted(pages)


def extract_page(pdf, page, workdir):
    prefix = workdir / f'p{page:04d}'
    subprocess.run(['pdfimages', '-j', '-f', str(page), '-l', str(page), str(pdf), str(prefix)], check=True)
    found = sorted(workdir.glob(f'p{page:04d}-*'))
    if len(found) != 1:
        sys.exit(f'Page {page} holds {len(found)} images; expected exactly one')
    return found[0]


def resized(image, width):
    if image.width <= width:
        return image
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


def main():
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    pdf = Path(sys.argv[1])
    if not pdf.is_file():
        sys.exit(f'PDF not found: {pdf}')

    pages = pages_from_content()
    OUT.mkdir(parents=True, exist_ok=True)
    sizes = {}
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        for page in pages:
            source = extract_page(pdf, page, workdir)
            with Image.open(source) as opened:
                image = ImageOps.exif_transpose(opened).convert('RGB')
            scale = min(1, LARGE_LONG_SIDE / max(image.size))
            large = resized(image, round(image.width * scale))
            small = resized(image, SMALL_WIDTH)
            name = f'{page:04d}'
            large.save(OUT / f'{name}-l.webp', 'WEBP', quality=84, method=6)
            small.save(OUT / f'{name}-s.webp', 'WEBP', quality=80, method=6)
            sizes[str(page)] = {'w': large.width, 'h': large.height}
            print(f'page {page}: {large.width}x{large.height}')

    stale = {path.name for path in OUT.glob('*.webp')} - {
        f'{int(page):04d}-{size}.webp' for page in sizes for size in ('s', 'l')
    }
    for name in sorted(stale):
        (OUT / name).unlink()
        print(f'removed {name}')

    SIZES.write_text(json.dumps(sizes, indent=2) + '\n')
    print(f'{len(sizes)} photos written to {OUT.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
