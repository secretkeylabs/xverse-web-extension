# Permissions

A "connection request" is a request for permissions.

In the future, clients may be able to specify which permissions they're requestion. For now, there's only a single permission available: reading account balances and addresses. Since there's only a single permission, no arguments are required.

Permissions are granted per-account. A permissions request is processed in the context of the currently active account. In the future, may allow changing account prior to granting permissions.

Actions involving permissions are performed against the current account.
