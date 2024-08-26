# Permissions

A "connection request" is a request for permissions.

In the future, clients may be able to specify which permissions they're requesting. For now, there's only a single permission available: `read`ing an account. Since there's only a single permission, no arguments are required.

Permissions are granted per-account. A permissions request is processed in the context of the currently active account. In the future, we may allow changing account prior to granting permissions.

## Technical overview

Permissions store: an object containing a version, and the relationships between clients, resources and permissions. Contains "store" in the name because this object is stored as a whole with `chrome.storage.local`

A mutex is provided for environments where race-conditions could occur when mutating the permissions store. Note that the mutex will only be valid within the code environment it is being used in, i.e., it won't prevent the background service worker and the extension popup from performing mutations at the same time. Given it is extremely improbable for a user to simultaneously trigger two mutation operations in separate environments, this is acceptable for now, and can be revisited if this changes.

The exports available from [`utils.ts`](./utils.ts) can be used to perform all necessary permissions operations. When using them within a reactive context such as a React application, it is necessary to construct reactive helpers to ensure the app is using the latest store data available.
