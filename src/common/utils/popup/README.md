# Popup

Helpers for opening the wallet approval popup and recovering the request payload
inside it.

## Opaque request store (current)

Approval payloads (PSBTs, auth tokens, SuperJSON blobs, etc.) are **not** placed
in the popup URL. Instead:

1. Background calls `createApprovalRequest` (in-memory SW map) and opens the
   popup with only an opaque `?requestId=` (or `#/path?requestId=`).
2. Popup pages call `getPopupPayload` / `usePopupPayload` (modern `openPopup`
   path) or `useApprovalSearchParams` / `getLegacyApprovalParams` (legacy RPC
   hash-query path).
3. The SW answers `GetApprovalRequest` only for trusted
   `chrome-extension://<id>/…` pages — never content scripts.
4. Entries are deleted when the popup window closes (and pruned by TTL).

```ts
// Background
await openPopup({
  path: '/page/to/open/in/popup',
  data: { /* arbitrary */ },
  context: makeContext(port),
});

// Popup
const state = usePopupPayload(dataTypeAsserter);
if (state.status !== 'ready') return null;
const { context, data } = state;
```

Legacy RPC helpers still use `makeSearchParamsWithDefaults`, which stores the
full param map under `kind: 'legacy'` and puts only `requestId` (+ non-sensitive
`origin` / `tabId`) in the URL. Screens should read via
`useApprovalSearchParams`.

## Legacy fallback

`getPopupPayload` still accepts the old `?p=` superqs blob for any in-flight
popups opened before upgrade. New opens never write `p=`.

## Notes

- Get ≠ consume: React remounts may fetch the same `requestId` multiple times.
- Do **not** put PSBTs in `chrome.storage.session` — content scripts hold the
  `storage` permission and could read them.
- Type assertion: parsers (e.g. valibot schemas from sats-connect) restore types
  at the popup boundary.
