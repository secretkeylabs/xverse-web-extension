import { AddressTypeSelectors } from '@components/preferredBtcAddress';
import useBtcAddressBalance from '@hooks/useBtcAddressBalance';
import useSelectedAccount from '@hooks/useSelectedAccount';
import useWalletSelector from '@hooks/useWalletSelector';
import type { BtcPaymentType } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Spinner from '@ui-library/spinner';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Title = styled.div`
  ${(props) => props.theme.typography.headline_xs}
  margin-bottom: ${(props) => props.theme.space.l};
`;

const Description = styled.div`
  color: ${(props) => props.theme.colors.white_200};
  margin-bottom: ${(props) => props.theme.space.l};
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.space.l} 0;
`;

type Props = {
  overridePaymentType: BtcPaymentType;
  setOverridePaymentType: (paymentType: BtcPaymentType) => void;
  onNext: () => void;
  onSkipDetected: () => void;
};

export default function AccountSelector({
  overridePaymentType,
  setOverridePaymentType,
  onNext,
  onSkipDetected,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const { btcPaymentAddressType } = useWalletSelector();
  const selectedAccount = useSelectedAccount();
  const { isLoading, data } = useBtcAddressBalance(
    selectedAccount.btcAddresses.nested?.address || '',
  );

  const showLoader = btcPaymentAddressType === 'native' && isLoading;

  if (showLoader) {
    return (
      <SpinnerContainer>
        <Spinner />
      </SpinnerContainer>
    );
  }

  const shouldSkip =
    btcPaymentAddressType === 'native' && !isLoading && data?.confirmedBalance === 0;

  if (shouldSkip) {
    onSkipDetected();
    onNext();
    return null;
  }

  return (
    <Container>
      <div>
        <Title>{t('BTC.SELECT_ADDRESS_TYPE')}</Title>
        <Description>{t('BTC.SELECT_ADDRESS_TYPE_DESCRIPTION')}</Description>
        <AddressTypeSelectors
          selectedType={overridePaymentType}
          setSelectedType={setOverridePaymentType}
        />
      </div>
      <Buttons>
        <Button title={t('NEXT')} onClick={onNext} />
      </Buttons>
    </Container>
  );
}
