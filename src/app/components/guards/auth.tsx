import useSeedVault from '@hooks/useSeedVault';
import useWalletReducer from '@hooks/useWalletReducer';
import useWalletSelector from '@hooks/useWalletSelector';
import Spinner from '@ui-library/spinner';
import { useEffect, type PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const CenterChildContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 600px;
`;

// we only want to initialise this once on load for all instances of this component
// if we add this as a state variable, it will show a loader every time a new instance of the component is created
// which will happen between route changes as the component is unmounted and remounted
const isInitialised = {
  current: false,
};

function AuthGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { encryptedSeed, isUnlocked, accountsList } = useWalletSelector();
  const { loadWallet, lockWallet } = useWalletReducer();
  const seedVault = useSeedVault();

  const restoreSession = async () => {
    const unlocked = await seedVault.isVaultUnlocked();

    if (!unlocked && isUnlocked) {
      // ensure lock state is in sync before proceeding
      await lockWallet();
      return;
    }

    if (encryptedSeed) {
      // this is a legacy seed store. If it exists, we need to migrate
      // it to the new seed vault which happens on login
      navigate('/login');
      return;
    }

    const hasSeedPhrase = await seedVault.hasSeed();
    if (!hasSeedPhrase) {
      // wallet has not been set up yet
      navigate('/landing');
      return;
    }

    try {
      // if we successfully unlock with empty pwd, then the wallet is not set up yet
      await seedVault.unlockVault('');
      navigate('/landing');
      return;
    } catch (e) {
      // no-op - if we can't unlock with empty pwd, then the wallet is set up and we should check if logged in
    }

    try {
      await seedVault.getSeed();
    } catch (error) {
      navigate('/login');
    }

    await loadWallet();
  };

  useEffect(() => {
    restoreSession().finally(() => {
      isInitialised.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  if (!isInitialised.current || !isUnlocked || accountsList.length === 0) {
    return (
      <CenterChildContainer>
        <Spinner size={50} />
      </CenterChildContainer>
    );
  }
  // fragment is required here because without it, the router thinks there could be more than 1 child node
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
