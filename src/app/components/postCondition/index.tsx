/* eslint-disable no-nested-ternary */
import { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import { addressToString, PostCondition } from '@stacks/transactions';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
  getNameFromPostCondition,
  getPostConditionTitle,
  getSymbolFromPostCondition,
} from './helper';

const MainContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  height: '100%',
}));

const Title = styled.h1((props) => ({
  ...props.theme.headline_category_s,
  color: props.theme.colors.white['200'],
  marginTop: 24,
}));

type Props = {
  postCondition: PostCondition;
  showMore: boolean;
};

function PostConditionsView({ postCondition, showMore }: Props) {
  const { stxAddress } = useSelector((state: StoreState) => ({
    ...state.walletState,
  }));
  const title = getPostConditionTitle(postCondition);
  const ticker = getSymbolFromPostCondition(postCondition);
  const name = getNameFromPostCondition(postCondition);
  const contractName = 'contractName' in postCondition.principal && postCondition.principal.contractName.content;
  const address = addressToString(postCondition.principal.address);
  const isReceiving = address === stxAddress;
  const isContractPrincipal = !!contractName || address.includes('.');

  const { t } = useTranslation('translation', { keyPrefix: 'POST_CONDITION_COMPONENT' });

  return (
    <MainContainer>
      <Title>
        {`${
          isContractPrincipal
            ? t('post_condition_message.contract')
            : isReceiving
              ? t('post_condition_message.you')
              : t('post_condition_message.another_address')
        } ${title}`}
      </Title>
      {/* <div>
        <div style={{ flex: 1 }}>
          <p>{`${amount} ${ticker}`}</p>
          {name !== 'STX' && <Text style={styles.name}>{name}</Text>}
          {showMore && (
            <>
              <RedirectAddress
                title={`${
                  isContractPrincipal
                    ? t('post_condition_message.contract_address')
                    : isReceiving
                    ? t('post_condition_message.my_address')
                    : t('post_condition_message.recepient_address')
                }`}
                address={`${address}${!!contractName ? `.${contractName}` : ''}`}
              />
              <div style={styles.seperator} />
            </>
          )}
        </div>
      </div> */}
    </MainContainer>
  );
}
export default PostConditionsView;
