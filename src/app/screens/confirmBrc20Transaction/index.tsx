import AccountHeaderComponent from '@components/accountHeader';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { LedgerTransactionType } from '@screens/ledger/confirmLedgerTransaction';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import { useMutation } from '@tanstack/react-query';
import { getFeeValuesForBrc20OneStepTransfer } from '@utils/brc20';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ConfirmBrc20TransactionComponent from './confirmBrc20TransactionComponent';

const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  height: 600px;
  width: 360px;
  margin: auto;
`;

const BottomBarContainer = styled.h1((props) => ({
  marginTop: props.theme.spacing(3),
}));

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
});

const NftContainer = styled.div((props) => ({
  maxWidth: 150,
  maxHeight: 150,
  width: '60%',
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  padding: props.theme.spacing(5),
  marginBottom: props.theme.spacing(6),
}));

function ConfirmBrc20Transaction() {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const {
    recipientAddress,
    addressUtxos: nonOrdinalUtxos,
    ticker,
    amount,
    estimatedFees,
    feeRate,
  } = useLocation().state;
  // const { refetch } = useBtcWalletData();

  const { txFee, inscriptionFee, totalFee, btcFee } = getFeeValuesForBrc20OneStepTransfer(
    estimatedFees.valueBreakdown,
  );

  const [currentFeeRate, setCurrentFeeRate] = useState(feeRate);

  // TODO useBrc20EstimateFees hook to recalculate onchange

  const handleOnConfirmClick = () => {
    if (isLedgerAccount(selectedAccount)) {
      // TODO ledger
      return;
    }

    // TODO nav to custom tx screen
    // mutate({ signedTx: txHex });
  };

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/confirm-brc20-tx'), [subscribeToResetUserFlow]);

  return (
    <>
      {isGalleryOpen && (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      )}
      <ScrollContainer>
        <ConfirmBrc20TransactionComponent
          recipients={[{ address: recipientAddress, amountSats: new BigNumber(0) }]}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          currentFeeRate={currentFeeRate}
          setCurrentFeeRate={setCurrentFeeRate}
          transactionFee={txFee}
          inscriptionFee={inscriptionFee}
          totalFee={totalFee}
          btcFee={btcFee}
        />
        {!isGalleryOpen && (
          <BottomBarContainer>
            <BottomBar tab="nft" />
          </BottomBarContainer>
        )}
      </ScrollContainer>
    </>
  );
}
export default ConfirmBrc20Transaction;
