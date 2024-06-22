Queries are being persisted using `@tanstack/react-query-persist-client`. The key files involved are,

- [`src/pages/Popup/index.tsx`](/src/pages/Popup/index.tsx)
- [`src/app/utils/query.ts`](/src/app/utils/query.ts)

When restoring persited data, more advanced data types like maps and sets are incorrectly restored as empty objects. The permissions store uses maps and sets, causing the Connected Apps and Permissions screen to break when using React Query's restored data.

To avoid errors, the component should not use stale data from React Query, which can be avoided with an `isFetching` check while the query function runs. The data returned by the query function is provided by permissions-related utitlites that return data in the expected shape.
