import { StoreState } from '@stores/root/reducer';
import { getEncryptedSeed } from '@utils/localStorage';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode,
}

function AuthGuard({ children }: AuthGuardProps) {
  const encryptedSeedPhrase = getEncryptedSeed();
  const {
    isLocked,
  } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  if (encryptedSeedPhrase && isLocked) return <Navigate to="/login" />;

  if (!encryptedSeedPhrase) return <Navigate to="/landing" />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
