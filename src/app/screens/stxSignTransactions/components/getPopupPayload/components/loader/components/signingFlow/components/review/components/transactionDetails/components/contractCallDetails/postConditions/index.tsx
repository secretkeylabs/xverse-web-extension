/* eslint-disable no-restricted-syntax */

import {
  type PostConditionWire,
  type StacksTransactionWire,
  PostConditionType,
} from '@stacks/transactions';
import { StxPostCondition } from './components/stxPostCondition/stxPostCondition';
import { FTPostCondition } from './fungibleTokenPostCondition';
import { NFTPostCondition } from './nftPostCondition';

export function PostConditionsDetails({ transaction }: { transaction: StacksTransactionWire }) {
  const postConditions = transaction.postConditions.values as PostConditionWire[];
  const postConditionElements: JSX.Element[] = [];

  for (const pc of postConditions) {
    switch (pc.conditionType) {
      case PostConditionType.STX: {
        postConditionElements.push(
          <StxPostCondition postCondition={pc} transaction={transaction} />,
        );
        break;
      }

      case PostConditionType.Fungible: {
        postConditionElements.push(<FTPostCondition />);
        break;
      }

      case PostConditionType.NonFungible: {
        postConditionElements.push(<NFTPostCondition />);
        break;
      }

      default:
        break;
    }
  }

  return postConditionElements;
}
