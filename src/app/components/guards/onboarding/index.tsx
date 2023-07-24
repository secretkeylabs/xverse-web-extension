import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { useSingleTabGuard } from '@components/guards/singleTab';
import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';

import {
  WalletExistsContext,
  WalletExistsContextProps,
  useWalletExistsContext,
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

  const contextValue: WalletExistsContextProps = useMemo(
    () => ({
      disableWalletExistsGuard: () => setWalletExistsGuardEnabled(false),
    }),
    [],
  );

  const { encryptedSeed } = useWalletSelector();
  const hydrated = useHasStateRehydrated();

  if (walletExistsGuardEnabled && hydrated && encryptedSeed) {
    return <Navigate to="/wallet-exists" />;
  }

  return (
    <WalletExistsContext.Provider value={contextValue}>{children}</WalletExistsContext.Provider>
  );
}

export default OnboardingGuard;

export { useWalletExistsContext };
