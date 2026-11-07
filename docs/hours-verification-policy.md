# Restaurant hours verification

The missing-hours queue is a research queue, not evidence of current opening hours.

For each restaurant, retain the stable MBA-DINE identifier, source URL, source type (official restaurant site preferred), observation date, and exact published hours including day-specific exceptions. Record a verification timestamp separately from any older `reviewed` flag. Do not convert an old review flag into a claim of current verification.

If hours cannot be confirmed from a reliable current source, leave them unknown. If sources disagree, keep the conflicting URLs and mark the entry for manual review. Do not infer hours from nearby businesses or historical listings.

Before publishing an update, check day-of-week ordering, overnight hours, holidays, seasonal changes, and whether the restaurant is permanently closed. Preserve prior evidence for auditability.
