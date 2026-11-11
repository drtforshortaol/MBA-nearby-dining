# Restaurant image cleanup acceptance gate

**Goal:** Start from a real, recognizable restaurant photograph and minimally clean it up. Do not create imaginary buildings or generic SVG storefronts.

## Workflow

1. Locate a real photo of the **current restaurant entrance** (not just a food image). Verify business identity, location, suite, and approximate capture date; record the original source URL and creator if known.
2. Check image-use restrictions. Free/noncommercial distribution alone does not establish permission. Prefer an original photo, openly licensed photo, or other image whose use is authorized. Do not upload third-party source photos to the repository merely because they are visible online.
3. Clean up the **actual photograph**: crop, straighten perspective, correct exposure and color, modestly improve sharpness, and optionally remove distracting transient objects. Preserve genuine signage, doors, windows, architectural features, and wayfinding cues. Never fabricate an entrance.
4. Review **before/after** side by side at iPhone screen size. Reject image if storefront no longer matches source or looks artificial. Preserve source metadata and disclose meaningful alterations.
5. Upload only accepted images to a development branch. Validate file size, app loading, offline caching, alt text, and existing navigation. Production release requires established checks and authorization.

## Acceptance checklist

- [ ] Real source photo obtained, restaurant and entrance confirmed
- [ ] Image-use status assessed and recorded
- [ ] Actual architecture, entrance, signage and location preserved
- [ ] Only modest cleanup; no cartoon or invented storefront
- [ ] Before/after comparison reviewed on iPhone
- [ ] Offline loading and photo zoom tested
- [ ] Source, creator, modifications and review status recorded

**Pilot:** Jack's Bao (MBA-DINE-0012). **Blocker:** no actual source photograph has yet been supplied or obtained for editing. Do not mark as complete or substitute a generated image.

**Legacy assets:** Previously generated generic SVG concepts in main failed visual acceptance. Treat them as unapproved placeholders; do not count them as successful realistic images. Retire or replace them through a separately tested change.
