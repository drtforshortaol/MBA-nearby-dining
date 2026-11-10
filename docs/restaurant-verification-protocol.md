# Restaurant research and verification protocol (non-photo phase)

Scope: 206 visitor-eligible records. Keep the approved app and production data unchanged until reviewed batches pass validation. Do not research or add photos during this phase.

## Parallel workstreams
- **A — Coverage audit and queue:** run `node scripts/audit-data-gaps.cjs --csv` after the audit branch is merged. Partition by stable `MBA-DINE-` identifiers into non-overlapping batches of 10–20. Maintain one owner per record and avoid concurrent edits to `data/eateries.json`.
- **B — Source verification:** research the highest-priority batches independently. Use operator websites first for hours, menu, phone, location and amenities; then official visitor bureaus; third-party listings are provisional unless corroborated. Record the exact source URL, access date, field, and any conflicts.
- **C — Quality review:** review staged findings separately from collection. Only verified evidence may become verified attributes. Conflicting or missing information stays explicitly unknown; never infer hours, price, wheelchair access, entertainment or ocean views from cuisine or neighboring venues.

## Research ledger
For each proposed change, record: `id`, `field`, `currentValue`, `proposedValue`, `sourceUrl`, `checkedOn`, `evidenceStatus` (verified / provisional / conflicting / unknown), `reviewer`, `reviewStatus`, and `notes`. A proposal is **not** a production fact. Preserve existing source history and permanent IDs.

## Batch acceptance
1. No restaurant added, removed, or renumbered.
2. No invented values, placeholder facts, or unverifiable source URLs.
3. No downgrade of previously verified data without documented conflicting evidence.
4. Check official-site and menu links, avoid copying copyrighted descriptions verbatim.
5. Run all existing repository integrity, guest/offline, and release tests.
6. Merge reviewed, independent batches sequentially. Rebase before merge; keep photos on hold.
7. Report **verified fields added**, **unknowns remaining**, and **disputed findings**, not merely records touched.

## Efficiency rule
Collect evidence in parallel; integrate serially to avoid conflicting writes to the single JSON file. Prioritize visitor-facing essentials (hours, phone, website, menu) before secondary amenities. Stop a lookup when the source is insufficient and record the gap rather than guessing.
