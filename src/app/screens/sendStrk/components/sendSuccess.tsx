import Button from '@ui-library/button';
import { StyledP } from '@ui-library/common.styled';
import Link from '@ui-library/link';
import styled from 'styled-components';

type Props = {
  transactionHash: string;
  onDone: () => void;
};

const Container = styled.div({
  paddingInline: '1rem',
  paddingBlockStart: '2rem',

  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
});

// https://voyager.online/tx/0x58415852e41dce3f7bf4e47107351a2b9dd6ffee81649b7b2a212fe694deb70

export function SendSuccess({ transactionHash, onDone }: Props) {
  return (
    <Container>
      <StyledP typography="headline_s">Success</StyledP>

      <p>Transaction successfully broadcast</p>
      <div>
        <Link
          href={`https://voyager.online/tx/${transactionHash}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          View in explorer
        </Link>
      </div>

      <Button title="Done" onClick={onDone} />
    </Container>
  );
}
