import SwapImage from '@assets/img/webInteractions/swapCall.svg';
import BNSImage from '@assets/img/webInteractions/bnsCall.svg';
import NFTImage from '@assets/img/webInteractions/nftCall.svg';
import ContractCall from '@assets/img/webInteractions/contractCall.svg';
import { ContractCallPayload } from '@stacks/connect';
import styled from 'styled-components';
import ConfirmStxTransationComponent from '@components/confirmStxTransactionComponent';
import StxPostConditionCard from '@components/postCondition/stxPostConditionCard';
import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addressToString, PostCondition, PostConditionType } from '@stacks/transactions';
import { Coin } from '@secretkeylabs/xverse-core';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';
import RedirectAddressView from '@components/redirectAddressView';

const TopImage = styled.img({
  width: 88,
  height: 88,
});

const FunctionTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white['0'],
  marginTop: 16,
}));

const Line = styled.div((props) => ({
  position: 'absolute',
  width: '100%',
  border: `0.5px solid ${props.theme.colors.background.elevation3}`,
  marginTop: props.theme.spacing(8),
}));

const ButtonContainer = styled.div({
  position: 'absolute',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const ShowMoreButton = styled.button((props) => ({
  position: 'relative',
  paddingLeft: props.theme.spacing(4),
  paddingRight: props.theme.spacing(4),
  paddingTop: props.theme.spacing(2),
  paddingBottom: props.theme.spacing(2),
  backgroundColor: '#12151E',
  borderRadius: 24,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'row',
  border: `1px solid ${props.theme.colors.background.elevation3}`,
}));

const ShowMoreButtonContainer = styled.div((props) => ({
  position: 'relative',
  width: '100%',
  marginTop: props.theme.spacing(12),
  marginBottom: props.theme.spacing(12),
}));

const DappTitle = styled.h2((props) => ({
  ...props.theme.body_l,
  color: props.theme.colors.white['400'],
  marginTop: 4,
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
  marginTop: props.theme.spacing(12),
}));

const Value = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
  marginTop: props.theme.spacing(2),
}));

const InfoContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const Container = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
});

const ButtonText = styled.div((props) => ({
  ...props.theme.body_xs,
  fontWeight: 700,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
  textAlign: 'center',
}));

const ButtonSymbolText = styled.div((props) => ({
  ...props.theme.body_xs,
  marginLeft: props.theme.spacing(2),
  color: props.theme.colors.white['0'],
  textAlign: 'center',
  fontSize: 20,
}));

const headerImageMapping = {
  'purchase-asset': NFTImage,
  'buy-item': NFTImage,
  'buy-in-ustx': NFTImage,
  'name-preorder': BNSImage,
  'swap-x-for-y': SwapImage,
  'swap-helper': SwapImage,
};

interface ContractCallRequestProps {
  request: ContractCallPayload;
}

export const ShowMoreContext = createContext({ showMore: false });

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const { request } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'CONTRACT_CALL_REQUEST' });
  const [isShowMore, setIsShowMore] = useState(false);
  const Illustration = headerImageMapping[request.functionName ?? ''];
  const confirmCallback = () => {};
  const cancelCallback = () => {};
  const tx = {
    anchorMode: 3,
    auth: {
      authType: 4,
      spendingCondition: {
        fee: 113000n, hashMode: 0, keyEncoding: 0, nonce: 38n, signature: [Object], signer: 'e00d5ce47fd13be5ee872adffa698fce190ea15f',
      },
    },
    chainId: 1,
    payload: {
      contractAddress: { hash160: '0000000000000000000000000000000000000000', type: 0, version: 22 },
      contractName: {
        content: 'pox', lengthPrefixBytes: 1, maxLengthBytes: 128, type: 2,
      },
      functionArgs: [[Object], [Object]],
      functionName: {
        content: 'allow-contract-caller', lengthPrefixBytes: 1, maxLengthBytes: 128, type: 2,
      },
      payloadType: 2,
      type: 8,
    },
    postConditionMode: 1,
    postConditions: { lengthPrefixBytes: 4, type: 7, values: [[Object]] },
    version: 0,
  };

  const showMoreButton = (
    <ShowMoreButtonContainer>
      <Line />
      <ButtonContainer>
        <ShowMoreButton onClick={() => setIsShowMore(!isShowMore)}>
          <ButtonText>
            {isShowMore ? t('SHOW_LESS') : t('SHOW_MORE')}
          </ButtonText>
          <ButtonSymbolText>
            {isShowMore ? t('MINUS') : t('PLUS')}
          </ButtonSymbolText>
        </ShowMoreButton>
      </ButtonContainer>
    </ShowMoreButtonContainer>

  );

  const renderContractAddress = (
    isShowMore && (
    <RedirectAddressView
      recipient={request.contractAddress}
      title={t('CONTRACT_ADDRESS')}
    />
    )
  );

  return (
    <ConfirmStxTransationComponent
      initialStxTransactions={[tx]}
      onConfirmClick={confirmCallback}
      onCancelClick={cancelCallback}
      loading={false}
    >
      <Container>
        <TopImage src={Illustration || ContractCall} alt="contract-call" />
        <FunctionTitle>{request.functionName}</FunctionTitle>
        <DappTitle>{`Requested by ${request.appDetails?.name}`}</DappTitle>
      </Container>
      {tx?.postConditions?.values?.map((postCondition, i) => (
        <StxPostConditionCard
          key={i}
          postCondition={{
            amount: 1n, conditionCode: 4, conditionType: 0, principal: { address: { hash160: '1853f9fcad12d7e678576ff5df4644691e2d77e7', type: 0, version: 22 }, prefix: 2, type: 1 }, type: 5,
          }}
        />
      ))}
      <InfoContainer>
        <Title>{t('FUNCTION')}</Title>
        <Value>{request?.functionName}</Value>
      </InfoContainer>
      {renderContractAddress}
      {showMoreButton}
    </ConfirmStxTransationComponent>
  );
}
