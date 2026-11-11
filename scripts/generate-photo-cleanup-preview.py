#!/usr/bin/env python3
"""Generate conservative, non-destructive cleanup previews from existing project photos."""
import argparse
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

ROOT = Path(__file__).resolve().parents[1]
ALLOWED = {
    'MBA-DINE-0068': 'IMG_4940.jpeg',
    'MBA-DINE-0031': 'photos/MBA-DINE-0031.webp',
    'MBA-DINE-0042': 'photos/MBA-DINE-0042.webp',
}

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--restaurant-id', choices=sorted(ALLOWED), required=True)
    p.add_argument('--output-dir', default='photo-review-previews')
    args = p.parse_args()
    original = ROOT / ALLOWED[args.restaurant_id]
    out = ROOT / args.output_dir
    out.mkdir(parents=True, exist_ok=True)
    with Image.open(original) as source:
        source = ImageOps.exif_transpose(source).convert('RGB')
        source.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        cleaned = ImageEnhance.Contrast(source).enhance(1.035)
        cleaned = ImageEnhance.Color(cleaned).enhance(1.025)
        cleaned = ImageEnhance.Sharpness(cleaned).enhance(1.08)
        before = out / f'{args.restaurant_id}-before.jpg'
        after = out / f'{args.restaurant_id}-cleanup-preview.jpg'
        source.save(before, quality=88, optimize=True)
        cleaned.save(after, quality=88, optimize=True)
        print(f'Before: {before.relative_to(ROOT)}')
        print(f'Preview: {after.relative_to(ROOT)}')
        print('No source overwritten; no changes to the app. Human visual review required.')

if __name__ == '__main__':
    main()
