import useSelectedAccountBtcBalance from '@hooks/queries/useSelectedAccountBtcBalance';
import useWalletSelector from '@hooks/useWalletSelector';
import Spinner from '@ui-library/spinner';
import styled from 'styled-components';
import { SecondaryContainer } from '../../index.styled';
import AddressBalance from './addressBalance';

const SpinnerContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default function BalanceBreakdown() {
  const { btcPaymentAddressType } = useWalletSelector();
  const { confirmedBalance, nativeBalance, nestedBalance, taprootBalance, isLoading } =
    useSelectedAccountBtcBalance();

  if (isLoading) {
    return (
      <SecondaryContainer data-testid="btc-secondary-container">
        <SpinnerContainer>
          <Spinner color="white" size={25} />
        </SpinnerContainer>
      </SecondaryContainer>
    );
  }

  const showNested = btcPaymentAddressType === 'nested' || nestedBalance?.confirmedBalance !== 0;

  return (
    <SecondaryContainer data-testid="btc-secondary-container">
      <AddressBalance
        balance={nativeBalance?.confirmedBalance}
        addressType="native"
        totalBalance={confirmedBalance}
      />
      {showNested && (
        <AddressBalance
          balance={nestedBalance?.confirmedBalance}
          addressType="nested"
          totalBalance={confirmedBalance}
        />
      )}
      <AddressBalance
        balance={taprootBalance?.confirmedBalance}
        addressType="taproot"
        totalBalance={confirmedBalance}
      />
    </SecondaryContainer>
  );
}
