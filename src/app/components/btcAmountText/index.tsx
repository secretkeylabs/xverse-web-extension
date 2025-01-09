import { BTC_SYMBOL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import { NumericFormat } from 'react-number-format';
import styled from 'styled-components';

const AmountText = styled.div`
  ${(props) => props.theme.typography.body_medium_m}
  color: ${(props) => props.theme.colors.white_200};
`;

type Props = {
  className?: string;
  btcAmount?: string;
};

function BtcAmountText({ className, btcAmount }: Props) {
  if (!btcAmount) {
    return null;
  }

  if (BigNumber(btcAmount).isEqualTo(0)) {
    return <AmountText className={className}>{`${BTC_SYMBOL}0.00`}</AmountText>;
  }

  if (BigNumber(btcAmount).lt(0.00000014)) {
    return <AmountText className={className}>{`< ${BTC_SYMBOL}0.00000014`}</AmountText>;
  }
  return (
    <NumericFormat
      value={btcAmount}
      displayType="text"
      prefix={BTC_SYMBOL}
      thousandSeparator
      renderText={(value: string) => <AmountText>{value}</AmountText>}
    />
  );
}

export default BtcAmountText;
