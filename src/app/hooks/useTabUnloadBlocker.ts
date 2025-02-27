import { useEffect } from 'react';

/**
 * This hook will halt a tab close/refresh event and show a confirmation dialog to the user.
 * This is useful when the user has unsaved changes and is about to close the tab.
 */
const useTabUnloadBlocker = (isDirty = true) => {
  useEffect(() => {
    if (!isDirty) {
      return;
    }

    const handledUnload = (event: BeforeUnloadEvent) => {
      // Cancel the event as stated by the standard.
      event.preventDefault();
      // Chrome requires returnValue to be set.
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handledUnload);

    return () => {
      window.removeEventListener('beforeunload', handledUnload);
    };
  }, [isDirty]);
};

export default useTabUnloadBlocker;
