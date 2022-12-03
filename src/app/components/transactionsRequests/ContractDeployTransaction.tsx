import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import { ContractCallPayload, PostCondition, StacksTransaction } from '@stacks/transactions';
import styled from 'styled-components';
import DeployContractImage from '@assets/img/webInteractions/deploy_contract.svg';
import { useTranslation } from 'react-i18next';
import { createDeployContractRequest } from '@screens/transactionRequest/helper';
import { useEffect, useState } from 'react';
import useWalletSelector from '@hooks/useWalletSelector';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import { broadcastSignedTransaction } from '@secretkeylabs/xverse-core';
import { useNavigate } from 'react-router-dom';
import { Ring } from 'react-spinners-css';

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

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  marginTop: props.theme.spacing(12),
  paddingTop: props.theme.spacing(12),
  paddingBottom: props.theme.spacing(12),
  borderTop: `0.5px solid ${props.theme.colors.background.elevation3}`,
  borderBottom: `0.5px solid ${props.theme.colors.background.elevation3}`,
  flexDirection: 'column',
}));

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

const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.spacing(12),
}));

interface ContractDeployRequestProps {
  request: ContractCallPayload;
}

export default function ContractDeployRequest(props: ContractDeployRequestProps) {
  const { request } = props;
  const {
    stxAddress, network, stxPublicKey, feeMultipliers,
  } = useWalletSelector();
  const { t } = useTranslation('translation', { keyPrefix: 'DEPLOY_CONTRACT_REQUEST' });
  const [contractDeployTx, setContractDeployTx] = useState<StacksTransaction | undefined>(undefined);
  const [codeBody, setCodeBody] = useState(undefined);
  const [contractName, setContractName] = useState(undefined);
  const [sponsored, setSponsored] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
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
        },
      });
    } finally {
      setLoaderForBroadcastingTx(false);
    }
  };

  useEffect(() => {
    async function fetchRequest() {
      const response = await createDeployContractRequest(request, network, stxPublicKey, feeMultipliers!, stxAddress);
      setContractDeployTx(response.contractDeployTx);
      setSponsored(response.sponsored);
      setCodeBody(response.codeBody);
      setContractName(response.contractName);
      setLoading(false);
    }
    fetchRequest();
  }, []);

  const confirmCallback = (txs: StacksTransaction[]) => {
    broadcastTx(txs[0]);
  };

  const cancelCallback = () => { window.close(); };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('SPONSORED')}</SponosredText>
      </SponsoredTag>

    </SponsoredContainer>
  );

  const postConditionAlert = contractDeployTx?.postConditionMode === 2
  && contractDeployTx?.postConditions.values.length <= 0 && (
    <PostConditionContainer>
      <PostConditionAlertText>{t('POST_CONDITION_ALERT')}</PostConditionAlertText>
    </PostConditionContainer>
  );

  return (

    !loading ? (
      <ConfirmStxTransationComponent
        initialStxTransactions={[contractDeployTx!]}
        onConfirmClick={confirmCallback}
        onCancelClick={cancelCallback}
        loading={loaderForBroadcastingTx}
      >
        <Container>
          <TopImage src={DeployContractImage} alt="deploy_contract" />
          <FunctionTitle>{t('DEPLOY_CONTRACT')}</FunctionTitle>
        </Container>
        {postConditionAlert}
        {sponsored && showSponsoredTransactionTag}
        {contractDeployTx?.postConditions?.values?.map((postCondition) => (
          <StxPostConditionCard
            postCondition={postCondition as PostCondition}
          />
        ))}
        <InfoContainer>
          <Title>{t('CONTRACT_NAME')}</Title>
          <Value>{contractName}</Value>
        </InfoContainer>
      </ConfirmStxTransationComponent>
    ) : (
      <LoaderContainer>
        <Ring color="white" size={50} />
      </LoaderContainer>
    )
  );
}
