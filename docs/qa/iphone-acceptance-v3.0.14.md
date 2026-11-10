# iPhone acceptance — MBA Nearby Dining v3.0.14

Status: **device checks pending**. GitHub Actions tests do not substitute for on-device verification.

## Guide (normal URL)
- [ ] Open app online; confirm 206 visitor-eligible eateries appear after loading.
- [ ] Search and select a restaurant; Back and Return to Hub work.
- [ ] Add 1–10 restaurants to Share Basket; create one QR code.
- [ ] Scan QR on a separate device or browser; only selected restaurants appear.

## Guest (shared URL)
- [ ] Back, Return to Hub and Share Basket are absent, including after refresh.
- [ ] Restaurant details and Let's Go are available only for shared restaurants.
- [ ] Copy Address works. Guest can view without installing the app.

## Offline (installed guide app)
- [ ] Open app online once to finish service-worker cache installation.
- [ ] Turn on Airplane Mode and disable Wi-Fi; reopen installed app.
- [ ] Restaurant list, search, saved favorites, photos with local assets, and offline street map work.
- [ ] Restore network; verify app remains usable and online status updates.

## Notes
- Basket and favorites are browser-local; opening a different browser context may show a different count. This is not evidence of lost data in the original browser.
- The first screenshot may show the filter panel before the restaurant list finishes rendering; confirm results after scrolling/loading.
- Never mark these device-only checks as passed based on CI or static source review.
