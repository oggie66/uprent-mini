# Verification

## Automated and local checks

- `bun test`: 10 focused commute/protocol tests passed.
- Real API: two-address POST returns independent, labeled results; an empty array returns HTTP 422.
- API declarations regenerated using the original pinned generator revision.
- `bun run lint:all`: passed: app TypeScript, ESLint, and Svelte checks report no errors or warnings.
- Both web and extension production builds passed after removing the temporary fixture route.

## Browser checks

- Real web feed loads and displays clear extension setup guidance without Chrome integration.
- Temporary component fixture used the shared widget, an in-memory settings adapter, and the real API.
- Verified zero-address disabled state, adding two addresses, setting limits, saving across two widget instances, per-address results, over-limit labels, and responsive rendering at 390 pixels.
- Screenshots in `screenshots/` show the shared component fixture, not a live Pararius installation.
- Temporary browser fixture routes are removed before handoff.

## Still requires Chrome approval

The unpacked extension has not been installed in the user's Chrome profile. Browser automation requires approval before granting a newly loaded extension site access; approval was requested and has not been received.

After loading the extension, verify a live Pararius rental page, saved preferences shared in both directions with `http://localhost:5173`, reload persistence, worker restart, and API-offline recovery. These checks must not be represented as completed by the unit tests or component fixture.

## Approved redesign follow-up

- 13 tests / 57 assertions pass, including Google Maps URL modes and listing origin parsing.
- Real-API shared-widget fixture verified initial auto-loading, settings, strict red over-limit warnings, two-destination switching without another request, and address-change reloads. No selected green transport state remains.
- Desktop and 390-pixel mobile screenshots: `screenshots/commute-redesign-desktop.png`, `screenshots/commute-redesign-mobile.png`, and `screenshots/commute-redesign-settings.png`.
- Directions link URLs were inspected for origin, destination and transport mode; no real trip was initiated. Live Pararius behavior after extension reload remains for manual verification.
