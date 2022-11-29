import useHasStateRehydrated from '@hooks/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const { encryptedSeed, seedPhrase } = useWalletSelector();
  const hydrated = useHasStateRehydrated();
  if (hydrated && encryptedSeed && !seedPhrase) return <Navigate to="/login" />;

  if (hydrated && !encryptedSeed) return <Navigate to="/landing" />;

  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
