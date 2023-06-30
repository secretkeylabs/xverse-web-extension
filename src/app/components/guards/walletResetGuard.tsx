import { useSingleTabGuard } from '@components/guards/singleTab';

type WalletResetGuardProps = {
  children?: React.ReactElement | React.ReactElement[];
};

/**
 * This guard is used to close any open tabs when the wallet is reset.
 * It should only be rendered at the root of the options page.
 */
function WalletResetGuard({ children }: WalletResetGuardProps): React.ReactNode {
  useSingleTabGuard('resetWallet', false);

  return children;
}

export default WalletResetGuard;
