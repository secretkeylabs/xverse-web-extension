import { Coin } from '@secretkeylabs/xverse-core';
import { PostCondition } from '@stacks/transactions';
import { ftDecimals } from '@utils/helper';
import PostConditionsView from './postConditionView';
import { getAmountFromPostCondition } from './postConditionView/helper';

interface Props {
  postCondition: PostCondition;
  ftMetaData?: Coin;
}
function FtPostConditionCard({ postCondition, ftMetaData }: Props) {
  const amount = ftDecimals(
    getAmountFromPostCondition(postCondition) ?? 0,
    ftMetaData?.decimals ?? 0,
  );
  return (
    <PostConditionsView postCondition={postCondition} amount={amount} icon={ftMetaData?.image} />
  );
}

export default FtPostConditionCard;
