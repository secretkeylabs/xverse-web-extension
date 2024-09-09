import FiatAmountText from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import BigNumber from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div<{ spaceBetween?: boolean }>((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.space.s,
}));

const StyledFiatAmountText = styled(FiatAmountText)`
  display: block;
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
  margin-top: ${(props) => props.theme.space.xxxs};
`;

const Column = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 24px;
`;

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.m};
`;

type Props = {
  amount: number;
};

export default function Amount({ amount }: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const { t } = useTranslation('translation');

  if (!amount) return null;

  return (
    <Container>
      <AvatarContainer>
        <TokenImage currency="BTC" loading={false} size={32} />
      </AvatarContainer>
      <Column>
        <Row>
          <StyledP typography="body_medium_m" color="white_0">
            {t('CONFIRM_TRANSACTION.AMOUNT')}
          </StyledP>
          <NumericFormat
            value={satsToBtc(new BigNumber(amount)).toFixed()}
            displayType="text"
            thousandSeparator
            suffix=" BTC"
            renderText={(value: string) => (
              <StyledP typography="body_medium_m" data-testid="confirm-total-amount">
                {value}
              </StyledP>
            )}
          />
        </Row>
        <Row>
          <StyledP typography="body_medium_s" color="white_400">
            Bitcoin
          </StyledP>
          <StyledFiatAmountText
            fiatAmount={getBtcFiatEquivalent(BigNumber(amount), BigNumber(btcFiatRate))}
            fiatCurrency={fiatCurrency}
            dataTestId="confirm-currency-amount"
          />
        </Row>
      </Column>
    </Container>
  );
}
