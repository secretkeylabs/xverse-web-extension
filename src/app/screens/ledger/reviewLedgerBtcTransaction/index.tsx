import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  broadcastRawBtcOrdinalTransaction,
  broadcastRawBtcTransaction,
} from '@secretkeylabs/xverse-core/api';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useWalletSelector from '@hooks/useWalletSelector';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import styled from 'styled-components';
import { saveTimeForNonOrdinalTransferTransaction } from '@utils/localStorage';
import ReviewLedgerBtcTransactionComponent from '@components/ledger/reviewLedgerBtcTransactionComponent';
import { Recipient } from '@secretkeylabs/xverse-core/transactions/btc';
import BigNumber from 'bignumber.js';

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(5),
}));

function ReviewLedgerBtcTransaction() {
  const navigate = useNavigate();
  const { network, ordinalsAddress } = useWalletSelector();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { refetch } = useBtcWalletData();
  const { amount, recipients }: { amount: BigNumber; recipients: Recipient[] } = location.state;

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  const handleOnConfirmClick = async () => {
    // nav to chrome tab
    await chrome.tabs.create({
      url: chrome.runtime.getURL(
        `options.html#/confirm-ledger-btc-tx?address=${
          recipients[0].address
        }&amount=${recipients[0].amountSats.toNumber()}`
      ),
    });
  };

  const goBackToScreen = () => {
    navigate('/send-btc', {
      state: {
        amount,
        recipientAddress,
      },
    });
  };
  return (
    <>
      <ReviewLedgerBtcTransactionComponent
        recipients={recipients}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={goBackToScreen}
        onBackButtonClick={goBackToScreen}
      />
      <BottomBarContainer>
        <BottomBar tab="dashboard" />
      </BottomBarContainer>
    </>
  );
}

export default ReviewLedgerBtcTransaction;
