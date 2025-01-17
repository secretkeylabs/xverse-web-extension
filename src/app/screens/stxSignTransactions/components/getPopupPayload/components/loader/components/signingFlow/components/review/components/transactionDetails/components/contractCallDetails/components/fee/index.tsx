import { AuthType } from '@stacks/transactions';
import { FeeLoader } from './feeLoader';
import { Sponsored } from './sponsored';
import type { Props } from './types';

function FeeSponsoredCheck(props: Props) {
  const { transaction } = props;

  const isSponsored = transaction.auth.authType === AuthType.Sponsored;
  if (isSponsored) return <Sponsored />;

  return <FeeLoader {...props} />;
}

export function Fee(props: Props) {
  return <FeeSponsoredCheck {...props} />;
}
