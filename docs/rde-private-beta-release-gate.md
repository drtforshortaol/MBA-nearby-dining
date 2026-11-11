# RDE private beta — release gate (2026-11-08)

Status: **NOT RELEASED**. Development branch only. This checklist is not deployment authorization.

## Automated acceptance (required)
- [ ] All four GitHub workflows pass on the **latest** development commit.
- [ ] Lossless workbook round trip preserves all 206 restaurant IDs and protected data.
- [ ] Research bundle imports into the workbook without writing `data/eateries.json`.
- [ ] Independent reviewer can leave decisions pending, then accept/reject in a later cycle.
- [ ] Duplicate history, review, evidence and restaurant-field targets are rejected.
- [ ] Blank accepted values, stale previous values, reviewer=self, and conflicting evidence are blocked.
- [ ] Browser research and review JSON exports parse successfully.
- [ ] Candidate export changes only explicitly approved, allowlisted fields.
- [ ] Candidate export never overwrites production data.

## Manual acceptance (required; not yet completed)
- [ ] Open local editor and reviewer on target iPhone in Safari.
- [ ] Import a real 206-restaurant baseline; search, edit and queue a proposal.
- [ ] Confirm source URL, researcher and reason are required.
- [ ] Export proposals, import into reviewer, select a decision, export reviews.
- [ ] Verify the exported files can be reopened and ingested into the workbook.
- [ ] Confirm bad replacement imports preserve unsaved review work.
- [ ] Confirm iPhone Files download/share workflow and readable layout.
- [ ] Confirm offline use of locally saved browser tools (do not assume offline support without device test).

## Release boundaries
- Private beta must be separate from the production Eatery App.
- No automatic publication, merge, deployment or production JSON writes.
- Any release needs explicit owner authorization after acceptance.
- If manual acceptance fails, record the defect and retest before release.
