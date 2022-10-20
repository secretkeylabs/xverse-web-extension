import { StoreState } from '@stores/index';
import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode,
}

function AuthGuard({ children }: AuthGuardProps) {
  const {
    encryptedSeed,
    seedPhrase,
  } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));

  if (encryptedSeed && !seedPhrase) return <Navigate to="/login" />;

  if (!encryptedSeed) return <Navigate to="/landing" />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
