import InputScreen from '@components/inputScreen';
import useWalletSelector from '@hooks/useWalletSelector';
import { validateBtcAddress } from '@secretkeylabs/xverse-core';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

type BtcRecipientScreenProps = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  onNext: () => void;
  isLoading: boolean;
  header?: React.ReactNode;
};

interface InputFeedback {
  variant: 'danger';
  message: string;
}

interface Input {
  title: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  variant: 'danger' | 'default';
  feedback: InputFeedback[];
}

function BtcRecipientScreen({
  recipientAddress,
  setRecipientAddress,
  onNext,
  isLoading,
  header,
}: BtcRecipientScreenProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { network } = useWalletSelector();
  const [addressIsValid, setAddressIsValid] = useState(true);

  const handleNext = () => {
    if (validateBtcAddress({ btcAddress: recipientAddress, network: network.type })) {
      onNext();
    } else {
      setAddressIsValid(false);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipientAddress(e.target.value);
    setAddressIsValid(true);
  };

  const inputFeedback: InputFeedback[] = useMemo(() => {
    if (addressIsValid) {
      return [];
    }
    return [
      {
        variant: 'danger',
        message: t('ERRORS.ADDRESS_INVALID'),
      },
    ];
  }, [addressIsValid, t]);

  const inputs: Input[] = [
    {
      title: t('RECIPIENT'),
      placeholder: t('BTC.RECIPIENT_PLACEHOLDER'),
      value: recipientAddress,
      onChange: handleAddressChange,
      variant: addressIsValid ? 'default' : 'danger',
      feedback: inputFeedback,
    },
  ];

  const buttons = [
    {
      title: t('NEXT'),
      onClick: handleNext,
      disabled: !recipientAddress || !addressIsValid,
      loading: isLoading,
    },
  ];

  return <InputScreen inputs={inputs} buttons={buttons} header={header} />;
}

export default BtcRecipientScreen;
