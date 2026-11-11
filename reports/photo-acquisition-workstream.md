# Photo acquisition — storefront-first workstream

**Goal:** Replace generic imagery with recognizable, legally reusable photos of the actual restaurant storefront and entry door. Current database has 208 restaurant records; 198 have no `photo` field. Existing photo fields may include illustrations, not actual storefront photographs.

## Source evaluation and licensing gate

1. Match the restaurant **permanent ID**, name, and current street address before accepting an image. Historical storefront photos must be flagged, not treated as current.
2. Prefer operator-provided images with **explicit reuse permission**; otherwise search Wikimedia Commons for CC0, CC BY, or CC BY-SA media with file-page license and author evidence. A photo appearing on a restaurant website or map listing does **not** establish permission to copy it.
3. Record image source page, creator, license, attribution text, capture date if known, location/entrance confidence, and permission evidence. Reject uncertain rights or mismatched storefronts.
4. Resize to efficient offline WebP, preserve original attribution in data, and run integrity/offline checks. Never hotlink unlicensed images.
5. Prioritize recognizable entrances on Cannery Row and the nearest aquarium visitor routes; shared buildings need suite/floor/door cues.

## Initial candidates for source research

| Restaurant ID | Candidate | What to verify |
| --- | --- | --- |
| MBA-DINE-0002 | Beans of Eden | 711 Cannery Row, Suites A & E; former Starbucks space; visible entrance and sign |
| MBA-DINE-0017 | Paper Wing Theatre & Supper Club | 711 Cannery Row, second floor; entrance/stair/elevator access; event venue |
| MBA-DINE-0078 | The Perfect Crumb Bakery | 650 Lighthouse Ave Suite 100, Pacific Grove; avoid historical Monterey storefront |
| MBA-DINE-0186 | Carl's Jr. (902 Lighthouse) | 902 Lighthouse Avenue; avoid misleading pre-reconstruction imagery while temporarily closed |

**Acceptance:** First 3–5 independently licensed, address-matched storefront/entrance photos integrated with metadata and validated offline. Do not claim photos added until actual image files are committed.
