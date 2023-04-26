import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import ActionButton from '@components/button';
import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import Success from '@assets/img/send/check_circle.svg';
import Failure from '@assets/img/send/x_circle.svg';
import { getBtcTxStatusUrl, getStxTxStatusUrl } from '@utils/helper';
import useWalletSelector from '@hooks/useWalletSelector';
import CopyButton from '@components/copyButton';

const TxStatusContainer = styled.div({
  background: 'rgba(25, 25, 48, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
});

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

const OuterContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  marginTop: props.theme.spacing(46),
  flex: 1,
}));

const TransactionIDContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  marginTop: props.theme.spacing(15),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const ButtonContainer = styled.div((props) => ({
  flex: 1,
  display: 'flex',
  alignItems: 'flex-end',
  marginTop: props.theme.spacing(15),
  marginBottom: props.theme.spacing(32),
  marginLeft: props.theme.spacing(8),
  marginRight: props.theme.spacing(8),
}));

const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(16),
}));

const TxIDContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
});

const CopyButtonContainer = styled.div({
  marginLeft: 8,
  padding: 2,
});

const Image = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const HeadingText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  marginTop: props.theme.spacing(8),
}));

const BodyText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  marginLeft: props.theme.spacing(5),
  marginRight: props.theme.spacing(5),
}));

const TxIDText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  marginTop: props.theme.spacing(8),
  textTransform: 'uppercase',
}));

const BeforeButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['400'],
}));

const IDText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.body_m,
  marginRight: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(3),
}));

function TransactionStatus() {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_STATUS' });
  const navigate = useNavigate();
  const location = useLocation();
  const { network } = useWalletSelector();
  const {
    txid, currency, error, sponsored, browserTx, isOrdinal, isNft, errorTitle,
  } = location.state;

  const renderTransactionSuccessStatus = (
    <Container>
      <Image src={Success} />
      <HeadingText>{sponsored ? t('SPONSORED_SUCCESS_MSG') : t('BROADCASTED')}</HeadingText>
      <BodyText>{sponsored ? t('SPONSORED_MSG') : t('SUCCESS_MSG')}</BodyText>
    </Container>
  );

  const renderTransactionFailureStatus = (
    <Container>
      <Image src={Failure} />
      <HeadingText>{errorTitle || t('FAILED')}</HeadingText>
      <BodyText>{error}</BodyText>
    </Container>
  );

  const openTransactionInBrowser = () => {
    if (txid) {
      if (currency === 'BTC') {
        window.open(getBtcTxStatusUrl(txid, network), '_blank', 'noopener,noreferrer');
      } else {
        window.open(`${getStxTxStatusUrl(txid, network)}`, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const onCloseClick = () => {
    if (browserTx) window.close();
    else if (isOrdinal) navigate(-4);
    else if (isNft) navigate(-3);
    else navigate(-3);
  };

  const renderLink = (
    <RowContainer>
      <BeforeButtonText>{t('SEE_ON')}</BeforeButtonText>
      <Button onClick={openTransactionInBrowser}>
        <ButtonText>
          {currency === 'BTC' ? t('BITCOIN_EXPLORER') : t('STACKS_EXPLORER')}
        </ButtonText>
        <ButtonImage src={ArrowSquareOut} />
      </Button>
    </RowContainer>
  );

  const renderTransactionID = (
    <TransactionIDContainer>
      <TxIDText>{t('TRANSACTION_ID')}</TxIDText>
      <TxIDContainer>
        <IDText>{txid}</IDText>
        <CopyButtonContainer>
          <CopyButton text={txid} />
        </CopyButtonContainer>
      </TxIDContainer>
    </TransactionIDContainer>
  );

  return (
    <TxStatusContainer>
      {sponsored ? <OuterContainer>{renderTransactionSuccessStatus}</OuterContainer>
        : (
          <OuterContainer>
            {txid ? renderTransactionSuccessStatus : renderTransactionFailureStatus}
            {txid && renderLink}
            {txid && renderTransactionID}
          </OuterContainer>
        )}
      <ButtonContainer>
        <ActionButton text={t('CLOSE')} onPress={onCloseClick} />
      </ButtonContainer>
    </TxStatusContainer>
  );
}

export default TransactionStatus;
