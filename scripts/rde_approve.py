#!/usr/bin/env python3
"""Create a reviewed *candidate* JSON. Never writes production data.
Usage: python scripts/rde_approve.py workbook.xlsx baseline.json candidate.json
Only explicitly accepted scalar edits to allowlisted fields are promoted.
"""
import json
import sys
from pathlib import Path
from openpyxl import load_workbook

EDITABLE={"name","address","city","phone","website","hours","cuisine","area"}
def read(ws):
 it=ws.values
 header=next(it)
 return [dict(zip(header,row)) for row in it if any(x is not None for x in row)]
def fail(message):
 raise ValueError(message)
def promote(workbook,baseline,destination):
 src=Path(baseline).resolve();dst=Path(destination).resolve()
 if src==dst: fail("Refusing to overwrite baseline JSON")
 data=json.loads(src.read_text(encoding="utf-8"))
 if not isinstance(data,list): fail("Expected restaurant array")
 byid={r["id"]:r for r in data}
 if len(byid)!=len(data): fail("Duplicate baseline IDs")
 wb=load_workbook(workbook,read_only=True,data_only=True)
 history={}; reviews=[]
 for row in read(wb["ResearchHistory"]):
  key=row["history_id"]
  if not key or key in history: fail("Missing or duplicate history ID")
  history[key]=row
 for row in read(wb["ReviewQueue"]):
  reviews.append(row)
 evidence={}
 for row in read(wb["Evidence"]):
  key=row["evidence_id"]
  if not key or key in evidence: fail("Missing or duplicate evidence ID")
  evidence[key]=row
 review_ids=set()
 for review in reviews:
  key=review["review_id"]
  if not key or key in review_ids: fail("Missing or duplicate review ID")
  review_ids.add(key)
 # Conflicts or unresolved evidence for the same restaurant/field block promotion.
 unresolved=set()
 for row in read(wb["ReviewQueue"]):
  if row["decision"] in ("conflicting","needs_more_evidence"):
   unresolved.add((row["restaurant_id"],row["field_path"]))
 for row in read(wb["Evidence"]):
  if row["status"]=="conflicting":
   unresolved.add((row["restaurant_id"],row["field_path"]))
 seen=set();changes=[]
 for review in reviews:
  if review["decision"]!="accepted": continue
  hid=review["history_id"]
  h=history.get(hid)
  if not h: fail("Accepted review has no history: "+str(hid))
  rid=h["restaurant_id"];field=h["field_path"]
  if rid not in byid or field not in EDITABLE: fail("Unsupported restaurant or field")
  if review["restaurant_id"]!=rid or review["field_path"]!=field: fail("Review/history mismatch")
  if not review["review_id"] or not review["reviewer"] or not review["reviewed_at"] or not review["reason"]:
   fail("Accepted review lacks reviewer, date, reason or ID")
  if not h["evidence_id"] or h["evidence_id"] not in evidence: fail("Accepted finding requires existing evidence")
  if evidence[h["evidence_id"]]["restaurant_id"]!=rid: fail("Evidence belongs to another restaurant")
  if not h["researcher"] or not h["recorded_at"]: fail("Finding lacks researcher/date")
  if str(review["reviewer"]).strip().casefold()==str(h["researcher"]).strip().casefold(): fail("Independent reviewer required")
  ev=evidence[h["evidence_id"]]
  if ev["field_path"]!=field: fail("Evidence field mismatch")
  if ev["status"] not in ("unverified","verified_yes"): fail("Evidence status not eligible for approval")
  if (rid,field) in unresolved: fail("Unresolved conflicting evidence or review: "+rid+" "+field)
  if (rid,field) in seen: fail("Multiple accepted edits for same field")
  seen.add((rid,field))
  current=byid[rid].get(field)
  previous=h["previous_value"]
  if previous!=current: fail("Stale previous value: "+rid+" "+field)
  proposed=h["proposed_value"]
  if not isinstance(proposed,str): fail("Proposed value must be text")
  byid[rid][field]=proposed
  changes.append({"restaurant_id":rid,"field":field,"review_id":review["review_id"],"history_id":hid})
 # Validation occurs before writing any output.
 if len({r["id"] for r in data})!=len(data): fail("IDs changed")
 dst.parent.mkdir(parents=True,exist_ok=True)
 dst.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
 print(json.dumps({"candidate":str(dst),"approved_changes":changes},indent=2))
if __name__=="__main__":
 if len(sys.argv)!=4: raise SystemExit(__doc__)
 promote(*sys.argv[1:])
