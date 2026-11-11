#!/usr/bin/env python3
"""Acquire a licensed Wikimedia Commons image into a development-only staging folder."""
import json, pathlib, sys, urllib.parse, urllib.request, re
from PIL import Image, ImageOps
from io import BytesIO

manifest = json.loads(pathlib.Path("data/commons-photo-acquisition.json").read_text())
eateries = {x["id"]: x for x in json.loads(pathlib.Path("data/eateries.json").read_text())}
outdir = pathlib.Path("photo-staging")
outdir.mkdir(exist_ok=True)
for item in manifest["images"]:
    if not item.get("enabled"): continue
    if not item.get("license") or not item.get("author") or not item.get("sourcePage"):
        raise ValueError("Image attribution incomplete")
    rid = item["restaurantId"]
    if rid not in eateries: raise ValueError("Unknown restaurant: " + rid)
    if eateries[rid].get("photo") and "illustration" not in eateries[rid].get("photo","").lower():
        raise ValueError("Existing real photo requires explicit replacement approval: " + rid)
    if rid == "MBA-DINE-0001": raise ValueError("Owner-approved A Taste of Monterey image must not be replaced")
    if not item["sourcePage"].startswith("https://commons.wikimedia.org/wiki/File:"):
        raise ValueError("Source must be an image-specific Wikimedia Commons page")
    title = item["commonsFileTitle"]
    api = "https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url|extmetadata&format=json&titles=" + urllib.parse.quote("File:"+title)
    req = urllib.request.Request(api, headers={"User-Agent":"MBA-Eatery-photo-research/0.1 (educational photo attribution)"})
    with urllib.request.urlopen(req, timeout=30) as resp: data=json.load(resp)
    page=next(iter(data["query"]["pages"].values()))
    info=page["imageinfo"][0]
    ext=info.get("extmetadata", {})
    license_name=ext.get("LicenseShortName", {}).get("value", "")
    if not license_name or not re.sub(r"[^a-z0-9]","",license_name.lower()) == re.sub(r"[^a-z0-9]","",item["license"].lower()):
        raise ValueError(f"Commons license mismatch for {rid}: expected {item['license']}, actual {license_name}")
    req=urllib.request.Request(info["url"],headers={"User-Agent":"MBA-Eatery-photo-research/0.1"})
    with urllib.request.urlopen(req,timeout=45) as resp: raw=resp.read(18_000_000)
    img=ImageOps.exif_transpose(Image.open(BytesIO(raw))).convert("RGB")
    img.thumbnail((1200,900))
    target=outdir/(item["restaurantId"]+".webp")
    img.save(target,format="WEBP",quality=82,method=6)
    (outdir/(rid+".attribution.json")).write_text(json.dumps({"restaurantId":rid,"sourcePage":item["sourcePage"],"author":item["author"],"license":license_name,"commonsFileTitle":title},indent=2)+"\\n")
    print(f"STAGED {target} {img.width}x{img.height} license={license_name}")
