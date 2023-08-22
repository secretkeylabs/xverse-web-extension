import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import { Navigate } from 'react-router-dom';

function AuthGuard({ children }: React.PropsWithChildren) {
  const { encryptedSeed, seedPhrase } = useWalletSelector();
  const hydrated = useHasStateRehydrated();

  if (hydrated && encryptedSeed && !seedPhrase) {
    return <Navigate to="/login" />;
  }

  if (hydrated && !encryptedSeed) {
    return <Navigate to="/landing" />;
  }

  // fragment is required here
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default AuthGuard;
