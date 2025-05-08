import useSelectedAccount from '@hooks/useSelectedAccount';
import { balanceOf, contractType, STRK_TOKEN_ADDRESS } from '@secretkeylabs/xverse-core';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Layout } from './index.layout';
import type { BalanceLoaderProps, Props } from './types';

function BalanceLoader({ onError, address, ...rest }: BalanceLoaderProps) {
  // TODO: figure out how to manage networks beyond BTC and STX.
  //
  // Related: https://www.notion.so/xverseapp/App-API-Persistent-Reactive-Stores-1ae5520b9dee8061beb3e1b22ff23d00?pvs=4#1ae5520b9dee805ebd73eae199a1ba45

  const {
    isLoading,
    error,
    data: balance,
  } = useQuery({
    queryKey: ['sn-balance', { STRK_TOKEN_ADDRESS, address }],
    queryFn: async () => balanceOf({ tokenAddress: STRK_TOKEN_ADDRESS, address }),
  });

  useEffect(() => {
    if (error) onError(error);
  }, [error, onError]);

  if (isLoading) return null;

  if (!balance) return null;

  return <Layout {...rest} balance={balance} />;
}

function AddressLoader(props: Props) {
  const { onError } = props;
  const account = useSelectedAccount();

  useEffect(() => {
    if (account.accountType !== 'software') {
      onError(new Error('Invalid account type, expected software account.'));
    }
  }, [account, onError]);

  if (account.accountType !== 'software') return null;

  // Support undefined strkAddresses during PoC period.
  if (!account.strkAddresses) return null;

  const { address } = account.strkAddresses[contractType.AX040W0G];
  return <BalanceLoader address={address} {...props} />;
}

export function SelectAmount(props: Props) {
  return <AddressLoader {...props} />;
}
