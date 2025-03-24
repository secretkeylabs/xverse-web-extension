import RecipientSelector from '@components/recipientSelector';
import Input from '@ui-library/input';
import type { FeedbackVariant } from '@ui-library/inputFeedback';
import type { TabType } from '@utils/helper';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const MemoInput = styled.div`
  margin-top: ${(props) => props.theme.space.l};
`;

type InputFeedback = {
  variant: FeedbackVariant;
  message: string;
};

type Props = {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  memo: string;
  setMemo: (memo: string) => void;
  onNext: () => void;
  isLoading: boolean;
  onBack: () => void;
  selectedBottomTab: TabType;
};

function Step1SelectRecipientAndMemo({
  recipientAddress,
  setRecipientAddress,
  memo,
  setMemo,
  onNext,
  isLoading,
  onBack,
  selectedBottomTab,
}: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'SEND' });

  const defaultMemoInputFeedback: InputFeedback = {
    variant: 'explicative',
    message: t('MEMO_INFO'),
  };
  const [memoInputFeedback, setMemoInputFeedback] = useState<InputFeedback[]>([
    defaultMemoInputFeedback,
  ]);

  const handleNext = () => {
    if (memoInputFeedback.some((i) => i.variant === 'danger')) {
      return;
    }
    onNext();
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

  return (
    <RecipientSelector
      onBack={onBack}
      selectedBottomTab={selectedBottomTab}
      recipientAddress={recipientAddress}
      setRecipientAddress={setRecipientAddress}
      onNext={handleNext}
      isLoading={isLoading}
      recipientPlaceholder={t('RECIPIENT_PLACEHOLDER')}
      addressType="stx"
      customFields={
        <MemoInput>
          <Input
            title={t('MEMO')}
            value={memo}
            onChange={handleMemoChange}
            variant={memoInputFeedback.some((i) => i.variant === 'danger') ? 'danger' : 'default'}
            feedback={memoInputFeedback}
            hideClear
          />
        </MemoInput>
      }
    />
  );
}

export default Step1SelectRecipientAndMemo;
