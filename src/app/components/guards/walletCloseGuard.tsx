import { useSingleTabGuard } from '@components/guards/singleTab';
import type { PropsWithChildren } from 'react';

/**
 * This guard is used to close any open tabs when the wallet is locked or reset.
 * It should only be rendered at the root of the options page.
 */
function WalletCloseGuard({ children }: PropsWithChildren) {
  useSingleTabGuard('closeWallet', false);

  // fragment is required here because without it, the router thinks there could be more than 1 child node
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}

export default WalletCloseGuard;
