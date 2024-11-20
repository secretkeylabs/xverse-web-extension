# Managing concurrent permissions mutations

A mutex is provided for environments where race-conditions could occur when mutating the permissions store. Note that the mutex will only be valid within the code environment it is being used in, i.e., it won't prevent the background service worker and the extension popup from performing mutations at the same time. Given it is extremely improbable for a user to simultaneously trigger two mutation operations in separate environments, this is acceptable for now, and can be revisited if this changes.
