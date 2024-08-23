import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSession from '@hooks/useWalletSession';
import { useLayoutEffect, useState, type ReactNode } from 'react';

interface SessionGuardProps {
  children: ReactNode;
}

function SessionGuard({ children }: SessionGuardProps): ReactNode {
  const { shouldLock, setSessionStartTime } = useWalletSession();
  const { lockWallet } = useWalletReducer();
  const [lockTested, setLockTested] = useState(false);

  useLayoutEffect(() => {
    const tryLock = async () => {
      const sessionEnded = await shouldLock();
      if (sessionEnded) {
        await lockWallet();
      } else {
        setSessionStartTime();
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
