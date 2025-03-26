import useVault from '@hooks/useVault';
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
  const { encryptedSeed, isUnlocked, softwareWallets, network } = useWalletSelector();
  const { loadWallet, lockWallet } = useWalletReducer();
  const vault = useVault();

  const restoreSession = async () => {
    const unlocked = await vault.isVaultUnlocked();

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

    const vaultIsInitialised = await vault.isInitialised();
    if (!vaultIsInitialised) {
      // wallet has not been set up yet
      navigate('/landing');
      return;
    }

    if (!unlocked) {
      navigate('/login');
      return;
    }

    try {
      await vault.restoreVault();
      const walletCount = await vault.SeedVault.getWalletCount();
      // TODO multiwallet: In future with multi wallet, if no wallets found, navigate to add wallet page
    } catch (error) {
      console.error(error);
      // seed vault access failed, we need to re-authenticate
      navigate('/login');
      return;
    }

    if (!isInitialised.current) {
      await loadWallet(() => {
        isInitialised.current = true;
      });
    }
  };

  useEffect(() => {
    restoreSession().finally(() => {
      isInitialised.current = true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  if (!isInitialised.current || !isUnlocked || softwareWallets[network.type].length === 0) {
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
