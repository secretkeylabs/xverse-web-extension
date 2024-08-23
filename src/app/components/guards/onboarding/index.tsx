import { useSingleTabGuard } from '@components/guards/singleTab';
import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useSeedVault from '@hooks/useSeedVault';
import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  WalletExistsContext,
  useWalletExistsContext,
  type WalletExistsContextProps,
} from './WalletExistsContext';

interface WalletExistsGuardProps {
  children: React.ReactElement;
}

/**
 * This guard is used to redirect the user to the wallet exists page if they have a wallet and ensures
 * that only 1 onboarding workflow tab exists at a time (via the useSingleTabGuard hook).
 */
function OnboardingGuard({ children }: WalletExistsGuardProps): React.ReactElement {
  useSingleTabGuard('onboarding');

  const [walletExistsGuardEnabled, setWalletExistsGuardEnabled] = useState(true);
  const [isWalletInitialized, setIsWalletInitialized] = useState(false);
  const { hasSeed, unlockVault } = useSeedVault();
  const contextValue: WalletExistsContextProps = useMemo(
    () => ({
      disableWalletExistsGuard: () => setWalletExistsGuardEnabled(false),
    }),
    [],
  );
  useEffect(() => {
    (async () => {
      try {
        const hasSeedPhrase = await hasSeed();
        if (!hasSeedPhrase) {
          setIsWalletInitialized(false);
          return;
        }

        unlockVault('');
        setIsWalletInitialized(false);
      } catch (e) {
        // seed exists and unlocking with empty password failed
        setIsWalletInitialized(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hydrated = useHasStateRehydrated();

  if (walletExistsGuardEnabled && hydrated && isWalletInitialized) {
    return <Navigate to="/wallet-exists" />;
  }

  return (
    <WalletExistsContext.Provider value={contextValue}>{children}</WalletExistsContext.Provider>
  );
}

export default OnboardingGuard;

export { useWalletExistsContext };
