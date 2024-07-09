import FiatAmountText from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useCoinRates from '@hooks/queries/useCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { getBtcFiatEquivalent, satsToBtc } from '@secretkeylabs/xverse-core';
import Avatar from '@ui-library/avatar';
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
}));

const NumberTypeContainer = styled.div`
  text-align: right;
`;

const AvatarContainer = styled.div`
  margin-right: ${(props) => props.theme.space.xs};
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
      <AvatarContainer>
        <Avatar src={<TokenImage currency="BTC" loading={false} size={32} />} />
      </AvatarContainer>
      <RowCenter spaceBetween>
        <div>
          <StyledP typography="body_medium_m" color="white_200">
            {t('CONFIRM_TRANSACTION.AMOUNT')}
          </StyledP>
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
          <FiatAmountText
            fiatAmount={getBtcFiatEquivalent(BigNumber(amount), BigNumber(btcFiatRate))}
            fiatCurrency={fiatCurrency}
            dataTestId="confirm-currency-amount"
          />
        </NumberTypeContainer>
      </RowCenter>
    </RowCenter>
  );
}
