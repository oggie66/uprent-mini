# Why extension commutes loaded forever

The widget called the API directly from a content script injected into Pararius. Chrome treats that network request as coming from the rental website, not the extension's origin. The server allows the web app and extension origin, so the content-script request could not read its response. A thrown request also bypassed the old widget's loading reset.

The extension now sends a typed commute message to its background service worker. The worker has permission to contact the local API and calls only the known commute endpoint. It validates the sender and payload, then returns either results or an explicit error. Requests have timeouts, and the shared widget always clears loading in `finally`, shows failures, and allows retries.

The fix does not relax server CORS. Later server changes implement the separate requirement to return mock durations for one or two addresses. Shared presentation receives a client adapter, so the web app can use HTTP while the extension uses worker messages.
