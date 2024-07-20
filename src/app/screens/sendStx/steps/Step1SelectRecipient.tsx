import InputScreen from '@components/inputScreen';
import { useBnsName, useBnsResolver } from '@hooks/queries/useBnsName';
import useDebounce from '@hooks/useDebounce';
import useSelectedAccount from '@hooks/useSelectedAccount';
import { validateStacksAddress } from '@stacks/transactions';
import Button from '@ui-library/button';
import Input from '@ui-library/input';
import type { FeedbackVariant } from '@ui-library/inputFeedback';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const MemoInput = styled(Input)`
  input {
    height: 64px;
    padding-top: 0px;
  }
`;

const RecipientInput = styled(Input)`
  margin-bottom: ${(props) => props.theme.space.l};
`;

type InputFeedback = {
  variant: FeedbackVariant;
  message: string;
};

type Props = {
  dataTestID?: string;
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  setRecipientDomain: (address: string) => void;
  memo: string;
  setMemo: (memo: string) => void;
  onNext: () => void;
  isLoading: boolean;
  header?: React.ReactNode;
};

function Step1SelectRecipient({
  dataTestID,
  recipientAddress,
  setRecipientAddress,
  setRecipientDomain,
  memo,
  setMemo,
  onNext,
  isLoading,
  header,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });
  const { stxAddress } = useSelectedAccount();
  const [recipient, setRecipient] = useState(recipientAddress);
  const [inputFeedback, setInputFeedback] = useState<InputFeedback[]>();

  const defaultMemoInputFeedback: InputFeedback = {
    variant: 'explicative',
    message: t('MEMO_INFO'),
  };
  const [memoInputFeedback, setMemoInputFeedback] = useState<InputFeedback[]>([
    defaultMemoInputFeedback,
  ]);

  const debouncedSearchTerm = useDebounce(recipient, 300);
  const associatedAddress = useBnsResolver(debouncedSearchTerm, stxAddress, 'STX');
  const associatedDomain = useBnsName(debouncedSearchTerm);

  useEffect(() => {
    setInputFeedback(undefined);

    if (associatedDomain !== '') {
      setRecipientDomain(associatedDomain);
      setRecipientAddress(recipient);
      setInputFeedback([
        { variant: 'checkmark', message: t('ASSOCIATED_DOMAIN') },
        { variant: 'plainIndented', message: associatedDomain },
      ]);
    } else {
      setRecipientDomain('');
      setInputFeedback(undefined);
    }

    if (associatedAddress !== '') {
      setRecipientAddress(associatedAddress);
      setRecipientDomain(recipient);
      setInputFeedback([
        { variant: 'checkmark', message: t('ASSOCIATED_ADDRESS') },
        { variant: 'plainIndented', message: associatedAddress },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associatedDomain, associatedAddress]);

  const handleNext = () => {
    if (stxAddress === recipientAddress) {
      setInputFeedback([{ variant: 'danger', message: t('ERRORS.SEND_TO_SELF') }]);
      return;
    }
    if (!validateStacksAddress(recipientAddress) && !validateStacksAddress(recipient)) {
      setInputFeedback([{ variant: 'danger', message: t('ERRORS.ADDRESS_INVALID') }]);
      return;
    }
    if (memoInputFeedback.some((i) => i.variant === 'danger')) {
      return;
    }

    return onNext();
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setRecipient(newValue);
    setInputFeedback(undefined);
    setRecipientAddress(newValue);
  };

  const handleMemoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMemo = e.target.value;
    if (Buffer.from(newMemo).byteLength >= 34) {
      setMemoInputFeedback([
        { variant: 'danger', message: t('ERRORS.MEMO_LENGTH') },
        defaultMemoInputFeedback,
      ]);
    } else {
      setMemoInputFeedback(memoInputFeedback.filter((i) => i.variant !== 'danger'));
    }
    setMemo(newMemo);
  };

  const inputElement = (
    <>
      <RecipientInput
        data-testid={dataTestID}
        title={t('RECIPIENT')}
        placeholder={t('RECIPIENT_PLACEHOLDER')}
        value={recipient}
        onChange={handleAddressChange}
        variant={inputFeedback?.some((i) => i.variant === 'danger') ? 'danger' : 'default'}
        feedback={inputFeedback}
        autoFocus
      />
      <MemoInput
        title={t('MEMO')}
        value={memo}
        onChange={handleMemoChange}
        variant={memoInputFeedback.some((i) => i.variant === 'danger') ? 'danger' : 'default'}
        feedback={memoInputFeedback}
        hideClear
      />
    </>
  );

  const buttonElement = (
    <Button title={t('NEXT')} onClick={handleNext} disabled={!recipient} loading={isLoading} />
  );

  return <InputScreen inputs={inputElement} buttons={buttonElement} header={header} />;
}

export default Step1SelectRecipient;
