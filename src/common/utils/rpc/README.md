# RPC message validation across contexts

Incoming RPC request messages are validated with Valibot. The validation process can perform both structural checks (does the data have the right shape & types?) and logical checks (are the values sound?).

The messages are checked prior to handing them off to the message handlers. The handlers may conclude the request flow by responding themselves, or may forward the message to other parts of the app. When the message is forwarded to other parts of the app across a context boundary (such as from the background script to the popup), validation information is lost.

Although repetitive, until a better solution is found, messages need to be validated each time they cross a context boundary to ensure they are valid and their types inferred correctly. Given the messages are typically small, the added overhead seems worth the stability multiple validations provide.
