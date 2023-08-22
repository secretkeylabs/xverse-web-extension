import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getStxFiatEquivalent, microstacksToStx } from '@secretkeylabs/xverse-core/currency';
import { TokenTransferPayload } from '@secretkeylabs/xverse-core/types';
import { addressToString } from '@secretkeylabs/xverse-core/transactions';
import Separator from '@components/separator';
import RecipientAddressView from '@components/recipientAddressView';
import TransferAmountView from '@components/transferAmountView';
import TopRow from '@components/topRow';
import InfoContainer from '@components/infoContainer';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import useWalletSelector from '@hooks/useWalletSelector';
import ReviewLedgerStxTransactionComponent from '@components/ledger/reviewLedgerStxTransactionComponent';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import { LedgerTransactionType } from '../confirmLedgerTransaction';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(4),
}));

const AlertContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(12),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

function ReviewLedgerStxTransaction() {
  const { t } = useTranslation('translation');
  const [fee, setStateFee] = useState(new BigNumber(0));
  const [amount, setAmount] = useState(new BigNumber(0));
  const [fiatAmount, setFiatAmount] = useState(new BigNumber(0));
  const [total, setTotal] = useState(new BigNumber(0));
  const [fiatTotal, setFiatTotal] = useState(new BigNumber(0));
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [memo, setMemo] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { unsignedTx, sponsored, isBrowserTx, tabId, requestToken } = location.state;
  useOnOriginTabClose(Number(tabId), () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  const { stxBtcRate, btcFiatRate, network } = useWalletSelector();

  function updateUI() {
    const txPayload = unsignedTx.payload as TokenTransferPayload;

    if (txPayload.recipient.address) {
      setRecipient(addressToString(txPayload.recipient.address));
    }

    const txAmount = new BigNumber(txPayload.amount.toString(10));
    const txFee = new BigNumber(unsignedTx.auth.spendingCondition.fee.toString());
    const txTotal = amount.plus(fee);
    const txFiatAmount = getStxFiatEquivalent(amount, stxBtcRate, btcFiatRate);
    const txFiatTotal = getStxFiatEquivalent(amount, stxBtcRate, btcFiatRate);
    const { memo: txMemo } = txPayload;

    setAmount(txAmount);
    setStateFee(txFee);
    setFiatAmount(txFiatAmount);
    setTotal(txTotal);
    setFiatTotal(txFiatTotal);
    setMemo(txMemo.content);
  }

  useEffect(() => {
    if (recipient === '' || !fee || !amount || !fiatAmount || !total || !fiatTotal) {
      updateUI();
    }
  });

  const networkInfoSection = (
    <Container>
      <TitleText>{t('CONFIRM_TRANSACTION.NETWORK')}</TitleText>
      <ValueText>{network.type}</ValueText>
    </Container>
  );

  const memoInfoSection = !!memo && (
    <>
      <Container>
        <TitleText>{t('CONFIRM_TRANSACTION.MEMO')}</TitleText>
        <ValueText>{memo}</ValueText>
      </Container>
      <Separator />
    </>
  );

  const getAmount = () => {
    const txPayload = unsignedTx?.payload as TokenTransferPayload;
    const amountToTransfer = new BigNumber(txPayload?.amount?.toString(10));
    return microstacksToStx(amountToTransfer);
  };

  const handleOnConfirmClick = () => {
    const txType: LedgerTransactionType = 'STX';
    navigate('/confirm-ledger-tx', { state: { unsignedTx, type: txType } });
  };

  const handleOnCancelClick = () => {
    navigate('/send-stx-ledger', {
      state: {
        recipientAddress: recipient,
        amountToSend: getAmount().toString(),
        stxMemo: memo,
      },
    });
  };

  return (
    <>
      <FullScreenHeader />
      <TopRow title={t('CONFIRM_TRANSACTION.CONFIRM_TX')} onClick={handleOnCancelClick} />
      <ReviewLedgerStxTransactionComponent
        initialStxTransactions={[unsignedTx]}
        loading={false}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleOnCancelClick}
        isSponsored={sponsored}
      >
        <TransferAmountView currency="STX" amount={getAmount()} />
        {hasTabClosed && (
          <AlertContainer>
            <InfoContainer
              titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
              bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
            />
          </AlertContainer>
        )}
        <RecipientAddressView recipient={recipient} />
        {networkInfoSection}
        <Separator />
        {memoInfoSection}
      </ReviewLedgerStxTransactionComponent>
    </>
  );
}
export default ReviewLedgerStxTransaction;
