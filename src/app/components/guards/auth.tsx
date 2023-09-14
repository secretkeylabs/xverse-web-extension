import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';

function AuthGuard({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const { masterPubKey, encryptedSeed } = useWalletSelector();
  const { getSeed, hasSeed } = useSeedVault();
  const [authTested, setAuthTested] = useState(false);

  const restoreSession = async () => {
    if (encryptedSeed) {
      navigate('/login');
      setAuthTested(true);
      return;
    }
    const hasSeedPhrase = await hasSeed();
    if (!hasSeedPhrase || !masterPubKey) {
      navigate('/landing');
      setAuthTested(true);
      return;
    }
    try {
      await getSeed();
      setAuthTested(true);
    } catch (error) {
      navigate('/login');
    }
    setAuthTested(true);
  };

  useEffect(() => {
    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!authTested) {
    return null;
  }
  // fragment is required here because without it, the router thinks there could be more than 1 child node
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
