import { isStarknetActive } from '@utils/constants';
import StepDisplay from './stepDisplay/stepDisplay';

export function SendStrkScreen() {
  if (!isStarknetActive) return null;

  return <StepDisplay />;
}
