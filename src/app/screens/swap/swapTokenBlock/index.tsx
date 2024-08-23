import ChevronIcon from '@assets/img/swap/chevron.svg';
import TokenImage from '@components/tokenImage';
import useWalletSelector from '@hooks/useWalletSelector';
import { type SwapToken } from '@screens/swap/types';
import { currencySymbolMap } from '@secretkeylabs/xverse-core';
import { EMPTY_LABEL } from '@utils/constants';
import { useTranslation } from 'react-i18next';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.spacing(4),
}));

const RowContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
});

const TitleText = styled.h3((props) => ({
  ...props.theme.body_medium_m,
  flex: 1,
  display: 'flex',
}));

const Text = styled.p((props) => ({
  ...props.theme.body_medium_m,
}));

const BalanceText = styled.label((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  marginRight: props.theme.spacing(2),
}));

const CardContainer = styled.div<{ error?: boolean }>((props) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: props.theme.spacing(3),
  background: props.theme.colors.elevation_n1,
  border: '1px solid',
  'border-color': props.error
    ? props.theme.colors.feedback.error_700
    : props.theme.colors.elevation2,
  borderRadius: 8,
  padding: props.theme.spacing(8),
  ':focus-within': {
    border: '1px solid',
    'border-color': props.error
      ? props.theme.colors.feedback.error_700
      : props.theme.colors.elevation6,
  },
}));

const CoinButtonContainer = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  columnGap: props.theme.spacing(2),
  background: 'transparent',
  alignItems: 'center',
  minHeight: '28px', // same as icon height
}));

const CoinButtonArrow = styled.img({
  width: 12,
  height: 12,
});

const NumberInput = styled.input`
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;
const AmountInput = styled(NumberInput)<{ error?: boolean }>((props) => ({
  ...props.theme.body_bold_l,
  flex: 1,
  color: props.error ? props.theme.colors.feedback.error : props.theme.colors.white_0,
  marginLeft: props.theme.spacing(2),
  textAlign: 'right',
  backgroundColor: 'transparent',
  border: 'transparent',
  width: '100%',
}));

const CoinText = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const EstimateUSDText = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
  marginLeft: 'auto',
}));

type SwapTokenBlockProps = {
  title: string;
  selectedCoin?: SwapToken;
  amount?: string;
  onAmountChange?: (amount: string) => void;
  onSelectCoin?: () => void;
  error?: boolean;
};

function SwapTokenBlock({
  title,
  selectedCoin,
  amount,
  onAmountChange,
  onSelectCoin,
  error,
}: SwapTokenBlockProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const { fiatCurrency } = useWalletSelector();

  return (
    <Container>
      <RowContainer>
        <TitleText>{title}</TitleText>
        <BalanceText>{t('BALANCE')}:</BalanceText>
        <Text data-testid="swap-token-balance">{selectedCoin?.balance ?? EMPTY_LABEL}</Text>
      </RowContainer>
      <CardContainer error={error}>
        <RowContainer>
          <CoinButtonContainer data-testid="select-coin-button" onClick={onSelectCoin}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            {selectedCoin && <TokenImage {...selectedCoin?.image} showProtocolIcon={false} />}
            <CoinText data-testid="coin-text">{selectedCoin?.name ?? t('SELECT_COIN')}</CoinText>
            <CoinButtonArrow src={ChevronIcon} />
          </CoinButtonContainer>
          <AmountInput
            data-testid="swap-amount"
            error={error}
            placeholder="0"
            disabled={onAmountChange == null}
            value={amount ?? selectedCoin?.amount?.toString() ?? ''}
            onChange={(e) => onAmountChange?.(e.target.value)}
            type="number"
          />
        </RowContainer>
        <RowContainer>
          <NumericFormat
            value={selectedCoin?.fiatAmount ?? EMPTY_LABEL}
            displayType="text"
            thousandSeparator
            prefix={`${currencySymbolMap[fiatCurrency]}`}
            suffix={` ${fiatCurrency}`}
            renderText={(value) => (
              <EstimateUSDText data-testid="usd-text">{value}</EstimateUSDText>
            )}
          />
        </RowContainer>
      </CardContainer>
    </Container>
  );
}

export default SwapTokenBlock;
