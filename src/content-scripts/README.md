# Processing incoming messages

The content script listens for incomming messages using `chrome.runtime.onMessage()`. Messages may be

- wallet events (e.g., account change, network change) or
- RPC responses.

The complete message list and schema definitions see [extensionToContentScript](../common/utils/messages/extensionToContentScript/).

Messages that aren't events are assumed to be RPC responses and are forwarded to the tab using `window.postMessage()`.
