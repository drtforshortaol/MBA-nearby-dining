# Restaurant research verification baseline — 2026-11-10

This audit records **existing database labels**, not new verification. Source: `data/eateries.json` on `main` following PR #91. No restaurant website was rechecked for this baseline.

## Structural integrity
- Restaurant records: **206**
- Unique permanent `id` values: **206**
- Records containing `diningDetails`: **206**
- Structural coverage: **206/206 (100%)**

## Existing `diningDetails.status` distribution
| Existing label | Records |
| --- | ---: |
| `verified` | 1 |
| `verified-with-explicit-unknowns` | 7 |
| `partially-verified-existing-research` | 143 |
| `provisional-unverified-existing-record` | 45 |
| `provisional-possibly-closed` | 1 |
| `provisional-reopening-unconfirmed` | 1 |
| `provisional-directory-research` | 8 |
| **Total** | **206** |

**Interpretation:** 55 records have a provisional-prefixed status; 151 have another status, but that does **not** establish current operating status or full factual verification. The database's historical status labels are not a validated field-by-field research-coverage metric. Do not report 151 as newly verified restaurants.

## Next verification work
1. Independently verify operating status, prioritizing The Perfect Crumb Bakery, Carl's Jr. (902 Lighthouse Avenue), Osteria Al Mare, Piccolo, and Parker-Lusseau / Bees Knees.
2. Distinguish restaurant-specific dining hours from bar, takeout, counter, shopping-center, and grocery hours.
3. For each changed fact record source URL, review date, quoted or summarized evidence, scope, and conflict status. Preserve unresolved contradictions.
4. Add a machine-generated research-coverage report only after defining explicit field-level evidence criteria and regression tests.

No customer-facing restaurant facts are changed by this baseline.
