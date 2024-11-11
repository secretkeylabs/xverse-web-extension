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
}));

const IconOuterContainer = styled.div((_) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const IconContainer = styled.div((_) => ({
  position: 'relative',
}));

const TitleContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  margin: `${props.theme.space.s} ${props.theme.space.m}`,
}));

const AddressTypeContainer = styled.div((_) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '4px',
}));

const BalanceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  margin: `${props.theme.space.s} ${props.theme.space.m}`,
  flexGrow: 1,
}));

const StarIconContainer = styled.div((props) => ({
  position: 'absolute',
  right: '-8px',
  bottom: '4px',
  backgroundColor: props.theme.colors.elevation0,
  borderRadius: '50%',
  padding: '2.2px',
  display: 'flex',
  alignItems: 'center',
}));

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
      <TitleContainer>
        <AddressTypeContainer>
          <StyledP typography="body_bold_m">BTC</StyledP>
          {addressType && <BtcAddressTypeLabel addressType={addressType} />}
        </AddressTypeContainer>
        <StyledP typography="body_m" color="white_200">
          {totalBalance !== undefined ? `${balancePercentage}%` : ''}
        </StyledP>
      </TitleContainer>
      <BalanceContainer>
        <StyledP typography="body_bold_m">
          {balanceHidden ? HIDDEN_BALANCE_LABEL : satsToBtc(BigNumber(balance)).toString()}
        </StyledP>
        <StyledP typography="body_m" color="white_200">
          {balanceHidden ? (
            HIDDEN_BALANCE_LABEL
          ) : (
            <FiatAmountText
              fiatAmount={getBtcFiatEquivalent(BigNumber(balance), BigNumber(btcFiatRate))}
              fiatCurrency={fiatCurrency}
            />
          )}
        </StyledP>
      </BalanceContainer>
    </Container>
  );
}
