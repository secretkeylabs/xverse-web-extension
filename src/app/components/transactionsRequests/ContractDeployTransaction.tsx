import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import { PostCondition, StacksTransaction } from '@stacks/transactions';
import styled from 'styled-components';
import DownloadImage from '@assets/img/webInteractions/ArrowLineDown.svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core';
import { useNavigate } from 'react-router-dom';
import AccountHeaderComponent from '@components/accountHeader';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import InfoContainer from '@components/infoContainer';
import useNetworkSelector from '@hooks/useNetwork';
import TransactionDetailComponent from '@components/transactionDetailComponent';
import finalizeTxSignature from './utils';

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white_400,
  textTransform: 'uppercase',
}));

const DownloadContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: '12px 16px',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 12,
}));

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.elevation3}`,
  flexDirection: 'column',
}));

const DownloadButtonContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  flex: 1,
  justifyContent: 'flex-end',
});

const ButtonText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
  marginRight: props.theme.spacing(2),
  textAlign: 'center',
}));

const ButtonImage = styled.img({
  alignSelf: 'center',
  transform: 'all',
});

const SponsoredContainer = styled.div({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const SponsoredTag = styled.div((props) => ({
  background: props.theme.colors.elevation3,
  marginTop: props.theme.spacing(7.5),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: 30,
}));

const SponosredText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white_0,
}));

const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white_0,
}));

const Button = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
}));

interface ContractDeployRequestProps {
  unsignedTx: StacksTransaction;
  codeBody: string;
  contractName: string;
  sponsored: boolean;
  tabId: number;
  requestToken: string;
}

export default function ContractDeployRequest(props: ContractDeployRequestProps) {
  const { unsignedTx, codeBody, contractName, sponsored, tabId, requestToken } = props;
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [loaderForBroadcastingTx, setLoaderForBroadcastingTx] = useState<boolean>(false);
  const navigate = useNavigate();

  useOnOriginTabClose(tabId, () => {
    setHasTabClosed(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  const broadcastTx = async (tx: StacksTransaction[]) => {
    try {
      setLoaderForBroadcastingTx(true);
      const broadcastResult = await broadcastSignedTransaction(tx[0], selectedNetwork);
      if (broadcastResult) {
        finalizeTxSignature({
          requestPayload: requestToken,
          tabId,
          data: { txId: broadcastResult, txRaw: tx[0].serialize().toString('hex') },
        });
        navigate('/tx-status', {
          state: {
            txid: broadcastResult,
            currency: 'STX',
            error: '',
            browserTx: true,
            tabId,
            requestToken,
          },
        });
      }
    } catch (error: any) {
      setLoaderForBroadcastingTx(false);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: error.message,
          browserTx: true,
        },
      });
    } finally {
      setLoaderForBroadcastingTx(false);
    }
  };

  const confirmCallback = (txs: StacksTransaction[]) => {
    if (sponsored) {
      navigate('/tx-status', {
        state: {
          sponsored: true,
          browserTx: true,
        },
      });
    } else {
      broadcastTx(txs);
    }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeBody], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'code.clar';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const cancelCallback = () => {
    finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
    window.close();
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('DEPLOY_CONTRACT_REQUEST.SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2 &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>
          {t('DEPLOY_CONTRACT_REQUEST.POST_CONDITION_ALERT')}
        </PostConditionAlertText>
      </PostConditionContainer>
    );

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
      <ConfirmStxTransationComponent
        initialStxTransactions={[unsignedTx!]}
        onConfirmClick={confirmCallback}
        onCancelClick={cancelCallback}
        loading={loaderForBroadcastingTx}
        isSponsored={sponsored}
        title={t('DEPLOY_CONTRACT_REQUEST.DEPLOY_CONTRACT')}
      >
        {hasTabClosed && (
          <InfoContainer
            titleText={t('WINDOW_CLOSED_ALERT.TITLE')}
            bodyText={t('WINDOW_CLOSED_ALERT.BODY')}
          />
        )}
        {postConditionAlert}
        {sponsored && showSponsoredTransactionTag}
        {unsignedTx?.postConditions?.values?.map((postCondition) => (
          <StxPostConditionCard postCondition={postCondition as PostCondition} />
        ))}
        <TransactionDetailComponent
          title={t('DEPLOY_CONTRACT_REQUEST.CONTRACT_NAME')}
          value={contractName}
        />
        <DownloadContainer>
          <Title>{t('DEPLOY_CONTRACT_REQUEST.FUNCTION')}</Title>
          <DownloadButtonContainer>
            <Button onClick={downloadCode}>
              <>
                <ButtonText>{t('DEPLOY_CONTRACT_REQUEST.DOWNLOAD')}</ButtonText>
                <ButtonImage src={DownloadImage} />
              </>
            </Button>
          </DownloadButtonContainer>
        </DownloadContainer>
      </ConfirmStxTransationComponent>
    </>
  );
}
