# Image review release gates

The image cleanup workflow is intentionally **manual**. GitHub Actions generates before/after artifacts but does not modify restaurant records, push binary files, or deploy an app.

## Review procedure

1. GitHub repository → Actions → **Photo cleanup review previews** → Run workflow → choose Goodies, Bistro Moulin, or Hula's.
2. Download the resulting before/after ZIP artifact from the completed workflow run (14-day retention).
3. Inspect both images on iPhone. Check that the real storefront, sign and entrance are preserved; check lighting and natural appearance.
4. If accepted, record source, date, adjustments, and reviewer approval. Only then add the derivative to a development branch using a binary-capable upload method.
5. Run existing integrity/offline smoke checks before any release. Never replace the original photograph or overwrite the owner-supplied Goodies JPEG.

## Current status

- Preview generator and manual workflow have been merged, but no workflow execution or edited-image review is confirmed.
- No image has been approved, uploaded, or published by these changes.
- Do not claim the automation itself is a finished image milestone.
