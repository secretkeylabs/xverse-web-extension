import ActionButton from '@components/button';
import useSignPsbtTx from '@hooks/useSignPsbtTx';
import useWalletSelector from '@hooks/useWalletSelector';
import { parsePsbt } from '@secretkeylabs/xverse-core/transactions/psbt';
import { useTranslation } from 'react-i18next';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import styled from 'styled-components';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import InputOutputComponent from '@components/confirmBtcTransactionComponent/inputOutputComponent';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import AccountHeaderComponent from '@components/accountHeader';
import BtcRecipientComponent from '@components/confirmBtcTransactionComponent/btcRecipientComponent';
import { useNavigate } from 'react-router-dom';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
  marginBottom: props.theme.spacing(20),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: 'left',
}));

function SignPsbtRequest() {
  const {
    btcAddress, ordinalsAddress, selectedAccount, network, btcFiatRate,
  } = useWalletSelector();
  const navigate = useNavigate();
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const [expandInputOutputView, setExpandInputOutputView] = useState(false);
  const { payload, confirmSignPsbt } = useSignPsbtTx();
  const parsedPsbt = parsePsbt(
    selectedAccount!,
    payload.inputsToSign,
    payload.psbtBase64,
  );
  const checkIfMismatch = () => {
    if (payload.network.type !== network.type) {
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: t('NETWORK_MISMATCH'),
          browserTx: true,
        },
      });
    }
    if (payload.inputsToSign) {
      payload.inputsToSign.forEach((input) => {
        if (input.address !== btcAddress && input.address !== ordinalsAddress) {
          navigate('/tx-status', {
            state: {
              txid: '',
              currency: 'STX',
              error: t('ADDRESS_MISMATCH'),
              browserTx: true,
            },
          });
        }
      });
    }
  };

  useEffect(() => {
    checkIfMismatch();
  }, []);

  const onSignPsbtConfirmed = async () => {
    await confirmSignPsbt();
    window.close();
  };

  const onCancelClick = async () => {
    window.close();
  };

  const expandInputOutputSection = () => {
    setExpandInputOutputView(!expandInputOutputView);
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <OuterContainer>
        <Container>
          <ReviewTransactionText>
            {t('REVIEW_TRNSACTION')}
          </ReviewTransactionText>
          <BtcRecipientComponent
            value={`${satsToBtc(new BigNumber(parsedPsbt?.netAmount)).toString()} BTC`}
            subValue={getBtcFiatEquivalent(new BigNumber(parsedPsbt.netAmount), btcFiatRate)}
            icon={IconBitcoin}
            title={t('AMOUNT')}
            heading="You will transfer "
          />
          <InputOutputComponent
            parsedPsbt={parsedPsbt}
            isExpanded={expandInputOutputView}
            address={btcAddress}
            onArrowClick={expandInputOutputSection}
          />

          <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
          <TransactionDetailComponent
            title={t('FEES')}
            value={`${parsedPsbt?.fees.toString()} ${t('SATS')}`}
            subValue={getBtcFiatEquivalent(new BigNumber(parsedPsbt?.fees), btcFiatRate)}
          />
        </Container>

      </OuterContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CANCEL')}
            transparent
            onPress={onCancelClick}
          />
        </TransparentButtonContainer>
        <ActionButton
          text={t('CONFIRM')}
          onPress={onSignPsbtConfirmed}
        />
      </ButtonContainer>
    </>
  );
}

export default SignPsbtRequest;
