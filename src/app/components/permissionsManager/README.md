# Permissions Manager

The Permissions Store is stored in the extension's local storage so as to make it available in all of the extension's environemnts, e.g. the popup and background scripts. When the store is changed, is is persisted to local storage.

The app uses React, and is set up to re-render when the permissions are written to local storage, using `chrome.storage.onChanged.addListener`.

Within the React app, the Permissions Store is kept as a module global with a getter and setters, which allows retrieving its current value when successive operations are performed on it,

```ts
function MyComponent() {
  const { addClient, addPermission } = usePermissions();

  const handler = () => {
    addClient(clientInfo);
    addPermission(permissionInfo);
  };
}
```

Modifications to the store in `addClient()` would not be available in `addPermission()` if the store was read from `useState()`; the app wouldn't have re-rendered yet, and references would be pointing to a stale value. The API could have been designed so as to give users direct access to the store object and expect the object to be passed between functions. However, the current approach was chosen to avoid adding complexity when using permissions.

Given the store is a module global, the app needs to be forcefully re-rendered when it changes. As such, the `PermissionsManager` uses a `renderChildren` method rather than the `children` prop to control rendering.
