import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import { Navigate } from 'react-router-dom';

interface WalletExistsGuardProps {
  children: React.ReactElement;
}

function WalletExistsGuard({ children }: WalletExistsGuardProps): React.ReactElement {
  const { encryptedSeed, walletExistsGuardEnabled } = useWalletSelector();
  const hydrated = useHasStateRehydrated();

  if (walletExistsGuardEnabled && hydrated && encryptedSeed) {
    return <Navigate to="/wallet-exists" />;
  }

  return children;
}

export default WalletExistsGuard;
