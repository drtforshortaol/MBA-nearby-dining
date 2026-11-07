#!/usr/bin/env python3
"""Build a compact offline road geometry snapshot from Monterey County GIS.

Source: County of Monterey Road_Centerline FeatureServer, layer 0.
No restaurant locations, route estimation, or developer-only data are modified.
Raises on incomplete GIS results rather than publishing invented map geometry.
"""
from __future__ import annotations
import datetime as dt
import json
import math
import pathlib
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "data" / "roads.json"
SERVICE = "https://maps.co.monterey.ca.us/server/rest/services/Transportation/Road_Centerline/FeatureServer/0/query"
# Covers the researched Monterey / Pacific Grove area including Del Monte Center.
WEST, SOUTH, EAST, NORTH = -121.948, 36.579, -121.855, 36.643
DX, DY = .019, .016

def query(bbox: tuple[float, float, float, float]) -> dict:
    params = {
        "where": "1=1",
        "geometry": ",".join(str(n) for n in bbox),
        "geometryType": "esriGeometryEnvelope",
        "inSR": "4326",
        "outSR": "4326",
        "spatialRel": "esriSpatialRelIntersects",
        "outFields": "OBJECTID,FULL_NAME,NAME,SUFFIX,FUNC_CLASS",
        "returnGeometry": "true",
        "maxAllowableOffset": "0.000035",
        "f": "geojson",
        "resultRecordCount": "1900",
    }
    req = urllib.request.Request(
        SERVICE + "?" + urllib.parse.urlencode(params),
        headers={"User-Agent": "MBA-Eatery-OffLineMap/0.2 (public GIS export)"},
    )
    last_exc = None
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=45) as res:
                data = json.load(res)
            if "error" in data:
                raise RuntimeError("County GIS: " + str(data["error"]))
            if data.get("type") != "FeatureCollection":
                raise RuntimeError("County GIS returned unexpected non-GeoJSON payload: " + repr(list(data)[:5]))
            if data.get("exceededTransferLimit") or len(data.get("features", [])) >= 1900:
                raise RuntimeError("County GIS response may be truncated; reduce tile size")
            return data
        except Exception as exc:
            last_exc = exc
            if attempt < 2:
                time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"County GIS request failed: {last_exc}")

def valid_line(coords: list) -> list:
    points = []
    for value in coords:
        if not isinstance(value, (list, tuple)) or len(value) < 2:
            continue
        x, y = value[:2]
        if isinstance(x, (int, float)) and isinstance(y, (int, float)) and -122.2 < x < -121.6 and 36.4 < y < 36.8:
            p = [round(x, 5), round(y, 5)]
            if not points or points[-1] != p:
                points.append(p)
    return points if len(points) >= 2 else []

def main() -> None:
    features = {}
    nx = math.ceil((EAST - WEST) / DX)
    ny = math.ceil((NORTH - SOUTH) / DY)
    for yi in range(ny):
        for xi in range(nx):
            box = (
                round(WEST + xi * DX, 6), round(SOUTH + yi * DY, 6),
                round(min(EAST, WEST + (xi + 1) * DX), 6),
                round(min(NORTH, SOUTH + (yi + 1) * DY), 6),
            )
            result = query(box)
            for feat in result["features"]:
                props = feat.get("properties") or {}
                geom = feat.get("geometry") or {}
                if geom.get("type") == "LineString":
                    lines = [geom.get("coordinates", [])]
                elif geom.get("type") == "MultiLineString":
                    lines = geom.get("coordinates", [])
                else:
                    continue
                name = str(props.get("FULL_NAME") or props.get("NAME") or "").strip()[:70]
                category = str(props.get("FUNC_CLASS") or "")[:30]
                oid = props.get("OBJECTID") or feat.get("id")
                for part_number, line in enumerate(lines):
                    pts = valid_line(line)
                    if not pts:
                        continue
                    key = (str(oid), str(part_number), str(pts[0]), str(pts[-1]))
                    features[key] = {"n": name, "c": category, "p": pts}
            print("GIS tile", xi + 1, yi + 1, "features", len(result["features"]))
    roads = list(features.values())
    named = [r for r in roads if r["n"]]
    distinct = {r["n"].lower() for r in named}
    if len(roads) < 80 or len(distinct) < 12:
        raise RuntimeError(f"Only {len(roads)} roads / {len(distinct)} names: refusing incomplete map")
    # Entirely offline at runtime; all lines are genuine county road-centerline geometry.
    data = {
        "version": 1,
        "generatedUTC": dt.datetime.now(dt.timezone.utc).isoformat(),
        "source": SERVICE,
        "attribution": "Road geometry © County of Monterey GIS; public open data, as-is",
        "bbox": [WEST, SOUTH, EAST, NORTH],
        "features": roads,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("Wrote", OUT, "roads", len(roads), "street names", len(distinct), "bytes", OUT.stat().st_size)

if __name__ == "__main__":
    main()
