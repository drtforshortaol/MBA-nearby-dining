# RDE private beta — iPhone acceptance script

**Status: testing instructions only. No deployment or publication authorized.**

Use the isolated development copies of `tools/rde-local-editor.html` and `tools/rde-local-reviewer.html`. These are local browser tools, not a released or installed PWA. An iPhone may require a hosted **private test** page to execute local HTML reliably; hosting requires separate approval.

## Test A — Researcher
1. Open the editor in Safari and import the 206-record `data/eateries.json` test copy.
2. Search for a restaurant. Select one editable field, enter a *nonempty* proposed value, a source URL, researcher name and reason.
3. Export the research proposal JSON to Files. Keep the original baseline untouched.
4. Attempt to add a second proposal for the same restaurant and field. Expect rejection.
5. Try importing malformed JSON while edits are pending. Expect existing work to remain.

## Test B — Independent reviewer
1. Open the reviewer, import the research proposal JSON from Files.
2. Confirm the current value, proposed value, evidence source and researcher are readable.
3. Select **pending**, supply reviewer and reason, and export decisions to Files.
4. Reopen the proposal bundle, choose **accepted** using a *different* reviewer, and export decisions.
5. Try replacing the bundle with unexported decisions. Expect a confirmation prompt; cancel and verify the work remains.

## Test C — Developer-controlled pipeline
1. In a development checkout, ingest the proposal into a generated workbook.
2. Ingest the pending decision; verify it does **not** finalize the queue.
3. Ingest the later accepted decision; export to a separate candidate JSON file.
4. Verify candidate ID order/count (206), approved-field-only changes, and unchanged production JSON.
5. Confirm malformed exports, duplicate IDs, blank approved values and production overwrite attempts are blocked.

## Record outcome
- iPhone model/iOS/Safari version:
- Editor import/export: PASS / FAIL / NOT TESTED
- Reviewer import/export: PASS / FAIL / NOT TESTED
- Files download and reopen: PASS / FAIL / NOT TESTED
- Small-screen layout: PASS / FAIL / NOT TESTED
- Offline local availability: PASS / FAIL / NOT TESTED
- Defects and screenshots:
- Tester/date:

**Go/no-go:** All automated workflows on the latest commit must pass, manual iPhone acceptance must be recorded, and the owner must explicitly authorize a separate private beta deployment. Do not merge or modify production.
