# RDE browser acceptance — test-only workflow

**Scope:** Draft PR #40, isolated feature branch. No production publishing, merging, or deployment.

## Preparation
1. Obtain the current `data/eateries.json` from this development branch.
2. Open `tools/rde-local-editor.html` locally in a desktop browser; no web hosting or Excel required.
3. Choose the JSON file and confirm **206** records load. Search for a restaurant, edit a text field, export the clearly labeled **unapproved edit draft**, and use **Discard edits** to confirm the original value returns.
4. Choose a restaurant and enter a research proposal with a plausible source URL, researcher, proposed value, and reason. Export **research proposals**. The app's JSON must remain unchanged.
5. In the same editor, select the queued proposal, choose a decision, reviewer, and reason, then export **review decisions**. The researcher cannot accept their own finding. The standalone `tools/rde-local-reviewer.html` remains available as an alternative for a separate reviewer.

## Developer-controlled integration
These commands use local copies and never write to `data/eateries.json`:

```sh
python -m pip install openpyxl
python scripts/rde_workbook.py export data/eateries.json /tmp/rde-baseline.xlsx
python scripts/rde_ingest.py /tmp/rde-baseline.xlsx /path/to/rde-research-proposals-review-only.json /tmp/rde-ingested.xlsx
python scripts/rde_review_ingest.py /tmp/rde-ingested.xlsx /path/to/rde-review-decisions-not-published.json /tmp/rde-reviewed.xlsx
python scripts/rde_approve.py /tmp/rde-reviewed.xlsx data/eateries.json /tmp/rde-candidate.json
node scripts/validate.mjs
```

The approval exporter requires accepted findings, an independent reviewer, and existing evidence; unresolved conflicts block promotion. A candidate JSON file is **not** a deployed release.

## Acceptance checklist
- [ ] 206 restaurant records load; IDs remain unchanged.
- [ ] Search and discard edits work.
- [ ] Local unapproved edit draft downloads without network access and is not treated as approved.
- [ ] Research proposal includes source, author, and reason.
- [ ] Research proposal export is marked not approved.
- [ ] Independent review accepts/rejects/flags conflicts.
- [ ] Self-approval is blocked.
- [ ] Browser review export is marked not published.
- [ ] Pending and rejected proposals do not change candidate data.
- [ ] Accepted reviewed changes modify only the intended field in a separate candidate file.
- [ ] Conflicting review prevents candidate export.
- [ ] No GitHub production branch or deployment changes.

## Known limitations
- Browser editor's **direct edit-draft export** is unapproved and cannot substitute for evidence-backed promotion. Do not publish it.
- Browser screens and integration commands are separate prototypes; there is no unified single-page workflow yet.
- Local files are not automatically saved; keep exported bundles securely.
- Browser smoke tests and GitHub CI are not a substitute for hands-on iPhone usability testing.
- The reviewer currently operates on locally exported research bundles, not a hosted multi-user database.
