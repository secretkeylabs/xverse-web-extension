import AccountHeaderComponent from '@components/accountHeader';
import ActionButton from '@components/button';
import InfoContainer from '@components/infoContainer';
import OutputIcon from '@assets/img/transactions/output.svg';
import IconOrdinal from '@assets/img/transactions/ordinal.svg';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import TransferFeeView from '@components/transferFeeView';
import BigNumber from 'bignumber.js';
import useWalletSelector from '@hooks/useWalletSelector';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import BRC20TransactionDetailComponent from './transactionDetailComponent';
import FeeCard from './feeCard';

const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

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

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const TitleText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(12),
  textAlign: 'left',
}));

const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(4),
  textAlign: 'left',
}));

const TwoTransactionText = styled.h1((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white[200],
  marginBottom: props.theme.spacing(12),
  textAlign: 'left',
}));

function ConfirmBRC20Transaction() {
  const { t } = useTranslation('translation', { keyPrefix: 'CONFIRM_TRANSACTION' });
  const {
    network,
  } = useWalletSelector();
  const onCancelClick = async () => {

  };

  const onConfirmClick = async () => {

  };

  const firstTransactionDetail = (
    <>
      <TitleText>
        1.
        {' '}
        {t('INSCRIBE')}
      </TitleText>
      <BRC20TransactionDetailComponent
        transactionType="BRC-20 Transfer"
        icon={IconOrdinal}
        title={t('ORDINAL')}
        transactionDetail="transfer-10000ordi"
        heading={`1. ${t('INSCRIBE')}`}
        secondTitle="Transfer"
        secondValue="1,000 ORDI"
      />
      <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
      <FeeCard inscriptionFee={new BigNumber(1)} transactionFee={new BigNumber(1)} totalFee={new BigNumber(2)} />
    </>
  );

  const secondTransactionDetail = (
    <>
      <TitleText>
        2.
        {' '}
        {t('BRC20_SEND')}
      </TitleText>
      <BRC20TransactionDetailComponent
        transactionType="BRC-20 Transfer"
        icon={IconOrdinal}
        secondIcon={OutputIcon}
        title={t('ORDINAL')}
        transactionDetail="transfer-10000ordi"
        heading={`2. ${t('BRC20_SEND')}`}
        secondTitle={t('RECIPIENT')}
        secondValue="bc1h...fGH9"
        showCopyButton
      />
      <TransactionDetailComponent title={t('NETWORK')} value={network.type} />
      <TransferFeeView fee={new BigNumber(2)} currency={t('SATS')} title={t('TRANSACTION_FEES')} />
    </>
  );

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch disableCopy />
      <>
        <OuterContainer>
          <Container>
            <ReviewTransactionText>{t('REVIEW_TRNSACTION')}</ReviewTransactionText>
            <TwoTransactionText>{t('TWO_TRANSACTIONS')}</TwoTransactionText>
            <InfoContainer bodyText={t('BRC20_INFO_MESSAGE')} />
            <BRC20TransactionDetailComponent
              transactionType="BRC-20 Transfer"
              icon={IconOrdinal}
              title={t('ORDINAL')}
              transactionDetail="transfer-10000ordi"
              heading={`1. ${t('INSCRIBE')}`}
              secondTitle="Transfer"
              secondValue="1,000 ORDI"
              showDetailsButton
            >
              {firstTransactionDetail}
            </BRC20TransactionDetailComponent>
            <BRC20TransactionDetailComponent
              transactionType="BRC-20 Transfer"
              icon={IconOrdinal}
              secondIcon={OutputIcon}
              title={t('ORDINAL')}
              transactionDetail="transfer-10000ordi"
              heading={`2. ${t('BRC20_SEND')}`}
              secondTitle={t('RECIPIENT')}
              secondValue="bc1h...fGH9"
              showCopyButton
              showDetailsButton
            >
              {secondTransactionDetail}
            </BRC20TransactionDetailComponent>
            <TransferFeeView fee={new BigNumber(2)} currency={t('SATS')} />
          </Container>
        </OuterContainer>
        <ButtonContainer>
          <TransparentButtonContainer>
            <ActionButton text={t('CANCEL')} transparent onPress={onCancelClick} />
          </TransparentButtonContainer>
          <ActionButton text={t('CONFIRM')} onPress={onConfirmClick} />
        </ButtonContainer>
      </>

    </>
  );
}
export default ConfirmBRC20Transaction;
