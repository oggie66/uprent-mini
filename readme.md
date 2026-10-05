# Uprent Mini

A personal rental-search project maintained by Ognjen Karagunovic, with a web app, Chrome extension, and API.

## Run locally

Use Bun **1.2.7** and Node.js **18+** (Node 24 was used for verification).

```sh
bun install --frozen-lockfile
```

Run these commands in separate terminals from the repository root:

```sh
bun run --cwd apps/server dev
bun run --cwd apps/web dev
bun run --cwd apps/extension dev
```

- Web: **http://localhost:5173**
- API: **http://localhost:5002**
- Extension build: `apps/extension/dist`

Vite runs under Node; the API and package manager use Bun. Port 5173 avoids macOS AirPlay/Control Center's port 5000. Use `localhost`, not `127.0.0.1`, for the web app: the extension validates the exact origin.

## Install the extension

1. Run `bun run --cwd apps/extension build`.
2. Open `chrome://extensions` in Chrome and enable Developer mode.
3. Choose **Load unpacked** and select this project's `apps/extension/dist` directory.
4. Reload the web app and any open Pararius property pages.
5. Open a rental property on `https://www.pararius.com` or `https://www.pararius.nl`.

After rebuilding, reload the extension in Chrome and reload the affected tabs. The fixed manifest public key preserves the extension ID used by the web connection and the existing API origin policy.

## Commute preferences

Choose **Settings** or **Add a destination** in any widget. Save zero, one, or two addresses and optional per-mode travel limits. Suggestions are mock addresses; free-form addresses are accepted. Blank limits mean no limit. Commute estimates load automatically when saved destinations are present and are independently randomized for each address. Choose a destination to view its results. Transport rows open Google Maps directions from the listing address; only over-limit results are highlighted in red. The map is illustrative, not a real route.

Preferences live in `chrome.storage.local` and are shared across the web app and extension in the **same Chrome profile**. The web app requires the extension for commute settings and shows installation guidance when it is unavailable. Settings are local, not synchronized between devices. Concurrent saves use last-write-wins semantics.

The shared widget is in `packages/~ui/components/commute-time`. App adapters supply settings and request transport. To add a rental platform, add its content-script match, trusted origin, and page controller; the widget and worker protocol can be reused.

## Verify

```sh
bun test
bun run lint:all
bun run --cwd apps/web build
bun run --cwd apps/extension build
bun run gen
```

`gen` regenerates the API declarations after server schema changes. Its existing generator dependency is pinned to the original lockfile revision.

- [Task-by-task decisions](docs/DECISIONS.md)
- [Commute bug explanation](docs/BUGFIX.md)
- [Verification record](docs/VERIFICATION.md)

The Gallery task is a separate sibling repository, `uprent-gallery`, using web port 5174 and API port 5003. Nothing has been submitted or pushed to GitHub.
