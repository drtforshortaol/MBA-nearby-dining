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

## Device evidence update — 2026-11-09, app v3.0.15

Owner-supplied iPhone screenshots show the following **observed passes**:

- Guide: 206 visitor-eligible eateries displayed, filters and restaurant cards present, 10 restaurants retained in basket.
- Sharing: guide generated a QR and copied a share link containing 10 restaurant identifiers; link sent through iOS Messages.
- Guest: recipient opened link without installation and saw **Dining suggestions (10)** with no guide Back, Return to Hub, or Share Basket controls. Guest screenshot footer displayed v3.0.14, likely an older cached client; the guest behavior itself passed.
- Offline: Airplane Mode with Wi-Fi off, guide app v3.0.15 showed **Offline · cached content**, 206 eateries, restaurant image, details/hours, and a rendered offline street map with aquarium and restaurant markers.

**Not directly proven by screenshots:** a full cold-start offline reload after force-quitting Safari; scanning the QR with a camera (link delivery was demonstrated); every filter interaction; every map zoom control; offline generation of a *new* QR; guest offline on a previously uncached device. Do not claim those as verified.

**Follow-up:** Guest client version should be checked after refresh while online; v3.0.14 guest screenshot is not evidence that v3.0.15 failed deployment. Production guide screenshot confirmed v3.0.15.
