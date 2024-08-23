# Notify

The `dispatchEvent*()` family of methods are used to notify pages that an event has taken place in the wallet.

Since service workers can't directly communicate with page scripts, the `dispatchEvent*()` methods rely on intermediate code in the content script to relay the event to the page. A page is notified by having a wallet event dispatched on its `window` object.

Some `dispatchEvent*()` methods are permisions aware. Only clients that meet the specified permissions will get notified of the event.

Internally, the `dispatchEvent*()` methods use `chrome.tabs.sendMessage()` to send event data to the content script. Although it is techincally possible send events by calling `chrome.tabs.sendMessage()` directly, it is recommended to use the `dispatchEvent*()` methods so as to keep events easier to maintain.
