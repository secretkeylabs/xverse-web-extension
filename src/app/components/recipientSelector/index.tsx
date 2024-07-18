import useWalletSelector from '@hooks/useWalletSelector';
import { StyledCallout } from '@screens/createInscription/index.styled';
import { validateBtcAddress } from '@secretkeylabs/xverse-core';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1 1 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const Buttons = styled.div`
  margin: ${(props) => props.theme.spacing(12)}px 0;
`;

type Props = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  onNext: () => void;
  isLoading: boolean;
  header?: React.ReactNode;
  calloutText?: string;
  insufficientFunds?: boolean;
};

function RecipientSelector({
  recipientAddress,
  setRecipientAddress,
  onNext,
  isLoading,
  header,
  calloutText,
  insufficientFunds,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { network } = useWalletSelector();
  const [addressIsValid, setAddressIsValid] = useState(true);
  const [displayInsufficientFunds, setDisplayInsufficientFunds] = useState(false);

  const handleNext = () => {
    if (insufficientFunds) {
      setDisplayInsufficientFunds(true);
      return;
    }
    if (validateBtcAddress({ btcAddress: recipientAddress, network: network.type })) {
      onNext();
    } else {
      setAddressIsValid(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    setAddressIsValid(true);
    setDisplayInsufficientFunds(false);
  };

  const inputFeedback = useMemo(() => {
    if (!addressIsValid) {
      return [
        {
          variant: 'danger' as const,
          message: t('ERRORS.ADDRESS_INVALID'),
        },
      ];
    }
    if (displayInsufficientFunds) {
      return [
        {
          variant: 'danger' as const,
          message: t('ERRORS.INSUFFICIENT_BALANCE_FEES'),
        },
      ];
    }
  }, [addressIsValid, displayInsufficientFunds]);

  return (
    <Container>
      <div>
        {header}
        <Input
          dataTestID="address-receive"
          title={t('RECIPIENT')}
          placeholder={t('BTC.RECIPIENT_PLACEHOLDER')}
          value={recipientAddress}
          onChange={handleAddressChange}
          variant={addressIsValid ? 'default' : 'danger'}
          feedback={inputFeedback}
          autoFocus
        />
      </div>
      {calloutText && <StyledCallout bodyText={calloutText} />}
      <Buttons>
        <Button
          title={t('NEXT')}
          onClick={handleNext}
          disabled={displayInsufficientFunds || !recipientAddress || !addressIsValid}
          loading={isLoading}
        />
      </Buttons>
    </Container>
  );
}

export default RecipientSelector;
