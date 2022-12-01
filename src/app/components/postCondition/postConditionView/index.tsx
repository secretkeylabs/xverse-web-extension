/* eslint-disable no-nested-ternary */
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import {
  addressToString,
  FungibleConditionCode,
  NonFungibleConditionCode,
  PostCondition,
} from '@stacks/transactions';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import RecipientAddressView from '@components/recipinetAddressView';
import Seperator from '@components/seperator';
import { useContext } from 'react';
import { ShowMoreContext } from '@components/transactionsRequests/ContractCallRequest';
import {
  getAmountFromPostCondition,
  getNameFromPostCondition,
  getSymbolFromPostCondition,
} from './helper';

const MainContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

const PostConditionContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(4),
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['400'],
  marginTop: 24,
  textTransform: 'uppercase',
}));

const TickerText = styled.h1((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white['0'],
}));

type Props = {
  postCondition: PostCondition;
};

function PostConditionsView({ postCondition }: Props) {
  const { stxAddress } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));
  const { t } = useTranslation('translation', { keyPrefix: 'POST_CONDITION_MESSAGE' });

  const getTitleFromConditionCode = (code: FungibleConditionCode | NonFungibleConditionCode) => {
    switch (code) {
      case FungibleConditionCode.Equal:
        return t('TRANSFER_EQUAL');
      case FungibleConditionCode.Greater:
        return t('TRANSFER_GREATER');
      case FungibleConditionCode.GreaterEqual:
        return t('TRANSFER_GREATER_EQUAL');
      case FungibleConditionCode.Less:
        return t('TRANSFER_LESS');
      case FungibleConditionCode.LessEqual:
        return t('TRANSFER_LESS_EQUAL');
      case NonFungibleConditionCode.DoesNotSend:
        return t('TRANSFER_DOES_NOT_OWN');
      case NonFungibleConditionCode.Sends:
        return t('will keep');
      default:
        return '';
    }
  };
  const title = getTitleFromConditionCode(postCondition.conditionCode) || '';
  const ticker = getSymbolFromPostCondition(postCondition);
  const name = getNameFromPostCondition(postCondition);
  const amount = getAmountFromPostCondition(postCondition) ?? '';
  const contractName = 'contractName' in postCondition.principal && postCondition.principal.contractName.content;
  const address = addressToString(postCondition.principal.address);
  const isSending = address === stxAddress;
  const isContractPrincipal = !!contractName || address.includes('.');
  const { showMore } = useContext(ShowMoreContext);

  function getPostConditionCodeMessage(
    code: FungibleConditionCode | NonFungibleConditionCode,
    isSender: boolean,
  ) {
    const sender = isSender ? t('YOU') : t('CONTRACT"');
    switch (code) {
      case FungibleConditionCode.Equal:
        return `${sender} ${t('EQUAL')}`;

      case FungibleConditionCode.Greater:
        return `${sender} ${t('GREATER')}`;

      case FungibleConditionCode.GreaterEqual:
        return `${sender} ${t('GREATER_EQUAL')}`;

      case FungibleConditionCode.Less:
        return `${sender} ${t('LESS')}`;

      case FungibleConditionCode.LessEqual:
        return `${sender} ${t('LESS_EQUAL')}`;

      case NonFungibleConditionCode.DoesNotOwn:
        return `${sender} ${t('DOES_NOT_OWN')}`;

      case NonFungibleConditionCode.Owns:
        return `${sender} ${t('OWN')}`;
      default:
        return '';
    }
  }

  return (
    <MainContainer>
      <Title>
        {`${
          isContractPrincipal ? t('CONTRACT') : isSending ? t('YOU') : t('ANOTHER_ADDRESS')
        } ${title}`}
      </Title>
      <PostConditionContainer>
        <TickerText>{`${amount} ${ticker}`}</TickerText>
        {name !== 'STX' && <TickerText>{name}</TickerText>}
        {showMore && (
        <>
          <RecipientAddressView
            recipient={`${address}${contractName ? `.${contractName}` : ''}`}
            title={`${isContractPrincipal
              ? t('CONTRACT_ADDRESS')
              : isSending
                ? t('MY_ADDRESS')
                : t('RECEPIENT_ADDRESS')}`}
          />
          <Seperator />
        </>
        )}
      </PostConditionContainer>
    </MainContainer>
  );
}
export default PostConditionsView;
