import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSecretKey from '@hooks/useSecretKey';
import useWalletSelector from '@hooks/useWalletSelector';

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const { masterPubKey, encryptedSeed } = useWalletSelector();
  const { getSeed, hasSeed } = useSecretKey();
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
  return children;
}

export default AuthGuard;
