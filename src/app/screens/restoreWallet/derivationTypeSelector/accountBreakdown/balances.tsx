import TokenImage from '@components/tokenImage';
import { microstacksToStx, satsToBtc } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.space.xs};
  align-items: center;
`;

const BalanceContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: ${({ theme }) => theme.space.xxs};
  align-items: center;
`;

type Props = {
  btc: bigint;
  stx: bigint;
  typography?: 'body_medium_m' | 'body_medium_s';
  color?: 'white_200' | 'white_400';
  exact?: boolean;
};

function Balances({ btc, stx, exact, typography = 'body_medium_m', color = 'white_200' }: Props) {
  const btcAmount = satsToBtc(BigNumber(btc.toString()));
  const stxAmount = microstacksToStx(BigNumber(stx.toString()));

  const hasBtc = btcAmount.isGreaterThan(0);
  const hasStx = stxAmount.isGreaterThan(0);

  if (!hasBtc && !hasStx) {
    return null;
  }

  return (
    <Container>
      {hasBtc && (
        <BalanceContainer>
          <TokenImage currency="BTC" size={16} />
          <StyledP typography={typography} color={color}>
            {exact ? '' : '~'}
            {btcAmount.toString()} BTC
          </StyledP>
        </BalanceContainer>
      )}
      {hasStx && (
        <BalanceContainer>
          <TokenImage currency="STX" size={16} />
          <StyledP typography={typography} color={color}>
            {exact ? '' : '~'}
            {stxAmount.toString()} STX
          </StyledP>
        </BalanceContainer>
      )}
    </Container>
  );
}

export default Balances;
