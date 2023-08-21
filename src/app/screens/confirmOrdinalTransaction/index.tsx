import AccountHeaderComponent from '@components/accountHeader';
import ConfirmBtcTransactionComponent from '@components/confirmBtcTransactionComponent';
import BottomBar from '@components/tabBar';
import useBtcWalletData from '@hooks/queries/useBtcWalletData';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import { LedgerTransactionType } from '@screens/ledger/confirmLedgerTransaction';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core/types';
import { useMutation } from '@tanstack/react-query';
import { isLedgerAccount } from '@utils/helper';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: '15%',
  marginTop: props.theme.spacing(40),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 400,
  fontSize: 14,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

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
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { selectedAccount } = useWalletSelector();
  const navigate = useNavigate();
  const btcClient = useBtcClient();
  const [recipientAddress, setRecipientAddress] = useState('');
  const location = useLocation();
  const { fee, feePerVByte, signedTxHex, ordinalUtxo, ordinal, isRestoreOrdinalFlow } =
    location.state;

  const {
    isLoading,
    error: txError,
    data: btcTxBroadcastData,
    mutate,
  } = useMutation<BtcTransactionBroadcastResponse, Error, { signedTx: string }>({
    mutationFn: async ({ signedTx }) => btcClient.sendRawTransaction(signedTx),
  });
  const { selectedOrdinal } = useNftDataSelector();
  const { refetch } = useBtcWalletData();
  const [currentFee, setCurrentFee] = useState(fee);
  const [currentFeeRate, setCurrentFeeRate] = useState(feePerVByte);

  useEffect(() => {
    setRecipientAddress(location.state.recipientAddress);
  }, [location]);

  useEffect(() => {
    if (btcTxBroadcastData) {
      navigate('/tx-status', {
        state: {
          txid: btcTxBroadcastData.tx.hash,
          currency: 'BTC',
          error: '',
          isOrdinal: true,
        },
      });
      setTimeout(() => {
        refetch();
      }, 1000);
    }
  }, [btcTxBroadcastData]);

  useEffect(() => {
    if (txError) {
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

  const handleOnConfirmClick = (txHex: string) => {
    if (isLedgerAccount(selectedAccount)) {
      const txType: LedgerTransactionType = 'ORDINALS';
      navigate('/confirm-ledger-tx', {
        state: {
          recipients: [{ address: recipientAddress, amountSats: new BigNumber(ordinalUtxo.value) }],
          type: txType,
          ordinalUtxo,
          feeRateInput: currentFeeRate,
          fee: currentFee,
        },
      });
      return;
    }

    mutate({ signedTx: txHex });
  };

  const handleOnCancelClick = () => {
    navigate(-1);
  };

  const { subscribeToResetUserFlow } = useResetUserFlow();
  useEffect(() => subscribeToResetUserFlow('/confirm-ordinal-tx'), []);

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
          assetDetail={selectedOrdinal?.number.toString()}
          currentFee={currentFee}
          setCurrentFee={setCurrentFee}
          currentFeeRate={currentFeeRate}
          setCurrentFeeRate={setCurrentFeeRate}
          ordinal={ordinal}
          isRestoreOrdinalFlow={isRestoreOrdinalFlow}
        >
          <Container>
            <NftContainer>
              <OrdinalImage inNftSend withoutSizeIncrease ordinal={selectedOrdinal!} />
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
