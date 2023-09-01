import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import RecipientAddressView from '@components/recipientAddressView';
import TransferAmountView from '@components/transferAmountView';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import TopRow from '@components/topRow';
import BigNumber from 'bignumber.js';
import useWalletSelector from '@hooks/useWalletSelector';
import FullScreenHeader from '@components/ledger/fullScreenHeader';
import { LedgerTransactionType } from '../confirmLedgerTransaction';

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderBottom: `1px solid ${props.theme.colors.elevation3}`,
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  textTransform: 'uppercase',
}));

const ValueText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

function ReviewLedgerFtTransaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const navigate = useNavigate();
  const location = useLocation();
  const { unsignedTx, amount, fungibleToken, memo, recepientAddress } = location.state;

  const { network } = useWalletSelector();

  const handleOnConfirmClick = () => {
    const txType: LedgerTransactionType = 'STX';
    navigate('/confirm-ledger-tx', { state: { unsignedTx, type: txType } });
  };

  const handleBackButtonClick = () => {
    navigate(`/send-ft-ledger?coin=${fungibleToken.name}`, {
      state: {
        recipientAddress: recepientAddress,
        amountToSend: amount.toString(),
        stxMemo: memo,
        fungibleToken,
      },
    });
  };

  return (
    <>
      <FullScreenHeader />
      <TopRow title={t('CONFIRM_TX')} onClick={handleBackButtonClick} />
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx]}
        loading={false}
        onConfirmClick={handleOnConfirmClick}
        onCancelClick={handleBackButtonClick}
        skipModal
      >
        <TransferAmountView
          currency="FT"
          amount={new BigNumber(amount)}
          fungibleToken={fungibleToken}
        />
        <RecipientAddressView recipient={recepientAddress} />
        <InfoContainer>
          <TitleText>{t('NETWORK')}</TitleText>
          <ValueText>{network.type}</ValueText>
        </InfoContainer>
        {!!memo && (
          <InfoContainer>
            <TitleText>{t('MEMO')}</TitleText>
            <ValueText>{memo}</ValueText>
          </InfoContainer>
        )}
      </ConfirmStxTransationComponent>
    </>
  );
}
export default ReviewLedgerFtTransaction;
