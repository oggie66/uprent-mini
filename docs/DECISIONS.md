# Implementation decisions

Source: https://uprent.notion.site/test-task-uprent-mini

This log records implementation choices, alternatives, relevant risks, and verification. Entries describe actual work; pending items are explicitly marked. All work stays local for the owner to review and submit.

# 0. Setup and scope

- **Problem:** The brief contains two separate repositories. Bun was not installed on the command path, and Mini's frozen lockfile did not match its package manifests.
- **Decision:** Work on both repositories as separate personal Git projects, preserving their original histories in temporary backups. Install each repository's declared Bun version into temporary tooling directories. Reconcile Mini's existing dependencies without adding third-party packages.
- **Alternatives:** Merge the repositories, migrate package managers, or upgrade the application frameworks. These would add unrelated changes and obscure the assessed work.
- **Code style:** Retain Svelte and the existing dot-prefixed Tailwind convention. Prefer small typed modules with named responsibilities and dependency injection at the web/extension boundary.
- **Submission:** Do not create GitHub repositories, push branches, or submit the task. The owner handles publication.

# 1.1. Debug the extension's commute request

- **Problem:** The injected widget calls the API from a content script. That request uses the rental website's origin; the API permits localhost and the extension origin instead. The background worker is empty. The widget also fails to reset loading when its request throws.
- **Decision:** Route a specific commute operation through the extension service worker, with localhost host permission. Return a typed success/error envelope and bound the request duration. Keep the server's origin policy unchanged for this fix.
- **Alternatives:** Allow Pararius in server CORS, disable browser protections, use `no-cors`, or proxy arbitrary URLs. These either violate the brief, do not provide a readable response, or broaden privileged network access unnecessarily.
- **Security:** Validate message operations, payloads, and sender origins. The worker must not accept caller-supplied fetch URLs.
- **Verification:** Implemented; see the detailed verification entries below.
- **Reference:** https://developer.chrome.com/docs/extensions/develop/concepts/network-requests

# 1.2. Reuse the commute widget

- **Problem:** Web and extension contain identical widgets coupled directly to their API transport.
- **Decision:** Place presentation and settings UI in `packages/~ui/components/commute-time`; supply a typed client from each app. Put shared contracts and input validation in `~core`.
- **Alternatives:** Branch on Chrome globals inside the shared component, or retain duplicate widgets. Both make behavior harder to test and extend to other rental platforms.
- **Verification:** Implemented; see the detailed verification entries below.

# 1.3. Style the widget

- **Decision:** Use the existing burgundy palette, dot-prefixed Tailwind utilities, clear address groups, four labeled travel modes, and an explicit label for over-limit durations. Provide empty, loading, retry, and unavailable states. Keep color supplemental to text.
- **Alternatives:** Add a component library or redesign the whole feed. Both exceed the brief; no new packages are needed.
- **Verification:** Completed on desktop and at a 390-pixel viewport.

# 1.4.1. Edit and share destination addresses

- **Decision:** Use extension-backed settings; see 1.4.1.1 for context and alternatives.
- **Behavior:** A native modal with cancel/save, zero to two trimmed addresses, mock address suggestions, removal, keyboard navigation, and focus restoration. Load commutes only when an address has been saved.
- **Security:** Only the configured web-app origin may access extension preferences; rental-page scripts must not be given an arbitrary message bridge.

# 1.4.2. Store travel limits and return per-address results

- **Behavior:** Four global per-mode limits, saved with addresses. Blank means no limit; positive whole minutes otherwise. Generate each address's fake durations independently and return the address with its result. Highlight only values strictly greater than a configured limit.
- **Alternatives:** Per-address limits contradict the brief. Server-side storage would require identity and infrastructure that this local test does not need.
- **Scaling:** One shared preference store per app avoids a listener per card; commute data remains per widget. No API requests until the user asks to load results.
- **Verification:** Implemented; see the detailed verification entries below.

# 0.1. Reliable development and reproducible installs

- **Problem:** macOS Control Center owns port 5000. Running Vite under the pinned Bun version also produced a reproducible `fsevents` assertion during hot reload. The unpinned Git dependency resolved to a newer upstream generator revision on install.
- **Decision:** Use web port 5173 with strict port selection, keep the API on 5002, and run Vite under Node while retaining Bun for the API. Pin the existing generator to its original `141ee6a` revision. Declare the new internal `~core` workspace dependencies explicitly.
- **Alternatives:** Disable a macOS service, silently accept Vite's next free port, upgrade the whole runtime/dependency stack, or follow the generator's upstream HEAD. These add machine-wide effects or make extension origin validation unreliable.
- **Verification:** The web app loads its real property feed; type generation works at the original generator revision. No third-party packages were added.

# 1.1.1. Message boundary and extension lifecycle

- **Decision:** Keep only the storage permission and localhost API host permission. Restrict content scripts to the two supported Pararius origins. The external message handler accepts the exact `http://localhost:5173` origin; it exposes preference operations, not network proxying. Native Chrome messages carry JSON-compatible success/error envelopes.
- **Alternatives:** A generic fetch proxy or a wildcard web-page message bridge would expand access unnecessarily.
- **Decision:** Replace the root-restoration interval with a stable root and a mutation observer. Initialize the Pararius widget only when its target exists; destroy stale instances before remounting after a target or URL change.
- **Scaling:** Reuse one shared preference subscription across feed cards, and release observers/listeners with their lifecycle.
- **Verification:** Unit tests cover trusted origins, forged origins, unsupported operations, external-request restrictions, shared preferences, and network-error replies. Chrome installation and live Pararius verification remain pending owner approval.

# 1.2.1. Async state and component boundaries

- **Decision:** Keep the web/extension wrappers thin. Shared UI depends on `CommuteClient`; transport and persistence live in app adapters. Address changes clear old results and invalidate in-flight responses. Limit-only changes re-evaluate existing results without another network call.
- **Alternatives:** Global Chrome access in shared Svelte components, duplicate state machines, or accepting whichever response arrives last would create coupling and stale-data bugs.
- **Verification:** Browser-tested two widget instances with an isolated in-memory settings adapter and the real API. Both update after saving; results stay specific to each card. This does not substitute for a real Chrome cross-context check.

# 1.3.1. Layout and accessibility

- **Decision:** Use a native dialog for modal focus handling and Escape support. Use a native datalist for suggestions while permitting free-form input. Include visible labels, keyboard focus styles, status/error announcements, and text explaining over-limit values. Let feed cards grow to fit two-address results rather than clipping at a fixed height.
- **Alternatives:** Custom focus traps/autocomplete state machines or a new UI library would add complexity without improving this small form.
- **Verification:** Desktop and 390-pixel mobile browser review; empty preferences disable loading, and saved limits produce explicit per-mode over-limit labels.

# 1.4.1.1. Shared storage decision and save behavior

- **Context:** The owner was offered extension-backed settings or independent web settings with migration. The simpler, brief-aligned option was used after leaving the preference question open while independent work continued.
- **Decision:** `chrome.storage.local` is the single source of truth. Without the extension, the web app shows setup instructions. External ports notify web tabs of changes; extension content scripts use storage change events. A disconnected web port reconnects, and focus refreshes settings.
- **Alternatives:** Per-site localStorage cannot share settings across web and rental origins. Adding a server identity/storage layer is unnecessary for local preferences. A fallback web store creates migration and conflict-resolution requirements.
- **Decision:** Cancel discards modal edits. Save trims addresses, rejects duplicates, allows zero to two addresses, and waits for persistence before closing. Concurrent saves use last-write-wins semantics. Stored data is validated before use rather than silently overwritten.
- **Security:** Addresses stay in the local Chrome profile; supported rental pages can still observe content displayed in their DOM. Cross-device synchronization is outside this task.

# 1.4.2.1. Endpoint contract and validation

- **Decision:** Use `POST /commute/durations` with `{ addresses: string[] }`, returning `{ results: [{ address, durations }] }` inside the existing response envelope. Generate every address's mock times independently. Start all limits unset; accept whole minutes from 1 to 1440 and highlight only strictly greater values. Null durations display as unavailable.
- **Alternatives:** Implicit positional results make mismatches harder to detect; per-address maximums contradict the brief; silently truncating extra addresses hides input errors.
- **Verification:** The real endpoint accepts two addresses and rejects an empty array with HTTP 422. Ten regression tests cover validation, null limits/durations, malformed results, and worker behavior. Browser checks verified independent per-address results and limit labels.

# 1.5. Fix feed cards overlapping after manual review

- **Problem:** The owner's screenshot revealed that the scroll container compressed its flex children to their 200-pixel minimum height. Taller commute panels overflowed into following cards. The photo wrapper also relied on a percentage height without a definite parent height, leaving photos invisible. The earlier component-level verification missed this feed integration defect.
- **Decision:** Disable card shrinking and use a content-sized grid with explicit photo, details, and commute columns. At tablet widths the widget spans the row; on phones all three sections stack. Give photos a minimum height and a mobile aspect ratio, allow titles to wrap, and replace negative mobile feed margins with consistent padding.
- **Alternatives:** A larger fixed card height would fail again for longer addresses or two-address results. Hiding overflow would conceal controls. An inner widget scrollbar would make each listing harder to use.
- **Verification:** Reviewed the actual feed at desktop and 390 × 844 mobile sizes. All 20 mobile widgets remained within their cards and the document width matched the viewport. Photos rendered and cards no longer overlapped. Web ESLint, TypeScript, and Svelte checks passed. This browser has no installed Chrome extension, so these screenshots show the connection-guidance state rather than saved commute results.
- **Evidence:** `docs/screenshots/feed-layout-desktop.png` and `docs/screenshots/feed-layout-mobile.png`.

# 1.6. Preserve property photo proportions as cards grow

- **Problem:** The grid photo background stretched to the full row height and used cover cropping. Loading taller commute results enlarged the photo area and severely cropped landscape images.
- **Decision:** Following the owner's requested behavior, render a semantic image at the column width with automatic height and top alignment. Preserve each source image's natural aspect ratio on desktop and mobile; extra card height stays below the image.
- **Alternatives:** A fixed aspect ratio still crops images with different proportions. A stretched background ties photo presentation to unrelated commute content. Neither matches the requested natural proportions.
- **Verification:** In the actual feed, Vliet 39's 285 × 138 image renders at 200 × 96.84 pixels, aligned exactly with the top of its 220-pixel card. Screenshot: `docs/screenshots/feed-photo-aspect-ratio.png`. Web lint and Svelte/TypeScript checks passed.

# 1.7. Present feed photos as squares with blurred margins

- **Problem:** Natural photo ratios produced inconsistent thumbnail heights. The owner requested uniform squares with blurred margins instead of cropping.
- **Decision:** Use a fixed 200 × 200 pixel frame anchored top-left. Center the full image using object-contain over a scaled, blurred, cover-sized copy of the same image. Portrait photos get side margins; landscape photos get top and bottom margins. The decorative copy has empty alternative text and is hidden from assistive technology.
- **Alternatives:** Cover-only cropping removes parts of the property photo; solid letterboxing lacks the requested visual treatment. Generating separate blurred assets adds storage and processing without a benefit for this local feed.
- **Verification:** Browser screenshot shows portrait and landscape treatments; DOM measurement confirms 200 × 200 pixels with contain sizing. Web lint and Svelte/TypeScript checks pass. Screenshot: `docs/screenshots/feed-square-photos.png`.

# 1.8. Handle unavailable source photos

- **Problem:** Franklin D Rooseveltlaan 12 and Emmy Andriessestraat 502 have stale Funda image URLs. Both source URLs returned HTTP 404; browser images finished loading with zero natural width. Switching to semantic images exposed the browser's broken-image icon and alternative text.
- **Decision:** Replace failed or missing photos with a Photo unavailable label in the same square frame. Track failures by URL so a changed source can load normally. Remove the decorative blurred copy together with the failed foreground image.
- **Alternatives:** Retrying a confirmed 404 cannot restore a missing source file. Substituting unrelated property photos would misrepresent the listing. Recovering original photos requires fresh source data.
- **Verification:** Confirmed both upstream 404 responses, observed the fallback on the real feed, and passed web lint and Svelte/TypeScript checks. Screenshot: `docs/screenshots/feed-photo-unavailable.png`.

# 1.9. Reveal expanded commute results

- **Problem:** Loading results increases widget height, potentially leaving the lower results and controls below the visible area, especially on a rental detail page.
- **Decision:** After a successful user-triggered load, wait for Svelte to render and scroll the widget into view only if its height increased. Use smooth nearest-edge scrolling with a 16-pixel margin, supporting both page scrolling and nested feed containers. Use immediate scrolling for reduced-motion preferences. Widgets taller than the viewport align at the top because showing their whole height is impossible.
- **Alternatives:** Always scrolling to the top moves content unnecessarily; scrolling every widget on shared preference changes would steal the user's position. Scrolling before DOM rendering uses obsolete bounds. Refreshes at unchanged height do not trigger scrolling.
- **Verification:** Full lint/type checks and extension build passed. A temporary shared-widget fixture with two destinations confirmed scrolling inside an overflow container and fully visible expanded bounds. Removed the fixture after testing. Screenshot: `docs/screenshots/commute-scroll-expanded.png`. The rebuilt extension must be reloaded in Chrome to use this change on Pararius.

# 1.10. Match photo corners to the property card

- **Problem:** Only the photo's top-left corner was rounded, leaving the other three square.
- **Decision:** Apply the same `.rounded-md` utility as the property card to all four corners of the photo frame. Existing overflow clipping rounds both the image and its blurred margins together.
- **Alternatives:** Separate radii on each image layer would duplicate styling and could leave the blurred background unclipped.
- **Verification:** Both card and photo frame use `.rounded-md`; `git diff --check` passes. No behavior changed.

# 1.11. Implement the approved map-and-comparison redesign

- **Problem:** The owner selected the split map/results design, requested automatic loading and integrated settings, and rejected highlighting a transport mode that does not change the map.
- **Decision:** Implement the shared white-and-sage design with a detailed, explicitly illustrative map, a house icon, and the selected destination label. A destination selector switches between the two already-loaded results. Container queries place map and rows side by side when the widget itself has enough space, and stack them in narrow feed columns and on mobile. Settings retain the existing shared storage and validation in a matching light dialog.
- **Decision:** Transport rows remain neutral. Only a duration strictly exceeding a configured maximum has danger colors and an explicit over-limit label. Null or absent durations are not marked over-limit.
- **Decision:** Each transport row is a native link opening Google Maps directions in a new tab with explicit property origin, destination, and mode. Cycling maps to Google's `bicycling` parameter. Web cards supply the title and city; Pararius supplies its property heading with presentation prefixes removed. Missing origins disable navigation instead of silently using the user's current location. See https://developers.google.com/maps/documentation/urls/get-started.
- **Security:** Google receives the addresses only when the user follows a directions link. Links use a fixed HTTPS Google Maps origin, URLSearchParams encoding, and noopener/noreferrer. The illustrative map makes no external requests. No new packages or API keys were added.
- **Decision:** Prefilled destinations load once on mount and again only when saved addresses change. Limit-only edits and destination selection do not rerun mock calculations. Stale responses remain ignored. Failed requests expose a retry rather than an automatic retry loop. Automatic loading does not scroll: simultaneous feed-card scrolling would disrupt the page. This supersedes the previous user-triggered load/scroll interaction in section 1.9.
- **Alternatives:** A real embedded route map needs geocoding/routing infrastructure and would imply accuracy the mock endpoint does not provide. A green selected state was removed as explicitly requested. Reloading on every settings notification would cause unnecessary requests and flickering mock times.
- **Scaling:** Each mounted card makes one request for both destinations; a large feed therefore produces one initial request per card. A real routing backend should add visibility scheduling, caching keyed by origin/destination, and concurrency limits before replacing these inexpensive mock responses.
- **Verification:** Thirteen tests (57 assertions) cover existing behavior plus every Google Maps transport parameter, special-character encoding, missing addresses, and English/Dutch title parsing. A temporary component fixture using the real API confirmed automatic loading (one request), destination switching without reloading, red warnings, settings updates without reloading, and automatic reload after an address change (two requests). Mobile at 390 pixels has no horizontal overflow. The fixture was removed. The screenshots show this fixture, not a live Pararius installation.

# 1.12. Reduce loaded widget height in the feed

- **Problem:** The previous 340-pixel feed column forced the full map and four transport rows into a vertical stack, making every loaded property card excessively tall. Isolated wide-widget testing missed the actual feed composition.
- **Decision:** Allocate 540 pixels of the desktop card to the widget so its map and results remain side by side. Shorten the heading, spacing, footer, and map. On narrow cards, use a 120-pixel map and a two-by-two transport grid. Keep property price and area near the title instead of centering them down a tall card. Map labels remain HTML text so reducing the map does not shrink them illegibly.
- **Alternatives:** Clipping or imposing a fixed outer height would hide controls. Removing the map would discard the selected design. Reusing available horizontal space keeps the requested features visible while reducing height.
- **Verification:** A temporary fixture used the actual feed-card markup, real feed data, and auto-loaded real API results. Loaded desktop widgets measure 350 pixels tall at 516 pixels wide. At 390 pixels, the page has no horizontal overflow. Fixture removed after review; screenshot in `docs/screenshots/commute-compact-feed.png`.

# 1.13. Truncate destination selection and inset its chevron

- **Problem:** Long selected addresses were clipped without an ellipsis, and the native dropdown arrow sat against the border.
- **Decision:** Keep the accessible native select, remove its native appearance, apply single-line ellipsis, reserve 40 pixels of right padding, and place the existing chevron icon 12 pixels inside the edge. The decorative icon ignores pointer events; full addresses remain in options and the selected address is available on hover.
- **Alternatives:** Shortening stored addresses would damage directions. A custom dropdown would unnecessarily duplicate native keyboard and accessibility behavior.

# 1.14. Center the dropdown chevron vertically

- **Problem:** Positioning an inline SVG through its text-line wrapper left the visible icon off-center.
- **Decision:** Stretch the noninteractive icon wrapper over the input height and center the block-level SVG with flex alignment. Remove percentage translation and baseline-dependent placement.
- **Alternatives:** A pixel offset would depend on the host page's font and line height.

# 1.15. Simplify widget headings

- **Decision:** At the owner's request, keep only Your commute; remove the origin eyebrow and hide the Destination label visually. Preserve the dropdown's accessible label and the actual origin used in directions links.
- **Alternatives:** Removing the select label entirely would reduce accessibility. A screen-reader-only label retains its purpose without visual repetition.

# 1.16. Let transport rows determine the map height

- **Problem:** A fixed map height made the left column taller than the four transport rows. The owner requested reducing total height, not stretching the rows.
- **Decision:** In the side-by-side layout, the map fills only the remaining space below the destination selector. Position its artwork inside that bounded space so the SVG's intrinsic aspect ratio cannot enlarge the grid. Preserve the compact 120-pixel map in stacked layouts.
- **Alternatives:** Stretching transport rows would align edges but retain the excessive height. A hardcoded subtraction would fail when limits or fonts change row heights.
- **Verification:** Browser fixture measured map and Drive row bottoms at exactly the same coordinate (462 pixels), with the map reduced to 142 pixels tall. Fixture removed after testing. Screenshot: `docs/screenshots/commute-map-aligned.png`.

# 1.17. Move the illustration label onto the map

- **Decision:** Remove the widget footer as requested and place a small Illustration label inside the map's bottom-right corner, reclaiming the footer's height and spacing.
- **Alternatives:** Keeping a separate caption consumes vertical space. An overlay identifies the illustrative map without enlarging the card. Mock-time semantics remain documented in the README and decision log.
