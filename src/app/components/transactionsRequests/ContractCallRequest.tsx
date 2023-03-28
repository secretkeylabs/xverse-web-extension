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
  PostConditionType,
  SomeCV,
  StacksTransaction,
} from '@stacks/transactions';
import {
  addressToString,
  broadcastSignedTransaction,
  Coin,
  extractFromPayload,
} from '@secretkeylabs/xverse-core';
import RedirectAddressView from '@components/redirectAddressView';
import { useNavigate } from 'react-router-dom';
import { Args, ContractFunction } from '@secretkeylabs/xverse-core/types/api/stacks/transaction';
import FtPostConditionCard from '@components/postCondition/ftPostConditionCard';
import NftPostConditionCard from '@components/postCondition/nftPostConditionCard';
import AccountHeaderComponent from '@components/accountHeader';
import useOnOriginTabClose from '@hooks/useOnTabClosed';
import InfoContainer from '@components/infoContainer';
import useNetworkSelector from '@hooks/useNetwork';
import finalizeTxSignature from './utils';

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
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

const FuncArgContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
});

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: props.theme.spacing(12),
}));

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
  tabId: number;
  requestToken: string;
}

export const ShowMoreContext = createContext({ showMore: false });

export default function ContractCallRequest(props: ContractCallRequestProps) {
  const {
    request, unsignedTx, funcMetaData, coinsMetaData, tabId, requestToken,
  } = props;
  const selectedNetwork = useNetworkSelector();
  const [hasTabClosed, setHasTabClosed] = useState(false);
  const { t } = useTranslation('translation');
  const [isShowMore, setIsShowMore] = useState(false);
  const Illustration = headerImageMapping[request.functionName ?? ''];

  useOnOriginTabClose(
    tabId,
    () => {
      setHasTabClosed(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  );

  const showMoreButton = (
    <ShowMoreButtonContainer>
      <Line />
      <ButtonContainer>
        <ShowMoreButton onClick={() => setIsShowMore(!isShowMore)}>
          <ButtonText>{isShowMore ? t('CONTRACT_CALL_REQUEST.SHOW_LESS') : t('CONTRACT_CALL_REQUEST.SHOW_MORE')}</ButtonText>
          <ButtonSymbolText>{isShowMore ? t('CONTRACT_CALL_REQUEST.MINUS') : t('CONTRACT_CALL_REQUEST.PLUS')}</ButtonSymbolText>
        </ShowMoreButton>
      </ButtonContainer>
    </ShowMoreButtonContainer>
  );

  const renderContractAddress = isShowMore && (
    <RedirectAddressView recipient={request.contractAddress} title={t('CONTRACT_CALL_REQUEST.CONTRACT_ADDRESS')} />
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
      return args.map((arg, index) => (
        <FuncArgContainer>
          <Title>{arg.name}</Title>
          <Value>{arg.value}</Value>
          <Detail>{arg.type}</Detail>
        </FuncArgContainer>
      ));
    }
  };

  const showSponsoredTransactionTag = (
    <SponsoredContainer>
      <SponsoredTag>
        <SponosredText>{t('CONTRACT_CALL_REQUEST.SPONSORED')}</SponosredText>
      </SponsoredTag>
    </SponsoredContainer>
  );

  const postConditionAlert = unsignedTx?.postConditionMode === 2
    && unsignedTx?.postConditions.values.length <= 0 && (
      <PostConditionContainer>
        <PostConditionAlertText>{t('CONTRACT_CALL_REQUEST.POST_CONDITION_ALERT')}</PostConditionAlertText>
      </PostConditionContainer>
  );
  const navigate = useNavigate();
  const broadcastTx = async (tx: StacksTransaction[]) => {
    try {
      const broadcastResult: string = await broadcastSignedTransaction(tx[0], selectedNetwork);
      if (broadcastResult) {
        finalizeTxSignature({ requestPayload: requestToken, tabId, data: { txId: broadcastResult, txRaw: tx[0].serialize().toString('hex') } });
        navigate('/tx-status', {
          state: {
            txid: broadcastResult,
            currency: 'STX',
            error: '',
            browserTx: true,
          },
        });
      }
    } catch (e) {
      if (e instanceof Error) {
        navigate('/tx-status', {
          state: {
            txid: '',
            currency: 'STX',
            error: e.message,
            browserTx: true,
          },
        });
      }
    }
  };

  const confirmCallback = (transactions: StacksTransaction[]) => {
    if (request?.sponsored) {
      navigate('/tx-status', {
        state: {
          sponsored: true,
          browserTx: true,
        },
      });
    } else {
      broadcastTx(transactions);
    }
  };
  const cancelCallback = () => {
    finalizeTxSignature({ requestPayload: requestToken, tabId, data: 'cancel' });
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
            (coin: Coin) => coin.contract
              === `${addressToString(postCondition.assetInfo.address)}.${
                postCondition.assetInfo.contractName.content
              }`,
          );
          return (
            <FtPostConditionCard key={i} postCondition={postCondition} ftMetaData={coinInfo} />
          );
        case PostConditionType.NonFungible:
          return <NftPostConditionCard key={i} postCondition={postCondition} />;
        default:
          return '';
      }
    });
  };

  return (
    <>
      <AccountHeaderComponent disableMenuOption disableAccountSwitch />
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
          {hasTabClosed && <InfoContainer titleText={t('WINDOW_CLOSED_ALERT.TITLE')} bodyText={t('WINDOW_CLOSED_ALERT.BODY')} />}

          {postConditionAlert}
          {request.sponsored && showSponsoredTransactionTag}
          {renderPostConditionsCard()}
          <FuncArgContainer>
            <Title>{t('CONTRACT_CALL_REQUEST.FUNCTION')}</Title>
            <Value>{request?.functionName}</Value>
          </FuncArgContainer>
          {functionArgsView()}
          {renderContractAddress}
          {showMoreButton}
        </>
      </ConfirmStxTransationComponent>
    </>
  );
}
