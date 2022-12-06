import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import { PostCondition, StacksTransaction } from '@stacks/transactions';
import styled from 'styled-components';
import DownloadImage from '@assets/img/webInteractions/ArrowLineDown.svg';
import DeployContractImage from '@assets/img/webInteractions/deploy_contract.svg';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import useWalletSelector from '@hooks/useWalletSelector';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core';
import { useNavigate } from 'react-router-dom';
import AccountHeaderComponent from '@components/accountHeader';

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const TopImage = styled.img({
  width: 88,
  height: 88,
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
}));

const Value = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(2),
}));

const InfoContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(6),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.background.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
  flexDirection: 'column',
}));

const DownloadContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(13.5),
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
}));

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(12),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.background.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
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
  color: props.theme.colors.white['0'],
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
  background: props.theme.colors.background.elevation3,
  marginTop: props.theme.spacing(7.5),
  paddingTop: props.theme.spacing(4),
  paddingBottom: props.theme.spacing(4),
  paddingLeft: props.theme.spacing(8),
  paddingRight: props.theme.spacing(8),
  borderRadius: 30,
}));

const SponosredText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
}));

const PostConditionAlertText = styled.h1((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['0'],
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
}

export default function ContractDeployRequest(props: ContractDeployRequestProps) {
  const {
    unsignedTx, codeBody, contractName, sponsored,
  } = props;
  const { network } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'DEPLOY_CONTRACT_REQUEST' });
  const [loaderForBroadcastingTx, setLoaderForBroadcastingTx] = useState<boolean>(false);
  const navigate = useNavigate();

  const broadcastTx = async (tx: StacksTransaction) => {
    try {
      setLoaderForBroadcastingTx(true);
      const networkType = network?.type ?? 'Mainnet';
      const broadcastResult: string = await broadcastSignedTransaction(tx, networkType);
      if (broadcastResult) {
        navigate('/tx-status', {
          state: {
            txid: broadcastResult,
            currency: 'STX',
            error: '',
            browserTx: true,
          },
        });
      }
    } catch (error: any) {
      setLoaderForBroadcastingTx(false);
      navigate('/tx-status', {
        state: {
          txid: '',
          currency: 'STX',
          error: error.toString(),
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
    } else { broadcastTx(txs[0]); }
  };

  const downloadCode = () => {
    const element = document.createElement('a');
    const file = new Blob([codeBody], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'code.clar';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const cancelCallback = () => { window.close(); };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('SPONSORED')}</SponosredText>
      </SponsoredTag>

    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2
  && unsignedTx?.postConditions.values.length <= 0 && (
    <PostConditionContainer>
      <PostConditionAlertText>{t('POST_CONDITION_ALERT')}</PostConditionAlertText>
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
      >
        <Container>
          <TopImage src={DeployContractImage} alt="deploy_contract" />
          <FunctionTitle>{t('DEPLOY_CONTRACT')}</FunctionTitle>
        </Container>
        {postConditionAlert}
        {sponsored && showSponsoredTransactionTag}
        {unsignedTx?.postConditions?.values?.map((postCondition) => (
          <StxPostConditionCard
            postCondition={postCondition as PostCondition}
          />
        ))}
        <InfoContainer>
          <Title>{t('CONTRACT_NAME')}</Title>
          <Value>{contractName}</Value>
          <DownloadContainer>
            <Title>{t('FUNCTION')}</Title>
            <DownloadButtonContainer>
              <Button onClick={downloadCode}>
                <>
                  <ButtonText>{t('DOWNLOAD')}</ButtonText>
                  <ButtonImage src={DownloadImage} />
                </>
              </Button>
            </DownloadButtonContainer>

          </DownloadContainer>
        </InfoContainer>
      </ConfirmStxTransationComponent>
    </>
  );
}
