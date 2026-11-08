#!/usr/bin/env python3
"""RDE v0: lossless Excel projection of the existing Eatery JSON.
Requires: pip install openpyxl
Usage:
 python scripts/rde_workbook.py export data/eateries.json rde.xlsx
 python scripts/rde_workbook.py import rde.xlsx candidate.json
 python scripts/rde_workbook.py verify data/eateries.json candidate.json
Do not replace production JSON without application validation.
"""
import argparse
import hashlib
import json
from pathlib import Path
from openpyxl import Workbook, load_workbook
from openpyxl.styles import Font, PatternFill
from openpyxl.utils import get_column_letter

TABLES = {
 "Restaurants": ["restaurant_id","name","address","city","phone","website","lat","lon","area","cuisine","hours"],
 "Categories": ["category_id","dimension","label","active"],
 "RestaurantCategories": ["restaurant_id","category_id","status","evidence_id"],
 "Features": ["restaurant_id","feature_key","value","verification_status","evidence_id","reviewed_on"],
 "Hours": ["hours_id","restaurant_id","text","status","evidence_id","reviewed_on"],
 "Menus": ["menu_id","restaurant_id","menu_url","status","evidence_id","reviewed_on"],
 "Media": ["media_id","restaurant_id","file_ref","kind","license","creator","caption","evidence_id"],
 "Sources": ["source_id","url","publisher","accessed_on","source_type"],
 "Evidence": ["evidence_id","restaurant_id","source_id","field_path","claim","status","reviewed_on"],
 "ResearchStatus": ["restaurant_id","section","status","last_researched","next_review"],
 "Relationships": ["relationship_id","restaurant_id","target_restaurant_id","relation_type","note"],
 "LegacyFields": ["restaurant_id","raw_json_payload","sha256"]
}
FIELDS = TABLES["Restaurants"][1:]
def canonical(obj):
 return json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(",",":"))
def digest(s): return hashlib.sha256(s.encode("utf-8")).hexdigest()
def rows(ws):
 it=ws.values; header=next(it)
 return [dict(zip(header,r)) for r in it if any(x is not None for x in r)]
def export(src,dst):
 records=json.loads(Path(src).read_text(encoding="utf-8"))
 assert isinstance(records,list)
 ids=[r["id"] for r in records]
 assert len(ids)==len(set(ids)) and all(isinstance(x,str) for x in ids)
 wb=Workbook(); wb.remove(wb.active)
 for name,headers in TABLES.items():
  ws=wb.create_sheet(name);ws.append(headers);ws.freeze_panes="B2"
  ws.auto_filter.ref=f"A1:{get_column_letter(len(headers))}1"
  for cell in ws[1]: cell.font=Font(color="FFFFFF",bold=True);cell.fill=PatternFill("solid",fgColor="174A67")
  ws.column_dimensions["A"].width=25
 for r in records:
  rid=r["id"]
  wb["Restaurants"].append([rid]+[r.get(f) if not isinstance(r.get(f),(dict,list)) else canonical(r[f]) for f in FIELDS])
  raw=canonical(r)
  wb["LegacyFields"].append([rid,raw,digest(raw)])
  if r.get("cuisine"): wb["RestaurantCategories"].append([rid,"CUISINE:"+str(r["cuisine"]),"unverified",None])
  if r.get("hours"): wb["Hours"].append(["H:"+rid,rid,r["hours"],"unverified",None,None])
  if r.get("menuUrl"): wb["Menus"].append(["M:"+rid,rid,r["menuUrl"],"unverified",None,None])
  if r.get("photo"): wb["Media"].append(["P:"+rid,rid,r["photo"],"legacy",r.get("photoLicense"),r.get("photoCreator"),r.get("photoCaption"),None])
  for k,v in (r.get("attributes") or {}).items():
   if isinstance(v,dict): wb["Features"].append([rid,k,str(v.get("value","unknown")),str(v.get("status","unverified")),None,None])
  wb["ResearchStatus"].append([rid,"general","not_yet_researched",None,None])
 wb["LegacyFields"].column_dimensions["B"].width=65
 wb.save(dst)
 print("EXPORTED",len(records),"records to",dst)
def import_(src,dst):
 wb=load_workbook(src,read_only=True,data_only=True)
 originals=rows(wb["LegacyFields"]); edits=rows(wb["Restaurants"])
 base={}
 for row in originals:
  rid=row["restaurant_id"]; raw=row["raw_json_payload"]
  if rid in base or digest(raw)!=row["sha256"]: raise ValueError("Legacy payload corrupted or duplicate: "+str(rid))
  obj=json.loads(raw)
  if obj.get("id")!=rid: raise ValueError("ID mismatch "+str(rid))
  base[rid]=obj
 if len(edits)!=len(base): raise ValueError("Restaurant count changed; additions require separate approval")
 seen=set();out=[]
 for row in edits:
  rid=row["restaurant_id"]
  if rid in seen or rid not in base: raise ValueError("Unknown or duplicate ID: "+str(rid))
  seen.add(rid);obj=base[rid].copy()
  for field in FIELDS:
   value=row.get(field)
   old=obj.get(field)
   # Preserve null vs blank in unchanged projections; explicit edits can replace populated values.
   if value==old or (value is None and old is None): continue
   if isinstance(old,(dict,list)) and value==canonical(old): continue
   if value is None and field not in obj: continue
   obj[field]=value
  out.append(obj)
 if seen!=set(base): raise ValueError("Deleted IDs")
 Path(dst).write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print("IMPORTED",len(out),"records to",dst)
def verify(src,dst):
 a=json.loads(Path(src).read_text(encoding="utf-8"))
 b=json.loads(Path(dst).read_text(encoding="utf-8"))
 if a!=b:
  diffs=[]
  for old,new in zip(a,b):
   for key in set(old)|set(new):
    if old.get(key)!=new.get(key) or (key in old)!=(key in new):
     diffs.append((old.get("id"),key,repr(old.get(key))[:100],repr(new.get(key))[:100]))
  for diff in diffs[:20]: print("DIFF",diff)
  raise SystemExit(f"FAIL: {len(diffs)} JSON field differences; do not migrate")
 print("PASS: lossless semantic round-trip",len(a),"records")
if __name__=="__main__":
 p=argparse.ArgumentParser();p.add_argument("action",choices=["export","import","verify"]);p.add_argument("source");p.add_argument("destination");a=p.parse_args()
 {"export":export,"import":import_,"verify":verify}[a.action](a.source,a.destination)
