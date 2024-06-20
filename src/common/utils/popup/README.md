# Popup

This module contains helpers that facilitate sending arbitrary data when opening a wallet popup, and reading the sent data within the popup. The concept of "sending data" to a popup is not native extension feature, and therefore need to establish a convention for it.

The chosen convention is to send data in the querystring. The helpers ensure data is written to and read from the query string in a consistent way.

Using the querystring to pass data introduces a type assertion boundary. Type information is lost when data is read on the popup side, and must be asserted to be of the expected type.

A type assertion function can be used in conjunction with the helpers provided to restore types and ensure data is of the expected type at runtime. See the example below:

```ts
// In background script code.
openPopup({
  path: '/page/to/open/in/popup',
  data: {
    /* Arbitrary data sent to the popup. Any JS value. */
  },
  // Contains extension connection data the popup often needs to interact with
  // the tab that requested.
  context: makeContext(port),
});

// In popup code.
const [error, payload] = getPopupPayload(dataTypeAsserter);
if (error) {
  // Handle error.
}

const { context, data } = payload; // `data` is typed as per `dataTypeAsserter`.
```

The `dataTypeAsserter` used above is any function that asserts `data` is of the desired type, and throws an error otherwise. Asserters for requests by Sats Connect can be found in [`sats-connect-core`](https://github.com/secretkeylabs/sats-connect-core/tree/main/src/request/types).

Notably, the `openPopup` helper

- notifies the popup when the origin tab is closed, and
- cleans up event handlers.
