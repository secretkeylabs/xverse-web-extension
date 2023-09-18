import { PropsWithChildren, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { useDispatch } from 'react-redux';
import { setWalletUnlockedAction } from '@stores/wallet/actions/actionCreators';

function AuthGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { masterPubKey, encryptedSeed, isUnlocked } = useWalletSelector();
  const { getSeed, hasSeed } = useSeedVault();
  const dispatch = useDispatch();

  const tryAuthenticating = async () => {
    try {
      await getSeed();
      dispatch(setWalletUnlockedAction(true));
    } catch (error) {
      navigate('/login');
    }
  };

  const restoreSession = async () => {
    if (encryptedSeed) {
      navigate('/login');
      return;
    }
    const hasSeedPhrase = await hasSeed();
    if (!hasSeedPhrase || !masterPubKey) {
      navigate('/landing');
      return;
    }
    await tryAuthenticating();
  };

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUnlocked]);

  if (!isUnlocked) {
    return null;
  }
  // fragment is required here because without it, the router thinks there could be more than 1 child node
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
