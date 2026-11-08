#!/usr/bin/env python3
"""Ingest local editor proposals into an RDE workbook, without approval or publication.
Usage: python scripts/rde_ingest.py workbook.xlsx proposals.json review-workbook.xlsx
"""
import json
import sys
from pathlib import Path
from urllib.parse import urlsplit
from openpyxl import load_workbook

FIELDS={"name","address","city","phone","website","hours","cuisine","area"}
def ingest(workbook,proposals_path,destination):
 if Path(workbook).resolve()==Path(destination).resolve():
  raise ValueError("Must write a separate review workbook")
 payload=json.loads(Path(proposals_path).read_text(encoding="utf-8"))
 if payload.get("schema")!="mba-rde-research-proposals-v1" or payload.get("publication_status")!="not_approved":
  raise ValueError("Unsupported or already-approved proposal bundle")
 proposals=payload.get("proposals")
 if not isinstance(proposals,list): raise ValueError("Proposals must be a list")
 wb=load_workbook(workbook)
 restaurants={row[0]:row for row in list(wb["Restaurants"].values)[1:]}
 if payload.get("restaurant_count")!=len(restaurants): raise ValueError("Restaurant count mismatch")
 existing={r[0] for r in list(wb["ResearchHistory"].values)[1:]}
 existing|={r[0] for r in list(wb["Evidence"].values)[1:]}
 existing|={r[0] for r in list(wb["Sources"].values)[1:]}
 existing|={r[0] for r in list(wb["ReviewQueue"].values)[1:]}
 pending=[];newids=set()
 for i,p in enumerate(proposals):
  if not isinstance(p,dict): raise ValueError("Invalid proposal")
  rid=p.get("restaurant_id");field=p.get("field_path")
  if rid not in restaurants or field not in FIELDS: raise ValueError("Unknown restaurant or field")
  url=p.get("source_url")
  try:
   parsed=urlsplit(url) if isinstance(url,str) else None
   valid_url=(parsed is not None and parsed.scheme in ("http","https")
              and bool(parsed.hostname) and parsed.username is None and parsed.password is None
              and url==url.strip() and not any(ch.isspace() for ch in url))
   if valid_url: _=parsed.port  # Reject malformed port syntax.
  except ValueError:
   valid_url=False
  if not valid_url:
   raise ValueError("Invalid source URL")
  if any(not isinstance(p.get(k),str) or not p[k].strip() for k in ("history_id","researcher","recorded_at","claim","proposed_value")):
   raise ValueError("Incomplete research proposal")
  if p.get("disposition")!="pending" or p.get("action")!="propose":
   raise ValueError("Only pending proposals may be imported")
  # Compare with the current workbook projection, not with untrusted browser metadata.
  headers=list(wb["Restaurants"].values)[0]
  current=restaurants[rid][headers.index(field)]
  if p.get("previous_value")!=current:
   raise ValueError("Stale proposal for "+rid+" "+field)
  suffix=str(p["history_id"])
  if len(suffix)>100: raise ValueError("History identifier too long")
  ids=["INGEST:"+kind+":"+suffix for kind in ("SRC","EV","H","REV")]
  if len(set(ids))!=4 or any(x in existing or x in newids for x in ids):
   raise ValueError("Duplicate proposal identifier")
  newids.update(ids)
  pending.append((p,ids))
 for p,(sid,eid,hid,revid) in pending:
  rid=p["restaurant_id"];field=p["field_path"]
  wb["Sources"].append([sid,p["source_url"],None,None,"browser_research"])
  wb["Evidence"].append([eid,rid,sid,field,p["claim"],"unverified",None])
  wb["ResearchHistory"].append([hid,rid,field,eid,p["recorded_at"],p["researcher"],"propose",p["previous_value"],p["proposed_value"],"pending"])
  wb["ReviewQueue"].append([revid,hid,rid,field,"pending",None,None,None])
 wb.save(destination)
 print("INGESTED",len(pending),"pending proposals; no approvals or production changes")
if __name__=="__main__":
 if len(sys.argv)!=4: raise SystemExit(__doc__)
 ingest(*sys.argv[1:])
