import useHasStateRehydrated from '@hooks/stores/useHasRehydrated';
import useWalletSelector from '@hooks/useWalletSelector';
import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { Navigate } from 'react-router-dom';

interface WalletExistsGuardProps {
  children: React.ReactElement;
}

type WalletExistsGuardContext = {
  disableWalletExistsGuard?: () => void;
};

const WalletExistsContext = createContext<WalletExistsGuardContext>({});

export const useWalletExistsGuardContext = (): WalletExistsGuardContext => {
  const context = useContext(WalletExistsContext);
  return context;
};

function WalletExistsGuard({ children }: WalletExistsGuardProps): React.ReactElement {
  const [walletExistsGuardEnabled, setWalletExistsGuardEnabled] = useState(true);

  const contextValue: WalletExistsGuardContext = useMemo(
    () => ({
      disableWalletExistsGuard: () => setWalletExistsGuardEnabled(false),
    }),
    [],
  );

  const { encryptedSeed } = useWalletSelector();
  const hydrated = useHasStateRehydrated();

  if (walletExistsGuardEnabled && hydrated && encryptedSeed) {
    return <Navigate to="/wallet-exists" />;
  }

  return (
    <WalletExistsContext.Provider value={contextValue}>{children}</WalletExistsContext.Provider>
  );
}

export default WalletExistsGuard;
