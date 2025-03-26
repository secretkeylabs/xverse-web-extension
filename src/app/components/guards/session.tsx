import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import useWalletSession from '@hooks/useWalletSession';
import { useEffect, useState, type ReactNode } from 'react';

let sessionTimeoutTracker: NodeJS.Timeout | undefined;

interface SessionGuardProps {
  children: ReactNode;
}

function SessionGuard({ children }: SessionGuardProps): ReactNode {
  const { shouldLock, setSessionStartTime } = useWalletSession();
  const { lockWallet } = useWalletReducer();
  const { walletLockPeriod } = useWalletSelector();
  const [lockTested, setLockTested] = useState(false);

  useEffect(
    () => {
      // test if we should lock the wallet on first render ( when user first opens the app )
      const testLock = async () => {
        const sessionEnded = await shouldLock();
        if (sessionEnded) {
          await lockWallet();
        } else {
          await setSessionStartTime();
        }
        setLockTested(true);
      };

      testLock();

      // listen for user activity on the body element (most clicks should propagate to the body)
      // and reset the session timer on any activity
      const { body } = document;

      const handleClick = async () => {
        await setSessionStartTime();
      };

      body?.addEventListener('click', handleClick);

      return () => {
        body?.removeEventListener('click', handleClick);
      };
    },
    // we only want to run this once on first render, so dependencies are empty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    // we check if we should lock the wallet every 5 seconds
    sessionTimeoutTracker = setInterval(async () => {
      const sessionEnded = await shouldLock();
      if (sessionEnded) {
        await lockWallet();
      }
    }, 5000);

    return () => {
      clearInterval(sessionTimeoutTracker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletLockPeriod]);

  if (!lockTested) {
    // We display nothing until we know if the session is locked or not
    return null;
  }

  return children;
}

export default SessionGuard;
