#!/usr/bin/env python3
"""Build the 2026 gallery from the photo PDF.

Usage:  python3 tools/build_gallery_2026.py path/to/Fraela_pics_compressed.pdf

Needs poppler's `pdfimages` and Pillow (with WebP support).

Every PDF page holds exactly one photo, so the page number is the photo's
position. A photo that already appeared on an earlier page (byte-identical) is
skipped and logged, so each picture shows once, at its first appearance.

Writes:
  public/media/2026/gallery/s/NNNN.webp   720 px long edge (scroll tiles)
  public/media/2026/gallery/l/NNNN.webp   1280 px long edge (large frames, viewer)
  public/media/2026/gallery/mosaic.webp   48 px square tiles, 32 per row (finale)
  src/gallery-2026.json                   manifest in PDF order
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ProcessPoolExecutor

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'media', '2026', 'gallery')
MANIFEST = os.path.join(ROOT, 'src', 'gallery-2026.json')
SIZES = {'s': (720, 74), 'l': (1280, 76)}
TILE, TILE_COLS = 48, 32


def fail(message):
    sys.exit(f'build_gallery_2026: {message}')


def list_images(pdf):
    out = subprocess.run(['pdfimages', '-list', pdf], check=True, capture_output=True, text=True).stdout
    pages = [int(line.split()[0]) for line in out.splitlines()[2:] if line.strip()]
    count = int(subprocess.run(['pdfinfo', pdf], check=True, capture_output=True, text=True)
                .stdout.split('Pages:')[1].split()[0])
    if pages != list(range(1, count + 1)):
        fail('expected exactly one image on every page')
    return count


def signature(image):
    small = image.resize((12, 12), Image.Resampling.BOX)
    return list(small.tobytes())


def encode(path, n):
    with Image.open(path) as source:
        icc = source.info.get('icc_profile')
        image = ImageOps.exif_transpose(source).convert('RGB')
    for key, (edge, quality) in SIZES.items():
        copy = image.copy()
        copy.thumbnail((edge, edge), Image.Resampling.LANCZOS)
        copy.save(os.path.join(OUT, key, f'{n:04d}.webp'), 'WEBP', quality=quality, method=6, icc_profile=icc)


def main():
    if len(sys.argv) != 2:
        fail(__doc__.strip().splitlines()[2].strip())
    pdf = sys.argv[1]
    page_count = list_images(pdf)

    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(['pdfimages', '-j', '-p', pdf, os.path.join(tmp, 'p')], check=True)
        files = sorted((f for f in os.listdir(tmp) if f.endswith('.jpg')), key=lambda f: int(f.split('-')[1]))
        if len(files) != page_count:
            fail(f'extracted {len(files)} images from {page_count} pages')

        if os.path.isdir(OUT):
            shutil.rmtree(OUT)
        for key in SIZES:
            os.makedirs(os.path.join(OUT, key))

        seen, photos, skipped, tiles, jobs = {}, [], [], [], []
        pool = ProcessPoolExecutor()
        previous = None
        for name in files:
            page = int(name.split('-')[1])
            path = os.path.join(tmp, name)
            digest = hashlib.sha256(open(path, 'rb').read()).hexdigest()
            if digest in seen:
                skipped.append({'page': page, 'sameAs': seen[digest]})
                continue
            n = len(photos) + 1
            seen[digest] = n
            jobs.append(pool.submit(encode, path, n))
            with Image.open(path) as source:
                image = ImageOps.exif_transpose(source).convert('RGB')
            r, g, b = image.resize((1, 1), Image.Resampling.BOX).getpixel((0, 0))
            sig = signature(image)
            change = round(sum(abs(a - b) for a, b in zip(sig, previous)) / len(sig), 1) if previous else 0
            previous = sig
            tiles.append(ImageOps.fit(image, (TILE, TILE), Image.Resampling.LANCZOS))
            photos.append({'n': n, 'page': page, 'w': image.width, 'h': image.height,
                           'c': f'#{r:02x}{g:02x}{b:02x}', 'd': change})
        for job in jobs:
            job.result()
        pool.shutdown()

    rows = -(-len(tiles) // TILE_COLS)
    sheet = Image.new('RGB', (TILE_COLS * TILE, rows * TILE), '#6C3482')
    for i, tile in enumerate(tiles):
        sheet.paste(tile, ((i % TILE_COLS) * TILE, (i // TILE_COLS) * TILE))
    sheet.save(os.path.join(OUT, 'mosaic.webp'), 'WEBP', quality=72, method=6)

    shown = {p['page'] for p in photos} | {s['page'] for s in skipped}
    if shown != set(range(1, page_count + 1)):
        fail('a PDF page is unaccounted for')
    if [p['page'] for p in photos] != sorted(p['page'] for p in photos):
        fail('photos are out of PDF order')

    manifest = {'source': os.path.basename(pdf), 'pages': page_count, 'count': len(photos),
                'tile': TILE, 'tileColumns': TILE_COLS, 'skipped': skipped, 'photos': photos}
    with open(MANIFEST, 'w') as handle:
        json.dump(manifest, handle, separators=(',', ':'))
    print(f'{page_count} pages -> {len(photos)} photos, {len(skipped)} repeats skipped')


if __name__ == '__main__':
    main()
