import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSession from '@hooks/useWalletSession';
import { ReactElement, useLayoutEffect, useState } from 'react';

interface SessionGuardProps {
  children: ReactElement;
}

function SessionGuard({ children }: SessionGuardProps): ReactElement | null {
  const { shouldLock, clearSessionKey } = useWalletSession();
  const { lockWallet } = useWalletReducer();
  const [lockTested, setLockTested] = useState(false);

  useLayoutEffect(() => {
    const tryLock = async () => {
      const sessionEnded = await shouldLock();
      if (sessionEnded) {
        await clearSessionKey();
        lockWallet();
      }
      setLockTested(true);
    };

    tryLock();
  }, []);

  if (!lockTested) {
    // We display nothing until we know if the session is locked or not
    return null;
  }

  return children;
}

export default SessionGuard;
