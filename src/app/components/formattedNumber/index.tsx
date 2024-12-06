import type { FormattedBalance } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

const Container = styled.div`
  display: inline-flex;
`;

const Subscript = styled.span`
  padding-top: 8px;
  font-size: 0.7em;
`;

type FormattedNumberProps = {
  number: FormattedBalance;
  tokenSymbol?: string;
};

function FormattedNumber({ number, tokenSymbol }: FormattedNumberProps) {
  const { prefix, suffix } = number;
  return (
    <Container>
      {prefix}
      {suffix && (
        <>
          <Subscript>{suffix.subscript}</Subscript>
          {suffix.value}
        </>
      )}
      {tokenSymbol && ` ${tokenSymbol}`}
    </Container>
  );
}

export default FormattedNumber;
