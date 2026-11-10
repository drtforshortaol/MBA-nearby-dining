# MBA Eatery — Production reconciliation checkpoint (2026-11-09)

## Verified repository state

- User confirmed the guest navigation fix worked after PR #41 (v3.0.14).
- Production main: **206 eateries, 206 unique IDs, zero missing coordinates, 7 missing/unverified hours** (simple text heuristic).
- Older qc/integration-20261109: **205 eateries, 205 unique IDs, zero missing coordinates, 81 missing/unverified hours**.
- Production includes MBA-DINE-0236 (Rudolfo's Café), absent from the older branch.
- 94 shared records differ in JSON (including metadata changes).
- GitHub compare: old integration branch 4 commits ahead, 98 behind main.

## Decision

**Do not merge qc/integration-20261109 into production.** Its data is stale and would regress hours and restaurant coverage. Keep production authoritative; the previous integration work is superseded by current main.

## Next milestone

Investigate the remaining seven missing/unverified hours using current official sources. Preserve unknown values where evidence is insufficient. Make new edits only on branches from current main, with explicit regression checks. iPhone offline/share testing remains manual and should not be described as automated.
