# Release evidence checklist

Do not equate a merged PR with a successful release. Record separate evidence for:

1. JavaScript syntax check results and exit codes.
2. Restaurant JSON parse, unique IDs, expected count, and required fields.
3. Version consistency across app.js, index.html, data/metadata.json, and sw.js.
4. Browser smoke test outcome for search, filters, progressive loading, zoom, and Fit All.
5. Offline test after installation for restaurant details, map geometry, and service-worker cache.
6. GitHub Actions workflow run URL, conclusion, and commit SHA.
7. GitHub Pages deployment URL and published commit.
8. iPhone acceptance tester, date, and observed outcome.

If a check was not executed or evidence is unavailable, mark it **not verified**, never **passed**.
