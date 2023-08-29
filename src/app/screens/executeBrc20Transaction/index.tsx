import ActionButton from '@components/button';
import className from 'classnames';
import styled from 'styled-components';
import useWalletSelector from '@hooks/useWalletSelector';
import { ExecuteBrc20TransferState } from '@utils/brc20';
import { StyledP, StyledHeading, VerticalStackButtonContainer } from '@components/styledCommon';
import { useBrc20TransferExecute } from '@secretkeylabs/xverse-core';
import { useLocation, useNavigate } from 'react-router-dom';
import { getBtcTxStatusUrl } from '@utils/helper';
import CircularSvgAnimation, {
  ConfirmationStatus,
} from '@components/loadingTransactionStatus/circularSvgAnimation';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-top: ${(props) => props.theme.spacing(68)}px;
  position: relative;
`;

const CenterAlignContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
const BottomFixedContainer = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: ${(props) => props.theme.spacing(8)}px;
  padding-bottom: 0;
  margin-bottom: ${(props) => props.theme.spacing(32)}px;
  visibility: hidden;

  &.visible {
    visibility: visible;
    animation: slideY 0.2s ease-in;
  }
  @keyframes slideY {
    0% {
      opacity: 0;
      transform: translateY(16px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const StatusLarge = styled.div`
  min-width: 88px;
  min-height: 88px;
  padding: 22px;
  margin-bottom: 8px;
`;

const Heading = styled(StyledHeading)`
  margin-bottom: 6px;
`;

export function ExecuteBrc20Transaction() {
  const { t } = useTranslation('translation');
  const { selectedAccount, btcAddress, network, seedPhrase } = useWalletSelector();
  const navigate = useNavigate();
  const { recipientAddress, estimateFeesParams, estimatedFees, token }: ExecuteBrc20TransferState =
    useLocation().state;

  const [hasAnimationRested, setHasAnimationRested] = useState(false);

  const { progress, complete, executeTransfer, transferTransactionId, errorCode } =
    useBrc20TransferExecute({
      ...estimateFeesParams,
      seedPhrase,
      accountIndex: selectedAccount?.id ?? 0,
      changeAddress: btcAddress,
      recipientAddress,
      network: network.type,
    });

  useEffect(() => {
    if (!complete) {
      // executeTransfer()
    }
    if (errorCode) {
      // console.error(errorCode);
    } else {
      // console.log(transferTransactionId);
      // console.log(progress);
      // console.log(complete);
    }
  }, [executeTransfer, complete, errorCode, progress, transferTransactionId]);

  // TODO remove debug:
  const [confirmationStatus, setConfirmationStatus] = useState<ConfirmationStatus>('LOADING');
  const [loadingPercentage, setLoadingPercentage] = useState(0);

  useEffect(() => {
    if (loadingPercentage >= 1) {
      setConfirmationStatus('FAILURE');
    } else if (loadingPercentage < 1) {
      setConfirmationStatus('LOADING');
    }
    const timer = setTimeout(() => {
      setLoadingPercentage((prevValue) => (prevValue >= 1 ? 0 : prevValue + 0.25));
    }, 3000);
    return () => clearTimeout(timer);
  }, [loadingPercentage]);

  /* callbacks */
  const handleClickClose = () => {
    navigate(`/dashboard`);
  };

  const handleClickSeeTransaction = () => {
    // TODO tim: navigate to transaction history once brc20 transaction history is done:
    // navigate(`/coinDashboard/brc20?brc20ft=${token?.ticker}`);
    if (transferTransactionId) {
      window.open(
        getBtcTxStatusUrl(transferTransactionId, network),
        '_blank',
        'noopener,noreferrer',
      );
    }
  };

  const handleAnimationRest = () => {
    console.log('rested');
    setHasAnimationRested(true);
  };

  const visibleClass = className({
    visible: hasAnimationRested && confirmationStatus !== 'LOADING',
  });

  const finishedHeadline = t('EXECUTE_BRC20.TRANSACTION_HEADLINE', {
    status: confirmationStatus === 'SUCCESS' ? 'Broadcasted' : 'Failed',
  });

  const finishedBody =
    confirmationStatus === 'SUCCESS' ? (
      t('EXECUTE_BRC20.YOUR_TRANSACTION_HAS_BEEN')
    ) : (
      <>
        {t('EXECUTE_BRC20.XVERSE_WALLET_ROUTER')}
        <br />
        {errorCode}
      </>
    );

  return (
    <Container>
      <CenterAlignContainer>
        <StatusLarge>
          <CircularSvgAnimation
            status={confirmationStatus}
            loadingPercentage={loadingPercentage}
            onRest={handleAnimationRest}
          />
        </StatusLarge>
        {confirmationStatus === 'LOADING' ? (
          <CenterAlignContainer className={visibleClass}>
            <Heading typography="headline_xs">{t('EXECUTE_BRC20.BROADCASTING_YOUR')}</Heading>
            <StyledP typography="body_medium_m" color="white_200">
              {t('EXECUTE_BRC20.DO_NOT_CLOSE')}
            </StyledP>
          </CenterAlignContainer>
        ) : (
          <CenterAlignContainer className={visibleClass}>
            <Heading typography="headline_xs">{finishedHeadline}</Heading>
            <StyledP typography="body_medium_m" color="white_200">
              {finishedBody}
            </StyledP>
          </CenterAlignContainer>
        )}
      </CenterAlignContainer>
      <BottomFixedContainer className={visibleClass}>
        <VerticalStackButtonContainer>
          <ActionButton text={t('EXECUTE_BRC20.CLOSE')} onPress={handleClickClose} />
          {!errorCode && confirmationStatus === 'SUCCESS' && (
            <ActionButton
              text={t('EXECUTE_BRC20.SEE_YOUR_TRANSACTION')}
              onPress={handleClickSeeTransaction}
              transparent
            />
          )}
        </VerticalStackButtonContainer>
      </BottomFixedContainer>
    </Container>
  );
}
export default ExecuteBrc20Transaction;
