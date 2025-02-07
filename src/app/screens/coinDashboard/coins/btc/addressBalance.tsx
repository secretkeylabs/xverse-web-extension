import { BtcAddressTypeLabel } from '@components/btcAddressTypeLabel';
import FiatAmountText from '@components/fiatAmountText';
import TokenImage from '@components/tokenImage';
import useSupportedCoinRates from '@hooks/queries/useSupportedCoinRates';
import useWalletSelector from '@hooks/useWalletSelector';
import { Star } from '@phosphor-icons/react';
import { getBtcFiatEquivalent, satsToBtc, type BtcAddressType } from '@secretkeylabs/xverse-core';
import { StyledP } from '@ui-library/common.styled';
import { HIDDEN_BALANCE_LABEL } from '@utils/constants';
import BigNumber from 'bignumber.js';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  marginBottom: props.theme.space.m,
  alignItems: 'center',
}));

const IconOuterContainer = styled.div((props) => ({
  display: 'flex',
  marginRight: props.theme.space.m,
}));

const IconContainer = styled.div((_) => ({
  position: 'relative',
}));

const StarIconContainer = styled.div((props) => ({
  position: 'absolute',
  right: '-8px',
  bottom: '4px',
  backgroundColor: props.theme.colors.elevation0,
  borderRadius: '50%',
  padding: '2.2px',
  display: 'flex',
}));

const RowContainers = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const RowContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.m,
  justifyContent: 'center',
}));

const AddressTypeContainer = styled.div((_) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'flex-start',
  gap: '4px',
}));

const BalanceContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  ${(props) => props.theme.typography.body_bold_m};
`;

const BalancePercentageContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: flex-start;
  ${(props) => props.theme.typography.body_m};
  color: ${(props) => props.theme.colors.white_200};
`;

const CurrencyBalanceContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  ${(props) => props.theme.typography.body_m};
  color: ${(props) => props.theme.colors.white_200};
`;

type AddressBalanceProps = {
  balance: number | undefined;
  addressType: BtcAddressType | undefined;
  totalBalance?: number | undefined;
};

export default function AddressBalance({
  balance,
  addressType,
  totalBalance,
}: AddressBalanceProps) {
  const { fiatCurrency, btcPaymentAddressType, balanceHidden } = useWalletSelector();
  const { btcFiatRate } = useSupportedCoinRates();

  if (balance === undefined) {
    return null;
  }

  const balancePercentage =
    balance && totalBalance
      ? BigNumber(balance).div(totalBalance).multipliedBy(100).toFixed(2)
      : '0.00';

  const isCurrentPaymentAddress = addressType === btcPaymentAddressType;

  return (
    <Container>
      <IconOuterContainer>
        <IconContainer>
          <TokenImage size={32} currency="BTC" />
          {isCurrentPaymentAddress && (
            <StarIconContainer>
              <Star weight="fill" fill="white" size={12} />
            </StarIconContainer>
          )}
        </IconContainer>
      </IconOuterContainer>
      <RowContainers>
        <RowContainer>
          <AddressTypeContainer>
            <StyledP typography="body_bold_m">BTC</StyledP>
            {addressType && <BtcAddressTypeLabel addressType={addressType} />}
          </AddressTypeContainer>
          <BalanceContainer>
            {balanceHidden ? HIDDEN_BALANCE_LABEL : satsToBtc(BigNumber(balance)).toString()}
          </BalanceContainer>
        </RowContainer>
        <RowContainer>
          <BalancePercentageContainer>
            {totalBalance !== undefined ? `${balancePercentage}%` : ''}
          </BalancePercentageContainer>
          <CurrencyBalanceContainer>
            {balanceHidden ? (
              HIDDEN_BALANCE_LABEL
            ) : (
              <FiatAmountText
                fiatAmount={getBtcFiatEquivalent(BigNumber(balance), BigNumber(btcFiatRate))}
                fiatCurrency={fiatCurrency}
              />
            )}
          </CurrencyBalanceContainer>
        </RowContainer>
      </RowContainers>
    </Container>
  );
}
