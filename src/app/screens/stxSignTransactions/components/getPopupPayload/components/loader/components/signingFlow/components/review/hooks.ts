import { useCallback, useState } from 'react';

/**
 * This hook is used to force a re-render of the component if necessary when
 * Stacks transactions are being manipulated. The issue is that the helpers
 * available from Stacks.js to modify Stacks transactions mutate the transaction
 * object. Mutating keeps its reference unchanged, React does not
 * detect a change and doesn't re-render with the new values.
 */
export function useRender() {
  const [, setState] = useState({});

  return useCallback(() => setState({}), [setState]);
}
