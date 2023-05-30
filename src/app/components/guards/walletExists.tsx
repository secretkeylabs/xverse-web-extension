import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import { Navigate } from 'react-router-dom';

interface WalletExistsGuardProps {
  children: React.ReactElement;
}

function WalletExistsGuard({ children }: WalletExistsGuardProps): React.ReactElement {
  const { encryptedSeed } = useWalletSelector();
  const hydrated = useHasStateRehydrated();
  if (hydrated && encryptedSeed) return <Navigate to="/wallet-success/exists" />;

  return children;
}

export default WalletExistsGuard;
