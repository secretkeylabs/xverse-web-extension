import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
}

function AuthGuard({ children }: AuthGuardProps) {
  const { seedPhrase, accountsList } = useWalletSelector();
  const hydrated = useHasStateRehydrated();

  if (hydrated && accountsList.length > 0 && !seedPhrase) return <Navigate to="/login" />;

  if (hydrated && accountsList.length === 0) return <Navigate to="/landing" />;

  return children;
}

export default AuthGuard;
