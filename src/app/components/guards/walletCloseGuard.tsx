import { useSingleTabGuard } from '@components/guards/singleTab';

type WalletCloseGuardProps = {
  children?: React.ReactElement | React.ReactElement[];
};

/**
 * This guard is used to close any open tabs when the wallet is locked or reset.
 * It should only be rendered at the root of the options page.
 */
function WalletCloseGuard({ children }: WalletCloseGuardProps): React.ReactNode {
  useSingleTabGuard('closeWallet', false);

  return children;
}

export default WalletCloseGuard;
