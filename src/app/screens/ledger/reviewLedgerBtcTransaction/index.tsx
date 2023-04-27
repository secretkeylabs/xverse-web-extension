import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

import ReviewLedgerBtcTransactionComponent from '@components/ledger/reviewLedgerBtcTransactionComponent';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import BigNumber from 'bignumber.js';
import FullScreenHeader from '@components/ledger/fullScreenHeader';

export type LedgerTransactionType = `BTC` | `ORDINALS` | `STX`;

function ReviewLedgerBtcTransaction() {
  const navigate = useNavigate();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const {
    amount,
    recipient,
  }: { recipientAddress: string; amount: BigNumber; recipient: Recipient } = location.state;

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  const handleOnConfirmClick = async () => {
    const txType: LedgerTransactionType = 'BTC';
    navigate('/confirm-ledger-tx', { state: { amount, recipient, type: txType } });
  };

  const goBackToScreen = () => {
    navigate('/send-btc-ledger', {
      state: {
        amount,
        recipientAddress,
      },
    });
  };
  return (
    <>
      <FullScreenHeader />
      <ReviewLedgerBtcTransactionComponent
        recipients={[recipient]}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
      />
    </>
  );
}

export default ReviewLedgerBtcTransaction;
