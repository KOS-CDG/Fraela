#!/usr/bin/env python3
"""Build the Creativity archive from an export with numbered, dated filenames."""

import argparse
import json
import re
import shutil
from concurrent.futures import ProcessPoolExecutor
from datetime import datetime
from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory

from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parent.parent
MEDIA = ROOT / 'public' / 'media' / 'creativity'
MANIFEST = ROOT / 'src' / 'creativity-archive.json'
FILENAME = re.compile(r'(\d{4,})_(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2}-\d{2})_.+')
EXTENSIONS = {'.jpg', '.jpeg', '.png', '.mp4'}


def read_export(source):
    if not source.is_dir():
        raise ValueError(f'Export folder does not exist: {source}')
    entries, seen = [], set()
    for file in sorted(source.iterdir()):
        if not file.is_file() or file.suffix.lower() not in EXTENSIONS:
            continue
        match = FILENAME.fullmatch(file.stem)
        if not match:
            raise ValueError(f'Expected a sequence and timestamp in {file.name}')
        sequence, date, time = match.groups()
        stamp = datetime.strptime(f'{date} {time}', '%Y-%m-%d %H-%M-%S').isoformat()
        number = int(sequence)
        if number in seen:
            raise ValueError(f'Duplicate sequence number: {file.name}')
        seen.add(number)
        entries.append((stamp, number, file))
    if not entries:
        raise ValueError(f'No dated photos or videos found in {source}')
    return sorted(entries)


def oriented_image(original):
    oriented = ImageOps.exif_transpose(original)
    mode = 'RGBA' if 'A' in oriented.getbands() or 'transparency' in oriented.info else 'RGB'
    return oriented.convert(mode)


def read_photo(source, item_id):
    with Image.open(source) as original:
        try:
            return oriented_image(original)
        except OSError as error:
            if original.format != 'JPEG' or 'truncated' not in str(error):
                raise
            raw = source.read_bytes()
            if raw.endswith(b'\xff\xd9'):
                raise

    # Retry strict decoding with the missing JPEG end marker, without editing the export.
    with Image.open(BytesIO(raw + b'\xff\xd9')) as repaired:
        image = oriented_image(repaired)
    print(f'Recovered JPEG end marker for photo {item_id}.', flush=True)
    return image


def export_item(job):
    stamp, number, source, output = job
    item_id = f'{number:04d}'
    folder = stamp[:7]
    item = {'id': item_id, 'timestamp': stamp}
    path = output / folder

    try:
        if source.suffix.lower() == '.mp4':
            name = f'{item_id}.mp4'
            shutil.copyfile(source, path / name)
            return dict(item, kind='video', preview=f'{folder}/{name}')

        image = read_photo(source, item_id)
        thumb_name, preview_name = f'{item_id}-thumb.webp', f'{item_id}.webp'
        for name, edge, quality in ((thumb_name, 480, 74), (preview_name, 1440, 79)):
            sized = image.copy()
            sized.thumbnail((edge, edge), Image.Resampling.LANCZOS)
            sized.save(path / name, format='WEBP', quality=quality, method=3)
        return dict(item, kind='photo', thumb=f'{folder}/{thumb_name}',
                    preview=f'{folder}/{preview_name}')
    except (OSError, ValueError) as error:
        raise ValueError(f'Could not import {source.name}: {error}') from error


def publish(assets, data, staging):
    lock = ROOT / '.creativity-publish'
    lock.mkdir()
    try:
        previous = staging / 'previous'
        if MEDIA.exists():
            MEDIA.rename(previous)
        try:
            # Windows may hold a scan handle on the newly encoded directory.
            # Copy the staged set instead of relying on a directory rename.
            shutil.copytree(assets, MEDIA)
            data.replace(MANIFEST)
        except OSError:
            if MEDIA.exists():
                shutil.rmtree(MEDIA)
            if previous.exists():
                previous.rename(MEDIA)
            raise
    finally:
        lock.rmdir()


def build(source):
    if source.is_relative_to(MEDIA) or MEDIA.is_relative_to(source):
        raise ValueError('Choose a source folder separate from the generated media')
    entries = read_export(source)
    MEDIA.parent.mkdir(parents=True, exist_ok=True)
    with TemporaryDirectory(prefix='.creativity-build-', dir=ROOT) as temp:
        staging = Path(temp)
        assets = staging / 'assets'
        for month in {stamp[:7] for stamp, _, _ in entries}:
            (assets / month).mkdir(parents=True)
        with ProcessPoolExecutor(max_workers=6) as workers:
            jobs = ((stamp, number, file, assets) for stamp, number, file in entries)
            items = list(workers.map(export_item, jobs, chunksize=8))
        data = staging / MANIFEST.name
        lines = ',\n'.join(f'  {json.dumps(item, separators=(",", ":"))}' for item in items)
        data.write_text(f'[\n{lines}\n]\n', encoding='utf-8')

        publish(assets, data, staging)

    photos = sum(item['kind'] == 'photo' for item in items)
    print(f'Imported {photos} photos and {len(items) - photos} videos.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path, help='Path to the Phone_Exact_Order folder')
    arguments = parser.parse_args()
    try:
        build(arguments.source.resolve())
    except (OSError, ValueError) as error:
        parser.exit(1, f'{error}\n')
