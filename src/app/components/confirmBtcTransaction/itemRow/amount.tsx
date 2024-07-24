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

const RowCenter = styled.div<{ spaceBetween?: boolean }>((props) => ({
  display: 'flex',
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: props.spaceBetween ? 'space-between' : 'initial',
  columnGap: props.theme.space.m,
}));

const NumberTypeContainer = styled.div`
  text-align: right;
`;

const StyledFiatAmountText = styled(FiatAmountText)`
  display: block;
  ${(props) => props.theme.typography.body_medium_s}
  color: ${(props) => props.theme.colors.white_400};
  margin-top: ${(props) => props.theme.space.xxxs};
`;

const StyledBtcTitle = styled(StyledP)`
  margin-top: ${(props) => props.theme.space.xxxs};
`;

type Props = {
  amount: number;
};

export default function Amount({ amount }: Props) {
  const { fiatCurrency } = useWalletSelector();
  const { btcFiatRate } = useCoinRates();
  const { t } = useTranslation('translation');

  return (
    <RowCenter>
      <TokenImage currency="BTC" loading={false} size={32} />
      <RowCenter spaceBetween>
        <div>
          <StyledP typography="body_medium_m" color="white_0">
            {t('CONFIRM_TRANSACTION.AMOUNT')}
          </StyledP>
          <StyledBtcTitle typography="body_medium_s" color="white_400">
            Bitcoin
          </StyledBtcTitle>
        </div>
        <NumberTypeContainer>
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
          <StyledFiatAmountText
            fiatAmount={getBtcFiatEquivalent(BigNumber(amount), BigNumber(btcFiatRate))}
            fiatCurrency={fiatCurrency}
            dataTestId="confirm-currency-amount"
          />
        </NumberTypeContainer>
      </RowCenter>
    </RowCenter>
  );
}
