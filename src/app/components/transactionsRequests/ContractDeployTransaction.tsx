import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import { ContractCallPayload } from '@stacks/transactions';
import styled from 'styled-components';
import DeployContractImage from '@assets/img/webInteractions/deploy_contract.svg';
import { useTranslation } from 'react-i18next';
import { extractFromPayload } from '@secretkeylabs/xverse-core/browserTransactions';
import useStxPendingTxData from '@hooks/useStxPendingTxData';

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

interface ContractDeployRequestProps {
  request: ContractCallPayload;
}

export default function ContractDeployRequest(props: ContractDeployRequestProps) {
  const { request } = props;
  console.log("deploy")
  console.log(request)
  const { t } = useTranslation('translation', { keyPrefix: 'DEPLOY_CONTRACT_REQUEST' });
  const {codeBody, contractName, postConditionMode} = request;
  const {postConds} = extractFromPayload(request);
  const postConditions = postConds;
  const { data: stxPendingTxData } = useStxPendingTxData();
  return (
    <Container>
      <TopImage src={DeployContractImage} alt="deploy_contract" />
      <FunctionTitle>{t('DEPLOY_CONTRACT')}</FunctionTitle>
    </Container>
  );
}
