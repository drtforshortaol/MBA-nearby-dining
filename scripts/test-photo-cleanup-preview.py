#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageChops
root=Path(__file__).resolve().parents[1]
for ident,original in [('MBA-DINE-0068','IMG_4940.jpeg'),('MBA-DINE-0031','photos/MBA-DINE-0031.webp'),('MBA-DINE-0042','photos/MBA-DINE-0042.webp')]:
    before=root/'photo-review-previews'/f'{ident}-before.jpg'
    after=root/'photo-review-previews'/f'{ident}-cleanup-preview.jpg'
    assert before.is_file() and after.is_file(), f'Missing preview for {ident}'
    with Image.open(before) as a, Image.open(after) as b, Image.open(root/original) as source:
        assert a.size==b.size and a.size[0]>0 and a.size[1]>0
        assert a.mode=='RGB' and b.mode=='RGB'
        assert ImageChops.difference(a,b).getbbox() is not None, f'No change {ident}'
        assert source.size[0]>0 and source.size[1]>0
    print(f'{ident}: preview created; original still available')
print('Preview smoke checks passed. Visual/entrance acceptance is still required.')
