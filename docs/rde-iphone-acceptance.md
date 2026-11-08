# RDE iPhone acceptance — controlled, local-only

**Status:** Development-only test instructions. No production deployment or merge.

## How to open on iPhone
The consolidated editor is a standalone HTML file at `tools/rde-local-editor.html` on the draft development branch. Download the file from the GitHub development branch, save it in the iPhone Files app, and try opening it in Safari through the Files share sheet. **Important:** iOS may preview HTML instead of running it as a full Safari page; file picker and download behavior may differ by iOS version. If that occurs, record the issue rather than using the production Eatery App URL. A dedicated, isolated HTTPS preview has **not** been deployed.

Use a copy of `data/eateries.json` from the same branch, also saved to Files. The JSON file is **not** uploaded to a server by the editor.

## Five-minute smoke test
1. Open the editor and confirm readable controls without horizontal page scrolling (the data table may scroll horizontally).
2. Tap **Choose restaurant JSON**; load the copied file. Confirm **206 restaurants**.
3. Search for one restaurant. Change its name and verify the status indicates an unapproved draft.
4. Export the **unapproved edit draft**; verify it appears in Files/Downloads. Do **not** publish it.
5. Discard edits; verify the original name returns.
6. Queue one research proposal using a source URL, researcher and reason.
7. Select that proposal in **Review pending proposals**. Try accepting with the same researcher name; verify it is blocked. Enter a different reviewer and reason; record the decision.
8. Export research and review bundles; verify both files appear in Downloads. No production records should change.

## Report results
Record iPhone model, iOS version, browser used, which step failed, and a screenshot if convenient. Do not include private or sensitive information.

## Exit criteria
- 206 valid IDs loaded.
- Controls usable on a phone.
- Local search, edit, discard, and downloads function.
- Self-approval rejected.
- Exports explicitly labeled unapproved/not published.
- No production URL, branch, or data modified.

**Limitations:** The file-based editor is a prototype, not an installed PWA. Safari local-file behavior requires real-device verification. Browser research and review exports still need developer-side controlled workbook processing before any candidate is eligible for publication.
