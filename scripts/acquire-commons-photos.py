#!/usr/bin/env python3
"""Acquire a licensed Wikimedia Commons image into a development-only staging folder."""
import json, pathlib, sys, urllib.parse, urllib.request
from PIL import Image, ImageOps
from io import BytesIO

manifest = json.loads(pathlib.Path("data/commons-photo-acquisition.json").read_text())
outdir = pathlib.Path("photo-staging")
outdir.mkdir(exist_ok=True)
for item in manifest["images"]:
    if not item.get("enabled"): continue
    if not item.get("license") or not item.get("author") or not item.get("sourcePage"):
        raise ValueError("Image attribution incomplete")
    title = item["commonsFileTitle"]
    api = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&format=json&titles=" + urllib.parse.quote("File:"+title)
    req = urllib.request.Request(api, headers={"User-Agent":"MBA-Eatery-photo-research/0.1 (educational photo attribution)"})
    with urllib.request.urlopen(req, timeout=30) as resp: data=json.load(resp)
    page=next(iter(data["query"]["pages"].values()))
    info=page["imageinfo"][0]
    req=urllib.request.Request(info["url"],headers={"User-Agent":"MBA-Eatery-photo-research/0.1"})
    with urllib.request.urlopen(req,timeout=45) as resp: raw=resp.read(18_000_000)
    img=ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    img.thumbnail((1200,900))
    target=outdir/(item["restaurantId"]+".webp")
    img.save(target,format="WEBP",quality=82,method=6)
    print(f"STAGED {target} {img.width}x{img.height} license={item['license']}")
