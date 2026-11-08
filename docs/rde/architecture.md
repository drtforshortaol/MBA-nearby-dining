# Research Data Engine — MBA Eatery Adapter (Draft 1)
Date: 2026-11-08. This is an additive design; production app and data remain unchanged.

## Observed baseline
- 206 unique permanent MBA-DINE IDs in data/eateries.json; preserve original IDs and all original keys.
- 206 rows have fields such as name, address, cuisine, lat/lon, hours, photo, website and batchReview.
- Nested attributes on 3 records, diningDetails on 1; menuUrl on 40; hoursEvidence on 47.
- Blank/null counts in current JSON: photo 197, menuUrl 166, phone 9, hours 7, website 7.
- **Missing photo is not the same as unverified photo.** Some photo references may be illustrations.
- Existing app.js consumes data/eateries.json; app version and cache are coordinated with index.html, sw.js, and metadata.json.
- Existing scripts/validate.mjs checks 206 records and core runtime invariants.
- Draft PRs #36 (audit), #37 (editor prototype), #38 (import preflight) are unmerged starting points, not yet RDE implementations.

## Relational worksheets (stable primary keys, references by ID)
| Worksheet | Key | Foreign key | Core columns |
|---|---|---|---|
| Restaurants | restaurant_id | — | name, address, city, lat, lon, phone, website, area, lifecycle_status |
| Categories | category_id | — | dimension, label, active |
| RestaurantCategories | restaurant_id + category_id | both | classification_status, evidence_id |
| Features | restaurant_id + feature_key | Restaurants | value (yes/no/unknown/not_applicable), verification_status, evidence_id, reviewed_on |
| Hours | hours_id | Restaurants | day_or_exception, opening, closing, text, status, evidence_id, reviewed_on |
| Menus | menu_id | Restaurants | menu_url, description, price_tier, status, evidence_id, reviewed_on |
| Media | media_id | Restaurants | file_ref, kind, license, creator, caption, is_verified_storefront, evidence_id |
| Sources | source_id | — | url, publisher, accessed_on, source_type, snapshot_ref |
| Evidence | evidence_id | Restaurants + Sources | field_path, claim, status, reviewed_on, conflict_group |
| ResearchStatus | restaurant_id + section | Restaurants | status, missing_reason, last_researched, next_review |
| Relationships | relationship_id | Restaurants | target_restaurant_id, relation_type, note |
| LegacyFields | restaurant_id | Restaurants | raw_json_payload, original_hash |

The LegacyFields table (or lossless equivalent) is mandatory during migration: do not silently discard legacy keys, nested structures, photos, evidence, or presentation data.

## Status semantics
- unknown = not established; verified_no = evidence-supported negative; not_applicable = field does not apply.
- Separate researched_no_result from not_yet_researched; distinguish conflicting evidence from stale verification.
- A claim is not verified merely because a URL is present. Keep source, review date, and confidence/status.
- Preserve conflicting claims as distinct Evidence rows until resolved; do not overwrite verified values with unverified values.

## Single-authority workflow
GitHub-versioned canonical RDE workbook + source/evidence records → deterministic validation → generated application-specific JSON → existing PWA. JSON remains a delivery artifact. No simultaneous independent editing of workbook and generated JSON after cutover. Before cutover, existing JSON remains canonical.

## Implementation gates
1. Pin baseline commit SHA and retain unmodified JSON/media refs; record file hashes.
2. Export current JSON losslessly into linked tables and legacy payload.
3. Round-trip to JSON and compare every record and nested value (canonical semantic equality).
4. Build Excel workbook with worksheet filters, bulk edits, immutable IDs, and field status controls.
5. Implement reusable core validators and Eatery-specific schema/adapters.
6. Produce completeness and source/conflict reports, with refresh dates.
7. Generate JSON into a staging location; validate against existing app and offline behavior.
8. Review PR and CI; only then authorize migration of editing authority.
9. Extend schema adapters to Hub V2/EVO later; **no changes to those apps now**.

## Research session protocol
For each restaurant: inspect available primary sources once per session; capture all relevant facts, media metadata, provenance, conflicts, unknowns, and verification dates across worksheets. Retain a source/session log. Schedule targeted refreshes rather than repeating full research. Never claim website data was retrieved unless it was.
