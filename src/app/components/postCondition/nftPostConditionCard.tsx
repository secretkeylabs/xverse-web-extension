import AssetIcon from '@assets/img/transactions/Assets.svg';
import type { PostCondition } from '@stacks/transactions';
import PostConditionsView from './postConditionView';
import { getAmountFromPostCondition } from './postConditionView/helper';

interface Props {
  postCondition: PostCondition;
}
function NftPostConditionCard({ postCondition }: Props) {
  const amount = getAmountFromPostCondition(postCondition) ?? '';
  return <PostConditionsView postCondition={postCondition} amount={amount} icon={AssetIcon} />;
}

export default NftPostConditionCard;
