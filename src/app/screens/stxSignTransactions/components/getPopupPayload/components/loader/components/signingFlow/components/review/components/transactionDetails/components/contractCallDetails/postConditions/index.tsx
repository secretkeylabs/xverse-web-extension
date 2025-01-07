/* eslint-disable no-restricted-syntax */

import { PostConditionType, StacksTransaction, type PostCondition } from '@stacks/transactions';
import { StxPostCondition } from './components/stxPostCondition/stxPostCondition';
import { FTPostCondition } from './fungibleTokenPostCondition';
import { NFTPostCondition } from './nftPostCondition';

export function PostConditionsDetails({ transaction }: { transaction: StacksTransaction }) {
  const postConditions = transaction.postConditions.values as PostCondition[];
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
