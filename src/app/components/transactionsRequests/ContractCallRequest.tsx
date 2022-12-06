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
import {
  ClarityType,
  cvToJSON,
  cvToString,
  PostCondition,
  PostConditionType,
  SomeCV,
  StacksTransaction,
} from '@stacks/transactions';
import { addressToString, broadcastSignedTransaction, Coin } from '@secretkeylabs/xverse-core';
import RedirectAddressView from '@components/redirectAddressView';
import useWalletSelector from '@hooks/useWalletSelector';
import { useNavigate } from 'react-router-dom';
import { Args, ContractFunction } from '@secretkeylabs/xverse-core/types/api/stacks/transaction';
import { extractFromPayload } from '@screens/transactionRequest/helper';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';

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

const Detail = styled.h1((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.white['400'],
  textTransform: 'uppercase',
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
  unsignedTx: StacksTransaction;
  funcMetaData: ContractFunction | undefined;
  coinsMetaData: Coin[] | null;
}

export const ShowMoreContext = createContext({ showMore: false });

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const { request, unsignedTx, funcMetaData, coinsMetaData } = props;
  const { t } = useTranslation('translation', { keyPrefix: 'CONTRACT_CALL_REQUEST' });
  const [isShowMore, setIsShowMore] = useState(false);
  const Illustration = headerImageMapping[request.functionName ?? ''];

  const showMoreButton = (
    <ShowMoreButtonContainer>
      <Line />
      <ButtonContainer>
        <ShowMoreButton onClick={() => setIsShowMore(!isShowMore)}>
          <ButtonText>{isShowMore ? t('SHOW_LESS') : t('SHOW_MORE')}</ButtonText>
          <ButtonSymbolText>{isShowMore ? t('MINUS') : t('PLUS')}</ButtonSymbolText>
        </ShowMoreButton>
      </ButtonContainer>
    </ShowMoreButtonContainer>
  );

  const renderContractAddress = isShowMore && (
    <RedirectAddressView recipient={request.contractAddress} title={t('CONTRACT_ADDRESS')} />
  );
  type ArgToView = { name: string; value: string; type: any };
  const getFunctionArgs = (): Array<ArgToView> => {
    const args: Array<ArgToView> = [];
    const { funcArgs } = extractFromPayload(request);
    funcMetaData?.args?.map((arg: Args, index: number) => {
      const funcArg = cvToJSON(funcArgs[index]);

      const argTypeIsOptionalSome = funcArgs[index].type === ClarityType.OptionalSome;

      const funcArgType = argTypeIsOptionalSome
        ? (funcArgs[index] as SomeCV).value?.type
        : funcArgs[index]?.type;

      const funcArgValString = argTypeIsOptionalSome
        ? cvToString((funcArgs[index] as SomeCV).value, 'tryAscii')
        : cvToString(funcArgs[index]);

      const normalizedValue = (() => {
        switch (funcArgType) {
          case ClarityType.UInt:
            return funcArgValString.split('u').join('');
          case ClarityType.Buffer:
            return funcArgValString.substring(1, funcArgValString.length - 1);
          default:
            return funcArgValString;
        }
      })();
      const argToView: ArgToView = {
        name: arg.name,
        value: normalizedValue,
        type: funcArg.type,
      };
      args.push(argToView);
    });
    return args;
  };

  const functionArgsView = () => {
    const args = getFunctionArgs();
    if (isShowMore) {
      return args.map((arg, index) => {
        return (
          <InfoContainer>
            <Title>{arg.name}</Title>
            <Value>{arg.value}</Value>
            <Detail>{arg.type}</Detail>
          </InfoContainer>
        );
      });
    }
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2 &&
    unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>{t('POST_CONDITION_ALERT')}</PostConditionAlertText>
      </PostConditionContainer>
    );
  const { network } = useWalletSelector();
  const navigate = useNavigate();
  const broadcastTx = async (tx: StacksTransaction) => {
    try {
      // setIsLoading(true);
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
    } catch (e) {
      if (e instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: e,
          },
        });
        console.error(e.message);
        console.error(e.stack);
      }
    } finally {
      // setIsLoading(false);
    }
  };

  const confirmCallback = (transactions: StacksTransaction[]) => {
    const tx: StacksTransaction = transactions[0];
    broadcastTx(tx);
  };
  const cancelCallback = () => {
    window.close();
  };

  const renderPostConditionsCard = () => {
    const { postConds } = extractFromPayload(request);
    return postConds?.map((postCondition, i) => {
      switch (postCondition.conditionType) {
        case PostConditionType.STX:
          return <StxPostConditionCard key={i} postCondition={postCondition} />;
        case PostConditionType.Fungible:
          const coinInfo = coinsMetaData?.find(
            (coin: Coin) =>
              coin.contract ===
              `${addressToString(postCondition.assetInfo.address)}.${
                postCondition.assetInfo.contractName.content
              }`
          );
          return (
            <FtPostConditionCard key={i} postCondition={postCondition} ftMetaData={coinInfo} />
          );
        case PostConditionType.NonFungible:
          return <NftPostConditionCard key={i} postCondition={postCondition} />;
      }
    });
  };

  return (
    <ConfirmStxTransationComponent
      initialStxTransactions={[unsignedTx]}
      onConfirmClick={confirmCallback}
      onCancelClick={cancelCallback}
      loading={false}
    >
      <>
        <Container>
          <TopImage src={Illustration || ContractCall} alt="contract-call" />
          <FunctionTitle>{request.functionName}</FunctionTitle>
          <DappTitle>{`Requested by ${request.appDetails?.name}`}</DappTitle>
        </Container>
        {postConditionAlert}
        {request.sponsored && showSponsoredTransactionTag}
        {renderPostConditionsCard()}
        <InfoContainer>
          <Title>{t('FUNCTION')}</Title>
          <Value>{request?.functionName}</Value>
        </InfoContainer>
        {functionArgsView()}
        {renderContractAddress}
        {showMoreButton}
      </>
    </ConfirmStxTransationComponent>
  );
}
