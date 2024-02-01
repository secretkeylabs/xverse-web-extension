import useStxPendingTxData from '@hooks/queries/useStxPendingTxData';
import useNetworkSelector from '@hooks/useNetwork';
import useWalletSelector from '@hooks/useWalletSelector';
import { Spinner } from '@phosphor-icons/react';
import {
  StacksTransaction,
  applyFeeMultiplier,
  buf2hex,
  generateUnsignedStxTokenTransferTransaction,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Props = {
  recipientAddress: string;
  amount: string;
  memo: string;
};

const LoaderContainer = styled.div(() => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
}));

function Step3Confirm({ recipientAddress, amount, memo }: Props) {
  const { stxPublicKey, feeMultipliers } = useWalletSelector();
  const { data: stxPendingTxData } = useStxPendingTxData();
  const selectedNetwork = useNetworkSelector();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const send = async () => {
      const unsignedSendStxTx: StacksTransaction =
        await generateUnsignedStxTokenTransferTransaction(
          recipientAddress,
          amount,
          memo,
          stxPendingTxData?.pendingTransactions ?? [],
          stxPublicKey,
          selectedNetwork,
        );

      // This function directly modifies unsignedSendStxTx lol
      applyFeeMultiplier(unsignedSendStxTx, feeMultipliers);
      setLoading(false);

      navigate('/confirm-stx-tx', {
        state: {
          unsignedTx: buf2hex(unsignedSendStxTx.serialize()),
        },
      });
    };

    send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <LoaderContainer>
        <Spinner size={50} />
      </LoaderContainer>
    );
  }
}
export default Step3Confirm;
