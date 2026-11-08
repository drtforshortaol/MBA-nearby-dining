#!/usr/bin/env python3
"""Stage a permission-verified storefront image in a candidate JSON, never production.

Usage: python scripts/rde_install_photo.py --image assets/photos/goodies-delicatessen-storefront.jpg --output /tmp/eateries-photo-candidate.json
"""
import argparse
import json
from pathlib import Path

ID = "MBA-DINE-0068"
def item_asset_path(root):
    intake=json.loads((root/"data/photo-intake-pending.json").read_text())
    item=next((i for i in intake["items"] if i["restaurant_id"]==ID),None)
    return item.get("repository_asset_path") if item else None

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--image",required=True)
    p.add_argument("--output",required=True)
    a=p.parse_args()
    root=Path(__file__).resolve().parents[1]
    image=Path(a.image)
    if image.is_absolute() or ".." in image.parts or image.suffix.lower() not in {".jpg",".jpeg",".png",".webp"}:
        p.error("Image must be a repository-relative image path")
    full=root/image
    if not full.is_file() or full.stat().st_size==0:
        p.error("Image bytes must already exist in the repository")
    if image.as_posix()!=item_asset_path(root):
        p.error("Image path must match the authorized intake record")
    intake=json.loads((root/"data/photo-intake-pending.json").read_text())
    item=next((i for i in intake["items"] if i["restaurant_id"]==ID),None)
    if not item or item["permission_status"]!="owner_confirmed_via_project_owner":
        p.error("Missing documented photo authorization")
    source=root/"data/eateries.json"
    records=json.loads(source.read_text())
    record=next((r for r in records if r["id"]==ID),None)
    if record is None or record["name"]!="Goodies Delicatessen":
        p.error("Permanent restaurant identifier mismatch")
    if record.get("photo"):
        p.error("Existing photo must not be overwritten automatically")
    record.update(photo=image.as_posix(),photoCaption="Goodies Delicatessen storefront and entrance.",photoCreator="Olivia Sarkis",photoLicense="Used with permission of photographer.",photoSource="",photoDate="")
    output=Path(a.output).resolve()
    if output==source.resolve() or output.is_relative_to(root/"data"):
        p.error("Output must be outside protected production data directory")
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(records,ensure_ascii=False,indent=2)+"\n")
    print(f"Prepared candidate {output}; production untouched; image {image}")
if __name__=="__main__":
    main()
