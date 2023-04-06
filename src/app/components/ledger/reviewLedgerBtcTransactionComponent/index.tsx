import TopRow from '@components/topRow';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ReactNode, useEffect, useState } from 'react';
import BigNumber from 'bignumber.js';
import ActionButton from '@components/button';
import AssetIcon from '@assets/img/transactions/Assets.svg';
import SettingIcon from '@assets/img/dashboard/faders_horizontal.svg';
import TransactionSettingAlert from '@components/transactionSetting';
import { useSelector } from 'react-redux';
import IconBitcoin from '@assets/img/dashboard/bitcoin_icon.svg';
import { StoreState } from '@stores/index';
import { signBtcTransaction } from '@secretkeylabs/xverse-core/transactions';
import { useMutation } from '@tanstack/react-query';
import {
  Recipient,
  SignedBtcTx,
  signNonOrdinalBtcSendTransaction,
  signOrdinalSendTransaction,
} from '@secretkeylabs/xverse-core/transactions/btc';
import {
  BtcUtxoDataResponse,
  ErrorCodes,
  getBtcFiatEquivalent,
  ResponseError,
  satsToBtc,
} from '@secretkeylabs/xverse-core';
import TransactionDetailComponent from '../../transactionDetailComponent';
import BtcRecipientComponent from './ledgerBtcRecipientComponent';

const OuterContainer = styled.div`
  display: flex;
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
  marginBottom: props.theme.spacing(5),
}));

const TransparentButtonContainer = styled.div((props) => ({
  marginLeft: props.theme.spacing(2),
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  width: '100%',
  marginTop: props.theme.spacing(10),
}));

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(24),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ErrorText = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.feedback.error,
}));

interface ReviewTransactionTitleProps {
  isOridnalTx: boolean;
}
const ReviewTransactionText = styled.h1<ReviewTransactionTitleProps>((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white[0],
  marginBottom: props.theme.spacing(16),
  textAlign: props.isOridnalTx ? 'center' : 'left',
}));

interface Props {
  recipients: Recipient[];
  children?: ReactNode;
  onConfirmClick: () => void;
  onCancelClick: () => void;
  onBackButtonClick: () => void;
}

function ReviewLedgerBtcTransactionComponent({
  recipients,
  children,
  onConfirmClick,
  onCancelClick,
  onBackButtonClick,
}: Props) {
  const { t } = useTranslation('translation');
  const isGalleryOpen: boolean = document.documentElement.clientWidth > 360;
  const { network, btcFiatRate } = useSelector((state: StoreState) => state.walletState);
  const [error, setError] = useState('');

  const handleOnConfirmClick = () => {
    onConfirmClick();
  };

  return (
    <OuterContainer>
      {!isGalleryOpen && (
        <TopRow title={t('CONFIRM_TRANSACTION.SEND')} onClick={onBackButtonClick} />
      )}
      <Container>
        {children}
        <ReviewTransactionText isOridnalTx={false}>
          {t('CONFIRM_TRANSACTION.REVIEW_TRNSACTION')}
        </ReviewTransactionText>

        {recipients?.map((recipient, index) => (
          <BtcRecipientComponent
            recipientIndex={index + 1}
            address={recipient?.address}
            value={satsToBtc(recipient?.amountSats).toString()}
            totalRecipient={recipients?.length}
            icon={IconBitcoin}
            title={t('CONFIRM_TRANSACTION.AMOUNT')}
            subValue={getBtcFiatEquivalent(recipient?.amountSats, btcFiatRate)}
          />
        ))}

        <TransactionDetailComponent title={t('CONFIRM_TRANSACTION.NETWORK')} value={network.type} />
      </Container>
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
      </ErrorContainer>
      <ButtonContainer>
        <TransparentButtonContainer>
          <ActionButton
            text={t('CONFIRM_TRANSACTION.CANCEL')}
            transparent
            onPress={onCancelClick}
          />
        </TransparentButtonContainer>
        <ActionButton text={t('CONFIRM_TRANSACTION.CONFIRM')} onPress={handleOnConfirmClick} />
      </ButtonContainer>
    </OuterContainer>
  );
}

export default ReviewLedgerBtcTransactionComponent;
