#!/usr/bin/env python3
"""Apply independent browser review decisions to an ingested RDE workbook.
Creates a separate review workbook; never publishes JSON.
Usage: python scripts/rde_review_ingest.py ingested.xlsx review-decisions.json reviewed.xlsx
"""
import json
import sys
from pathlib import Path
from openpyxl import load_workbook

DECISIONS={"pending","accepted","rejected","conflicting","needs_more_evidence"}
def apply(workbook,review_file,destination):
 if Path(workbook).resolve()==Path(destination).resolve(): raise ValueError("Output must be separate workbook")
 data=json.loads(Path(review_file).read_text(encoding="utf-8"))
 if data.get("schema")!="mba-rde-review-decisions-v1" or data.get("publication_status")!="not_published": raise ValueError("Invalid review bundle")
 proposals=data.get("proposals");reviews=data.get("reviews")
 if not isinstance(proposals,list) or not isinstance(reviews,list): raise ValueError("Missing proposals/reviews")
 wb=load_workbook(workbook)
 if data.get("restaurant_count")!=wb["Restaurants"].max_row-1: raise ValueError("Restaurant count mismatch")
 history={r[0]:r for r in list(wb["ResearchHistory"].values)[1:]}
 evidence={r[0]:r for r in list(wb["Evidence"].values)[1:]}
 sources={r[0]:r for r in list(wb["Sources"].values)[1:]}
 queue={}
 for row in wb["ReviewQueue"].iter_rows(min_row=2):
  hid=row[1].value
  if hid in queue: raise ValueError("Duplicate review history: "+str(hid))
  queue[hid]=row
 expected=set()
 for p in proposals:
  if not isinstance(p,dict) or not isinstance(p.get("history_id"),str): raise ValueError("Invalid proposal record")
  hid="INGEST:H:"+str(p["history_id"])
  if hid not in history: raise ValueError("Research history not ingested: "+hid)
  h=history[hid]
  if h[1]!=p["restaurant_id"] or h[2]!=p["field_path"] or h[8]!=p["proposed_value"] or h[7]!=p.get("previous_value"): raise ValueError("Research history mismatch: "+hid)
  if h[3] not in evidence: raise ValueError("Missing linked evidence: "+hid)
  ev=evidence[h[3]]
  source=sources.get(ev[2])
  if not source or ev[1]!=p["restaurant_id"] or ev[3]!=p["field_path"] or ev[4]!=p.get("claim") or source[1]!=p.get("source_url"): raise ValueError("Evidence or source mismatch: "+hid)
  if h[4]!=p.get("recorded_at") or h[5]!=p.get("researcher") or h[6]!=p.get("action") or h[9]!=p.get("disposition"): raise ValueError("Research metadata mismatch: "+hid)
  if hid in expected: raise ValueError("Duplicate proposal in review bundle: "+hid)
  if hid not in queue: raise ValueError("Review queue missing: "+hid)
  expected.add(hid)
 seen=set()
 for review in reviews:
  hid="INGEST:H:"+str(review.get("history_id"))
  if hid not in expected or hid in seen: raise ValueError("Unknown or duplicate reviewed proposal")
  seen.add(hid)
  h=history[hid];row=queue[hid]
  decision=review.get("decision")
  if decision not in DECISIONS: raise ValueError("Unknown review decision")
  if review.get("restaurant_id")!=h[1] or review.get("field_path")!=h[2]: raise ValueError("Review target mismatch")
  if row[4].value!="pending": raise ValueError("Review already finalized")
  reviewer=review.get("reviewer");reason=review.get("reason");date=review.get("reviewed_at")
  if not all(isinstance(x,str) and x.strip() for x in (reviewer,reason,date)): raise ValueError("Reviewer, date, reason required")
  if decision=="accepted" and reviewer.strip().casefold()==str(h[5]).strip().casefold(): raise ValueError("Independent reviewer required")
  row[4].value=decision;row[5].value=reviewer;row[6].value=date;row[7].value=reason
  # ResearchHistory is historical record, not a mutable approval status.
 wb.save(destination)
 print("REVIEWED",len(seen),"decisions; no JSON published")
if __name__=="__main__":
 if len(sys.argv)!=4: raise SystemExit(__doc__)
 apply(*sys.argv[1:])
