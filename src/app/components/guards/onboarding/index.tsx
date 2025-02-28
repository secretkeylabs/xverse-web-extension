import { useSingleTabGuard } from '@components/guards/singleTab';
import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useAsyncFn from '@hooks/useAsyncFn';
import useVault from '@hooks/useVault';
import { useMemo, useState } from 'react';
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
  const [guardInitialized, setGuardInitialized] = useState(false);
  const vault = useVault();
  const contextValue: WalletExistsContextProps = useMemo(
    () => ({
      disableWalletExistsGuard: () => setWalletExistsGuardEnabled(false),
    }),
    [],
  );

  useAsyncFn(async () => {
    await vault.restoreVault();
    const isVaultInitialised = await vault.isInitialised();
    const isVaultUnlocked = await vault.isVaultUnlocked();
    const isSeedVaultInitialised =
      isVaultInitialised && (!isVaultUnlocked || (await vault.SeedVault.isInitialised()));
    setIsWalletInitialized(isSeedVaultInitialised);
    setGuardInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hydrated = useHasStateRehydrated();
  const loading = !guardInitialized || !hydrated;

  if (loading) {
    // we don't want to render the children until we have determined if the wallet exists
    // eslint-disable-next-line react/jsx-no-useless-fragment -- we need to return a fragment here for react router
    return <></>;
  }

  if (walletExistsGuardEnabled && isWalletInitialized) {
    return <Navigate to="/wallet-exists" />;
  }

  return (
    <WalletExistsContext.Provider value={contextValue}>{children}</WalletExistsContext.Provider>
  );
}

export default OnboardingGuard;

export { useWalletExistsContext };
