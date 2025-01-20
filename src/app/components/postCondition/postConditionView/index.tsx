/* eslint-disable no-nested-ternary */
import {
  Address,
  deserializeAddress,
  FungibleConditionCode,
  NonFungibleConditionCode,
  serializePrincipal,
  type PostConditionWire,
} from '@stacks/transactions';
import { useTranslation } from 'react-i18next';

import TransferAmountComponent from '@components/transferAmountComponent';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { getNameFromPostCondition, getSymbolFromPostCondition } from './helper';

type Props = {
  postCondition: PostConditionWire;
  amount: string;
  icon?: string;
};

function PostConditionsView({ postCondition, amount, icon }: Props) {
  const { stxAddress } = useSelectedAccount();
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
      case NonFungibleConditionCode.Sends:
        return t('TRANSFER_DOES_NOT_OWN');
      case NonFungibleConditionCode.DoesNotSend:
        return t('TRANSFER_OWN');
      default:
        return '';
    }
  };
  const title = getTitleFromConditionCode(postCondition.conditionCode) || '';
  const ticker = getSymbolFromPostCondition(postCondition);
  const name = getNameFromPostCondition(postCondition);
  const contractName =
    'contractName' in postCondition.principal && postCondition.principal.contractName.content;
  const address = deserializeAddress(serializePrincipal(postCondition?.principal));
  const addressString = Address.stringify(address);
  const isSending = addressString === stxAddress;
  const isContractPrincipal = !!contractName || addressString.includes('.');
  return (
    <TransferAmountComponent
      title={`${
        isContractPrincipal ? t('CONTRACT') : isSending ? t('YOU') : t('ANOTHER_ADDRESS')
      } ${title}`}
      value={`${amount} ${ticker}`}
      subValue={name !== 'STX' ? name : ''}
      icon={icon}
      address={`${addressString}${contractName ? `.${contractName}` : ''}`}
      subTitle={`${
        isContractPrincipal
          ? t('CONTRACT_ADDRESS')
          : isSending
          ? t('MY_ADDRESS')
          : t('RECIPIENT_ADDRESS')
      }`}
    />
  );
}
export default PostConditionsView;
