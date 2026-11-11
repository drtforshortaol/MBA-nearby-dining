# Restaurant Research Readiness

This report is generated from the canonical `data/eateries.json`. It does **not** verify operating status, hours, websites, or phone numbers against live sources.

Run `node scripts/research-readiness.mjs` to see the current JSON report, including research status categories, missing fields, duplicate identifiers, and the ranked research queue.

Run `node scripts/research-readiness.mjs --write` to write `reports/research-readiness.json` for other tools.

Run `node scripts/research-readiness.mjs --csv` to view the priority queue as spreadsheet-compatible CSV. Add `--write` to save it to `reports/research-priority.csv` for review in Excel or other spreadsheet software. This is a research queue, not an assertion of verified business details.\n\n## Priority policy

1. Confirm restaurants marked possibly closed or reopening unconfirmed before recommending them.
2. Research missing hours and contact information.
3. Add verifiable official websites and provenance when available.
4. Review provisional records individually. Never mark a record verified solely because a field is present.

Preserve permanent restaurant IDs. Do not replace unknown values with guesses. Any verified changes should retain source, date, and uncertainty.
