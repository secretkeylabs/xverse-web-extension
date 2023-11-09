import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import BottomBar from '@components/tabBar';
import TopRow from '@components/topRow';
import useNftDataSelector from '@hooks/stores/useNftDataSelector';
import useBtcClient from '@hooks/useBtcClient';
import { useResetUserFlow } from '@hooks/useResetUserFlow';
import useSeedVault from '@hooks/useSeedVault';
import useWalletSelector from '@hooks/useWalletSelector';
import { ArrowLeft } from '@phosphor-icons/react';
import {
  ErrorCodes,
  getBtcFiatEquivalent,
  isOrdinalOwnedByAccount,
  ResponseError,
  UTXO,
  validateBtcAddress,
} from '@secretkeylabs/xverse-core';
import {
  SignedBtcTx,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import { useMutation } from '@tanstack/react-query';
import Callout from '@ui-library/callout';
import { StyledHeading, StyledP } from '@ui-library/common.styled';
import { InputFeedback, InputFeedbackProps, isDangerFeedback } from '@ui-library/inputFeedback';
import { isLedgerAccount } from '@utils/helper';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { devices } from 'theme';

const ScrollContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'column',
  ...props.theme.scrollbar,
}));

const Container = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: auto;
  margin-top: ${(props) => props.theme.space.xxs};
  padding: 0 ${(props) => props.theme.space.s};
  justify-content: space-between;
  max-width: 360px;

  @media only screen and ${devices.min.s} {
    flex: initial;
    max-width: 588px;
    border: 1px solid ${(props) => props.theme.colors.elevation3};
    border-radius: ${(props) => props.theme.space.s};
    padding: ${(props) => props.theme.space.l} ${(props) => props.theme.space.m};
    padding-bottom: ${(props) => props.theme.space.xxl};
    margin-top: ${(props) => props.theme.space.xxxxl};
    min-height: 600px;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${(props) => props.theme.space.xxl};
`;

const StyledSendTo = styled(StyledHeading)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

const NextButtonContainer = styled.div((props) => ({
  position: 'sticky',
  bottom: 0,
  paddingBottom: props.theme.spacing(12),
  paddingTop: props.theme.spacing(12),
  backgroundColor: props.theme.colors.elevation0,
}));

const InputGroup = styled.div`
  margin-top: ${(props) => props.theme.spacing(8)}px;
`;

const Label = styled.label((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flex: 1,
}));

const AmountInputContainer = styled.div<{ error: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginTop: props.theme.spacing(4),
  marginBottom: props.theme.spacing(4),
  border: props.error
    ? `1px solid ${props.theme.colors.danger_dark_200}`
    : `1px solid ${props.theme.colors.white_800}`,
  backgroundColor: props.theme.colors.elevation_n1,
  borderRadius: props.theme.radius(1),
  paddingLeft: props.theme.spacing(5),
  paddingRight: props.theme.spacing(5),
  height: 44,
}));

const InputFieldContainer = styled.div(() => ({
  flex: 1,
}));

const InputField = styled.input((props) => ({
  ...props.theme.body_m,
  backgroundColor: 'transparent',
  color: props.theme.colors.white['0'],
  width: '100%',
  border: 'transparent',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(3),
  marginBottom: props.theme.spacing(12),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const StyledCallout = styled(Callout)`
  margin-bottom: ${(props) => props.theme.spacing(14)}px;
`;

const BottomBarContainer = styled.div({
  marginTop: 'auto',
});

const Button = styled.button`
  display: flex;
  background-color: transparent;
  margin-bottom: ${(props) => props.theme.space.l};
`;

function SendOrdinal() {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const navigate = useNavigate();
  const { selectedOrdinal } = useNftDataSelector();
  const btcClient = useBtcClient();
  const location = useLocation();
  const { network, ordinalsAddress, btcAddress, selectedAccount, btcFiatRate } =
    useWalletSelector();
  const { getSeed } = useSeedVault();
  const [ordinalUtxo, setOrdinalUtxo] = useState<UTXO | undefined>(undefined);
  const [recipientAddress, setRecipientAddress] = useState(location.state?.recipientAddress ?? '');
  const [recipientError, setRecipientError] = useState<InputFeedbackProps | null>(null);

  useResetUserFlow('/send-ordinal');

  const isGalleryOpen: boolean = useMemo(() => document.documentElement.clientWidth > 360, []);

  const {
    isLoading,
    data,
    error: txError,
    mutate,
  } = useMutation<SignedBtcTx | undefined, ResponseError, string>({
    mutationFn: async (recipient) => {
      const seedPhrase = await getSeed();
      const addressUtxos = await btcClient.getUnspentUtxos(ordinalsAddress);
      const ordUtxo = addressUtxos.find(
        (utxo) => `${utxo.txid}:${utxo.vout}` === selectedOrdinal?.output,
      );
      setOrdinalUtxo(ordUtxo);
      if (ordUtxo) {
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
    },
  });

  useEffect(() => {
    if (txError) {
      if (Number(txError) === ErrorCodes.InSufficientBalance) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE') });
      } else if (Number(txError) === ErrorCodes.InSufficientBalanceWithTxFee) {
        setRecipientError({ variant: 'danger', message: t('ERRORS.INSUFFICIENT_BALANCE_FEES') });
      } else {
        setRecipientError({ variant: 'danger', message: txError.toString() });
      }
    }
  }, [txError, t]);

  useEffect(() => {
    if (data) {
      navigate(`/confirm-ordinal-tx/${selectedOrdinal?.id}`, {
        state: {
          signedTxHex: data.signedTx,
          recipientAddress,
          fee: data.fee,
          feePerVByte: data.feePerVByte,
          fiatFee: getBtcFiatEquivalent(data.fee, btcFiatRate),
          total: data.total,
          fiatTotal: getBtcFiatEquivalent(data.total, btcFiatRate),
          ordinalUtxo,
        },
      });
    }
  }, [data]);

  const handleBackButtonClick = () => {
    navigate(-1);
  };

  const activeAccountOwnsOrdinal =
    selectedOrdinal && selectedAccount && isOrdinalOwnedByAccount(selectedOrdinal, selectedAccount);

  const validateRecipientAddress = (address: string): boolean => {
    if (!activeAccountOwnsOrdinal) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ORDINAL_NOT_OWNED') });
      return false;
    }
    if (!address) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_REQUIRED') });
      return false;
    }
    if (
      !validateBtcAddress({
        btcAddress: address,
        network: network.type,
      })
    ) {
      setRecipientError({ variant: 'danger', message: t('ERRORS.ADDRESS_INVALID') });
      return false;
    }
    if (address === ordinalsAddress || address === btcAddress) {
      setRecipientError({ variant: 'info', message: t('YOU_ARE_TRANSFERRING_TO_YOURSELF') });
      return true;
    }
    setRecipientError(null);
    return true;
  };

  const onPressNext = async () => {
    if (validateRecipientAddress(recipientAddress)) {
      mutate(recipientAddress);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    validateRecipientAddress(e.target.value);
    setRecipientAddress(e.target.value);
  };

  const isNextEnabled = !isDangerFeedback(recipientError) && !!recipientAddress;
  const year = new Date().getFullYear();

  return (
    <>
      {isGalleryOpen && (
        <AccountHeaderComponent disableMenuOption={isGalleryOpen} disableAccountSwitch />
      )}
      {!isGalleryOpen && <TopRow title="" onClick={handleBackButtonClick} />}
      <ScrollContainer>
        <Container>
          <div>
            {isGalleryOpen && !isLedgerAccount(selectedAccount) && (
              <Button onClick={handleBackButtonClick}>
                <ArrowLeft size={20} color="white" />
              </Button>
            )}
            <StyledSendTo typography="headline_xs" color="white_0">
              {t('SEND_TO')}
            </StyledSendTo>
            <InputGroup>
              <RowContainer>
                <Label>{t('RECIPIENT')}</Label>
              </RowContainer>
              <AmountInputContainer error={isDangerFeedback(recipientError)}>
                <InputFieldContainer>
                  <InputField
                    value={recipientAddress}
                    placeholder={t('ORDINAL_RECIPIENT_PLACEHOLDER')}
                    onChange={handleAddressChange}
                  />
                </InputFieldContainer>
              </AmountInputContainer>
              <ErrorContainer>
                {recipientError && <InputFeedback {...recipientError} />}
              </ErrorContainer>
            </InputGroup>
            <StyledCallout bodyText={t('MAKE_SURE_THE_RECIPIENT')} />
          </div>
          <NextButtonContainer>
            <ActionButton
              text={t('NEXT')}
              disabled={!isNextEnabled}
              processing={isLoading}
              onPress={onPressNext}
            />
          </NextButtonContainer>
        </Container>
        {isGalleryOpen && (
          <FooterContainer>
            <StyledP typography="body_medium_m" color="white_400">
              {t('COPYRIGHT', { year })}
            </StyledP>
          </FooterContainer>
        )}
      </ScrollContainer>
      <BottomBarContainer>{!isGalleryOpen && <BottomBar tab="nft" />}</BottomBarContainer>
    </>
  );
}

export default SendOrdinal;
