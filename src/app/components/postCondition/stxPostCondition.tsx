import { PostCondition } from '@stacks/transactions';
import PostConditionsView from './postConditionView';

interface Props {
  postCondition: PostCondition;
}
function StxPostConditionCard({ postCondition }: Props) {
  console.log("post con")
  console.log(postCondition)
  return (
    <PostConditionsView
      postCondition={postCondition}
    />
  );
}

export default StxPostConditionCard;
