import Button from '@ui-library/button';
import SendLayout from 'app/layouts/sendLayout';
import { Container } from './common/container';

type Props = {
  onRetry: () => void;
  onBack: () => void;
};

export function SendError({ onBack, onRetry }: Props) {
  return (
    <SendLayout selectedBottomTab="dashboard" onClickBack={onBack}>
      <Container>
        <h1>Error</h1>
        <Button title="Try again" onClick={onRetry} />
      </Container>
    </SendLayout>
  );
}
