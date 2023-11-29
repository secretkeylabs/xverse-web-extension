import { ConfirmOrdinalsTransactionState, LedgerTransactionType } from '@common/types/ledger';
import AccountHeaderComponent from '@components/accountHeader';
import BundleAsset from '@components/bundleAsset/bundleAsset';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import BottomBar from '@components/tabBar';
import { useGetUtxoOrdinalBundle } from '@hooks/queries/ordinals/useAddressRareSats';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useOrdinalDataReducer from '@hooks/stores/useOrdinalReducer';
import useSatBundleDataReducer from '@hooks/stores/useSatBundleReducer';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import { getBundleId, getBundleSubText } from '@utils/rareSats';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

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

function ConfirmOrdinalTransaction() {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
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

  const { selectedOrdinal, selectedSatBundle } = useNftDataSelector();
  const { setSelectedOrdinalDetails } = useOrdinalDataReducer();
  const { setSelectedSatBundleDetails } = useSatBundleDataReducer();
  const { refetch } = useBtcWalletData();
  const [currentFee, setCurrentFee] = useState(fee);
  const [currentFeeRate, setCurrentFeeRate] = useState(feePerVByte);

  const bundleId = isRareSat && selectedSatBundle ? getBundleId(selectedSatBundle) : '';
  const bundleSubText = isRareSat && selectedSatBundle ? getBundleSubText(selectedSatBundle) : '';

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
      setSelectedOrdinalDetails(null);
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
      setSelectedOrdinalDetails(null);
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

  const { isPartOfABundle } = useGetUtxoOrdinalBundle(
    selectedOrdinal?.output,
    hasActivatedRareSatsKey,
  );

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

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  useResetUserFlow('/confirm-ordinal-tx');

  return (
    <>
      {isGalleryOpen && (
        <>
          <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
          {/* <ButtonContainer>
            <Button onClick={handleOnCancelClick}>
              <>
                <ButtonImage src={ArrowLeft} />
                <ButtonText>{t('MOVE_TO_ASSET_DETAIL')}</ButtonText>
              </>
            </Button>
          </ButtonContainer> */}
        </>
      )}
      <ScrollContainer>
        <ConfirmBtcTransactionComponent
          feePerVByte={feePerVByte}
          recipients={[{ address: recipientAddress, amountSats: new BigNumber(0) }]}
          loadingBroadcastedTx={isLoading}
          signedTxHex={signedTxHex}
          onConfirmClick={handleOnConfirmClick}
          onCancelClick={handleOnCancelClick}
          onBackButtonClick={handleOnCancelClick}
          ordinalTxUtxo={ordinalUtxo}
          assetDetail={bundleSubText ?? selectedOrdinal?.number.toString()}
          assetDetailValue={bundleId ?? ''}
          currentFee={currentFee}
          setCurrentFee={setCurrentFee}
          currentFeeRate={currentFeeRate}
          setCurrentFeeRate={setCurrentFeeRate}
          currencyType={isRareSat ? 'RareSat' : 'Ordinal'}
          isPartOfBundle={isPartOfABundle}
        >
          <Container>
            <NftContainer>
              {selectedSatBundle && isRareSat ? (
                <BundleAsset bundle={selectedSatBundle} />
              ) : (
                <OrdinalImage inNftSend withoutSizeIncrease ordinal={selectedOrdinal!} />
              )}
            </NftContainer>
          </Container>
        </ConfirmBtcTransactionComponent>

        {!isGalleryOpen && (
          <BottomBarContainer>
            <BottomBar tab="nft" />
          </BottomBarContainer>
        )}
      </ScrollContainer>
    </>
  );
}
export default ConfirmOrdinalTransaction;
