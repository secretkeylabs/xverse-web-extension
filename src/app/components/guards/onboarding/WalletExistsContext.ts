import { createContext, useContext } from 'react';

export type WalletExistsContextProps = {
  disableWalletExistsGuard?: () => void;
};

export const WalletExistsContext = createContext<WalletExistsContextProps>({});

export const useWalletExistsContext = (): WalletExistsContextProps => {
  const context = useContext(WalletExistsContext);
  return context;
};
