import ArrowLeft from '@assets/img/dashboard/arrow_left.svg';
import AccountHeaderComponent from '@components/accountHeader';
import BundleAsset from '@components/bundleAsset/bundleAsset';
import SendForm from '@components/sendForm';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useWalletSelector from '@hooks/useWalletSelector';
import useSeedVault from '@hooks/useSeedVault';
import { getBtcFiatEquivalent } from '@secretkeylabs/xverse-core/currency';
import {
  SignedBtcTx,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { ErrorCodes, ResponseError, UTXO } from '@secretkeylabs/xverse-core/types';
import { validateBtcAddress } from '@secretkeylabs/xverse-core/wallet';
import { useMutation } from '@tanstack/react-query';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import { isLedgerAccount } from '@utils/helper';
import { getBundleId, getBundleSubText } from '@utils/rareSats';
import { useEffect, useMemo, useState } from 'react';
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
  width: 360px;
  margin: auto;
`;

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  flex: 1,
});

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

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

const BundleAssetContainer = styled.div((props) => ({
  maxHeight: 148,
  width: 148,
  display: 'flex',
  aspectRatio: 1,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
  marginTop: props.theme.spacing(8),
  marginBottom: props.theme.spacing(6),
}));

function SendOrdinal() {
  const { t } = useTranslation('translation');
  const navigate = useNavigate();
  const { selectedSatBundle } = useNftDataSelector();
  const btcClient = useBtcClient();
  const location = useLocation();
  const { network, ordinalsAddress, btcAddress, selectedAccount, btcFiatRate } =
    useWalletSelector();
  const { getSeed } = useSeedVault();
  const [ordinalUtxo, setOrdinalUtxo] = useState<UTXO | undefined>(undefined);
  const [error, setError] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [warning, setWarning] = useState('');
  useResetUserFlow('/send-rare-sat');

  const address: string | undefined = useMemo(
    () => (location.state ? location.state.recipientAddress : undefined),
    [location.state],
  );
  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const signTransaction = async (recipient: string) => {
    const addressUtxos = await btcClient.getUnspentUtxos(ordinalsAddress);
    const ordUtxo = addressUtxos.find(
      (utxo) =>
        `${utxo.txid}:${utxo.vout}` === `${selectedSatBundle?.txid}:${selectedSatBundle?.vout}`,
    );
    setOrdinalUtxo(ordUtxo);
    if (ordUtxo) {
      const seedPhrase = await getSeed();
      const signedTx = await signOrdinalSendTransaction(
        recipient,
        ordUtxo,
        btcAddress,
        Number(selectedAccount?.id),
        seedPhrase,
        network.type,
        [ordUtxo],
      );

      return signedTx;
    }
  };

  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<SignedBtcTx | undefined, ResponseError, string>({
    mutationFn: signTransaction,
  });

  useEffect(() => {
    if (data) {
      navigate(`/confirm-ordinal-tx/${selectedSatBundle?.txid}`, {
        state: {
          signedTxHex: data.signedTx,
          recipientAddress,
          fee: data.fee,
          feePerVByte: data.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
          ordinalUtxo,
          isRareSat: true,
        },
      });
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setError(t('SEND.ERRORS.INSUFFICIENT_BALANCE'));
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setError(t('SEND.ERRORS.INSUFFICIENT_BALANCE_FEES'));
      } else setError(txError.toString());
    }
  }, [txError]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  function validateFields(associatedAddress: string): boolean {
    if (!associatedAddress) {
      setError(t('SEND.ERRORS.ADDRESS_REQUIRED'));
      return false;
    }

    if (!validateBtcAddress({ btcAddress: associatedAddress, network: network.type })) {
      setError(t('SEND.ERRORS.ADDRESS_INVALID'));
      return false;
    }

    return true;
  }

  const onPressNext = async (associatedAddress: string) => {
    setRecipientAddress(associatedAddress);
    if (validateFields(associatedAddress)) {
      mutate(associatedAddress);
    }
  };

  const handleInputChange = (inputAddress: string) => {
    if (inputAddress === ordinalsAddress) {
      return setWarning(t('SEND.YOU_ARE_TRANSFERRING_TO_YOURSELF'));
    }
    setWarning('');
  };

  const heading = selectedSatBundle ? getBundleSubText(selectedSatBundle) : '';
  const subText = selectedSatBundle ? getBundleId(selectedSatBundle) : '';

  return (
    <>
      {isGalleryOpen && (
        <>
          <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
          {!isLedgerAccount(selectedAccount) && (
            <ButtonContainer>
              <Button onClick={handleBackButtonClick}>
                <>
                  <ButtonImage src={ArrowLeft} />
                  <ButtonText>{t('SEND.MOVE_TO_ASSET_DETAIL')}</ButtonText>
                </>
              </Button>
            </ButtonContainer>
          )}
        </>
      )}
      <ScrollContainer>
        {!isGalleryOpen && <TopRow title={t('SEND.SEND')} onClick={handleBackButtonClick} />}
        <SendForm
          processing={isLoading}
          currencyType="Ordinal"
          disableAmountInput
          recepientError={error}
          recipient={address}
          onPressSend={onPressNext}
          onAddressInputChange={handleInputChange}
          warning={warning}
          info={t('SEND.INFO.ADDRESS_SUPPORTS_RARE_SATS')}
          hideMemo
          hideTokenImage
          hideDefaultWarning
        >
          <Container>
            <BundleAssetContainer>
              <BundleAsset bundle={selectedSatBundle!} />
            </BundleAssetContainer>
            <StyledHeading typography="headline_s" color="white_0">
              {heading}
            </StyledHeading>
            <StyledP typography="body_medium_m" color="white_400">
              {subText}
            </StyledP>
          </Container>
        </SendForm>
        <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
      </ScrollContainer>
    </>
  );
}

export default SendOrdinal;
