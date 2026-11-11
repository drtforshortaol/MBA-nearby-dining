# Image cleanup inventory baseline (2026-11-10)

Total eateries: **208**. No image: **186**. Generic unapproved concept SVGs: **12**. Existing photo candidates: **9**. Other illustration requiring visual review: **1**.

The categories are determined from file paths and metadata; they do **not** prove entrance accuracy, photograph provenance, or visual quality. Existing photo candidates are a better immediate cleanup queue than sourcing 208 new photographs.

## Immediate image-edit queue

1. Review existing real-photo candidates first: Sly's, Fish Hopper, Sardine Factory, Bistro Moulin, Hula's, Goodies, Grotto, Montrio, Rosine's.
2. For each, confirm it actually depicts the restaurant or entrance. If so, preserve the original and create a minimally cleaned derivative; compare before/after on iPhone.
3. Jack's Bao: current image is a rejected generic SVG. Requires an actual source photo before any cleanup.
4. Do not automatically publish or count any generic SVG as a successful realistic illustration.

Run `node scripts/audit-image-assets.cjs` to regenerate machine-readable classification and detect missing referenced files.
