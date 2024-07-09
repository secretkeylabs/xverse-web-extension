import ArrowSquareOut from '@assets/img/arrow_square_out.svg';
import Success from '@assets/img/send/check_circle.svg';
import Failure from '@assets/img/send/x_circle.svg';
import {
  sendAddressMismatchMessage,
  sendMissingFunctionArgumentsMessage,
  sendNetworkMismatchMessage,
} from '@common/utils/rpc/responseMessages/errors';
import ActionButton from '@components/button';
import CopyButton from '@components/copyButton';
import InfoContainer from '@components/infoContainer';
import useWalletSelector from '@hooks/useWalletSelector';
import Button from '@ui-library/button';
import { MAGIC_EDEN_RUNES_URL } from '@utils/constants';
import { getBtcTxStatusUrl, getStxTxStatusUrl } from '@utils/helper';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const TxStatusContainer = styled.div((props) => ({
  background: props.theme.colors.elevation0,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
}));

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
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: props.theme.spacing(6),
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

const InfoMessageContainer = styled.div({
  marginLeft: 8,
  marginRight: 8,
  marginTop: 20,
});

const Image = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const HeadingText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  textAlign: 'center',
  marginTop: props.theme.spacing(8),
}));

const BodyText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(8),
  textAlign: 'center',
  overflowWrap: 'break-word',
  wordWrap: 'break-word',
  wordBreak: 'break-word',
  marginLeft: props.theme.spacing(5),
  marginRight: props.theme.spacing(5),
}));

const TxIDText = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  marginTop: props.theme.spacing(8),
  textTransform: 'uppercase',
}));

const BeforeButtonText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
}));

const IDText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_0,
  marginTop: props.theme.spacing(2),
  wordBreak: 'break-all',
}));

const ButtonText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  marginRight: props.theme.spacing(2),
  color: props.theme.colors.white_0,
}));

const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
}));

const CustomButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'transparent',
  marginLeft: props.theme.spacing(3),
}));

function TransactionStatus() {
  const { t } = useTranslation('translation', { keyPrefix: 'TRANSACTION_STATUS' });
  const { t: tReqErrors } = useTranslation('translation', { keyPrefix: 'REQUEST_ERRORS' });
  const navigate = useNavigate();
  const location = useLocation();
  const { network } = useWalletSelector();
  // TODO tim: refactor to use react context
  const {
    txid,
    currency,
    error,
    sponsored,
    browserTx,
    isOrdinal,
    isNft,
    isRareSat,
    errorTitle,
    isBrc20TokenFlow,
    runeListed,
    isSponsorServiceError,
    isSwapTransaction,
    tabId,
    messageId,
  } = location.state as { tabId?: chrome.tabs.Tab['id']; messageId?: string; [key: string]: any };

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
    if (browserTx) {
      if (error === tReqErrors('NETWORK_MISMATCH') && tabId && messageId)
        sendNetworkMismatchMessage({ tabId, messageId });
      if (error === tReqErrors('ADDRESS_MISMATCH') && tabId && messageId)
        sendAddressMismatchMessage({ tabId, messageId });
      if (error === tReqErrors('MISSING_ARGUMENTS') && tabId && messageId)
        sendMissingFunctionArgumentsMessage({ tabId, messageId });
      window.close();
    } else if (isRareSat) navigate('/nft-dashboard?tab=rareSats');
    else if (isOrdinal) navigate('/nft-dashboard?tab=inscriptions');
    else if (isNft) navigate('/nft-dashboard?tab=nfts');
    else if (runeListed) navigate(`/coinDashboard/FT?ftKey=${runeListed.principal}&protocol=runes`);
    else navigate('/');
  };

  const handleClickTrySwapAgain = () => {
    navigate('/swap');
  };

  const renderLink = (
    <RowContainer>
      <BeforeButtonText>{t('SEE_ON')}</BeforeButtonText>
      <CustomButton onClick={openTransactionInBrowser}>
        <ButtonText>{currency === 'BTC' ? t('BITCOIN_EXPLORER') : t('STACKS_EXPLORER')}</ButtonText>
        <ButtonImage src={ArrowSquareOut} />
      </CustomButton>
    </RowContainer>
  );

  const renderTransactionID = (
    <TransactionIDContainer>
      <TxIDText>{t('TRANSACTION_ID')}</TxIDText>
      <TxIDContainer>
        <IDText data-testid="transaction-id">{txid}</IDText>
        <CopyButtonContainer>
          <CopyButton text={txid} />
        </CopyButtonContainer>
      </TxIDContainer>
    </TransactionIDContainer>
  );

  if (runeListed) {
    return (
      <TxStatusContainer data-testid="transaction-container">
        <OuterContainer>{renderTransactionSuccessStatus}</OuterContainer>
        <ButtonContainer>
          <Button variant="primary" title={t('CLOSE')} onClick={onCloseClick} />
          <Button
            variant="secondary"
            title={t('SEE_ON_MAGICEDEN', { runeSymbol: runeListed?.runeSymbol ?? '' })}
            onClick={() => {
              window.open(
                `${MAGIC_EDEN_RUNES_URL}/${runeListed?.name}`,
                '_blank',
                'noopener,noreferrer',
              );
            }}
          />
        </ButtonContainer>
      </TxStatusContainer>
    );
  }

  return (
    <TxStatusContainer data-testid="transaction-container">
      <OuterContainer>
        {txid ? renderTransactionSuccessStatus : renderTransactionFailureStatus}
        {txid && renderLink}
        {isBrc20TokenFlow ? (
          <InfoMessageContainer>
            <InfoContainer bodyText={t('BRC20_ORDINAL_MSG')} />
          </InfoMessageContainer>
        ) : (
          txid && renderTransactionID
        )}
        {isSponsorServiceError && (
          <InfoMessageContainer>
            <InfoContainer bodyText={t('SPONSOR_SERVICE_ERROR')} />
          </InfoMessageContainer>
        )}
      </OuterContainer>
      {isSwapTransaction && isSponsorServiceError ? (
        <ButtonContainer>
          <ActionButton text={t('RETRY')} onPress={handleClickTrySwapAgain} />
          <ActionButton text={t('CLOSE')} onPress={onCloseClick} transparent />
        </ButtonContainer>
      ) : (
        <ButtonContainer>
          <ActionButton text={t('CLOSE')} onPress={onCloseClick} />
        </ButtonContainer>
      )}
    </TxStatusContainer>
  );
}

export default TransactionStatus;
