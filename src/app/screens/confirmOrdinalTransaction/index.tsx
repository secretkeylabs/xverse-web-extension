import { ConfirmOrdinalsTransactionState, LedgerTransactionType } from '@common/types/ledger';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import useAddressInscription from '@hooks/queries/ordinals/useAddressInscription';
import { useGetUtxoOrdinalBundle } from '@hooks/queries/ordinals/useAddressRareSats';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import SendLayout from '../../layouts/sendLayout';

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

function ConfirmOrdinalTransaction() {
  const { selectedAccount, hasActivatedRareSatsKey } = useWalletSelector();
  const navigate = useNavigate();
  const btcClient = useBtcClient();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();

  // TODO tim: refactor to not use location.state.
  const { feePerVByte, signedTxHex, ordinalUtxo, isRareSat } = location.state;
  // this hack is necessary because the browser back/forward buttons
  // serialize BigNumber objects into plain objects
  let { fee } = location.state;
  if (!BigNumber.isBigNumber(fee)) {
    fee = BigNumber(fee);
  }
  const { id } = useParams();
  const { data: selectedOrdinal } = useAddressInscription(id!);
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();
  const { refetch } = useBtcWalletData();
  const [currentFee, setCurrentFee] = useState(fee);
  const [currentFeeRate, setCurrentFeeRate] = useState(feePerVByte);

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>({
    mutationFn: async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  });

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      setSelectedSatBundleDetails(null);
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
          isRareSat,
          isOrdinal: !isRareSat,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (txError) {
      setSelectedSatBundleDetails(null);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'BTC',
          error: txError.toString(),
          isOrdinal: true,
        },
      });
    }
  }, [txError]);

  const {
    bundle: ordinalBundle,
    isPartOfABundle,
    ordinalSatributes,
  } = useGetUtxoOrdinalBundle(
    selectedOrdinal?.output,
    hasActivatedRareSatsKey,
    selectedOrdinal?.number,
  );

  const holdsRareSats = ordinalSatributes?.length > 0;

  const handleOnConfirmClick = (txHex: string) => {
    if (isLedgerAccount(selectedAccount)) {
      const txType: LedgerTransactionType = 'ORDINALS';
      const state: ConfirmOrdinalsTransactionState = {
        recipients: [{ address: recipientAddress, amountSats: new BigNumber(ordinalUtxo.value) }],
        type: txType,
        ordinalUtxo,
        feeRateInput: currentFeeRate,
        fee: currentFee,
      };

      navigate('/confirm-ledger-tx', { state });
      return;
    }

    mutate({ signedTx: txHex });
  };

  useResetUserFlow('/confirm-ordinal-tx');
  const handleBackButtonClick = () => {
    navigate(-1);
  };
  const hideBackButton = location.key === 'default';

  return (
    <SendLayout
      selectedBottomTab="nft"
      onClickBack={handleBackButtonClick}
      hideBackButton={hideBackButton}
    >
      <ConfirmBtcTransactionComponent
        feePerVByte={feePerVByte}
        recipients={[{ address: recipientAddress, amountSats: new BigNumber(0) }]}
        loadingBroadcastedTx={isLoading}
        signedTxHex={signedTxHex}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleBackButtonClick}
        ordinalTxUtxo={ordinalUtxo}
        assetDetail={selectedOrdinal ? selectedOrdinal.number.toString() : ''}
        currentFee={currentFee}
        setCurrentFee={setCurrentFee}
        currentFeeRate={currentFeeRate}
        setCurrentFeeRate={setCurrentFeeRate}
        currencyType={isRareSat ? 'RareSat' : 'Ordinal'}
        isPartOfBundle={isPartOfABundle}
        ordinalBundle={ordinalBundle}
        holdsRareSats={holdsRareSats}
      >
        {!isRareSat && selectedOrdinal && (
          <Container>
            <NftContainer>
              <OrdinalImage inNftSend withoutSizeIncrease ordinal={selectedOrdinal!} />
            </NftContainer>
          </Container>
        )}
      </ConfirmBtcTransactionComponent>
    </SendLayout>
  );
}
export default ConfirmOrdinalTransaction;
