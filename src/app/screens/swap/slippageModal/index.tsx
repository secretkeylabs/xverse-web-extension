import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { useState } from 'react';
import ActionButton from '@components/button';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  row-gap: 16px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
`;
const ResetButton = styled.button((props) => ({
  display: 'inline',
  background: 'transparent',
  color: props.theme.colors.orange_main,
  ...props.theme.body_medium_m,
  ':hover': {
    opacity: 0.8,
  },
}));

const Title = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_0,
}));

const Input = styled.input<{ error: boolean }>((props) => ({
  ...props.theme.body_medium_m,
  height: 48,
  backgroundColor: props.theme.colors.elevation1,
  borderStyle: 'solid',
  borderWidth: 1,
  borderRadius: 8,
  color: props.theme.colors.white_0,
  padding: '14px 16px',
  outline: 'none',
  borderColor: props.error ? props.theme.colors.feedback.error_700 : 'transparent',
  ':focus-within': {
    border: '1px solid',
    'border-color': props.error
      ? props.theme.colors.feedback.error_700
      : props.theme.colors.elevation6,
  },
}));

const InputFeedback = styled.span((props) => ({
  ...props.theme.body_s,
  color: props.theme.colors.feedback.error,
}));

const InputRow = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(4),
}));

const Description = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white_400,
}));

const DEFAULT_SLIPPAGE = '4%';
export function SlippageModalContent({
  slippage,
  onChange,
}: {
  slippage: number;
  onChange: (slippage: number) => void;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const [percentage, setPercentage] = useState(`${(slippage * 100).toString()}%`);
  const result = Number(percentage.replace('%', ''));
  const invalid = Number.isNaN(result) || result >= 100 || result <= 0;

  const handleClickResetSlippage = () => setPercentage(DEFAULT_SLIPPAGE);

  return (
    <Container>
      <TitleRow>
        <Title>{t('SLIPPAGE')}</Title>
        <ResetButton onClick={handleClickResetSlippage}>{t('RESET_TO_DEFAULT')}</ResetButton>
      </TitleRow>
      <InputRow>
        <Input
          error={invalid}
          placeholder={DEFAULT_SLIPPAGE}
          value={percentage}
          onChange={(e) => setPercentage(e.target.value)}
          onFocus={(e) => {
            const current = e.target.value.replace('%', '');
            e.target.setSelectionRange(0, current.length);
          }}
        />
        {invalid && <InputFeedback>{t('ERRORS.SLIPPAGE_TOLERANCE_CANNOT_EXCEED')}</InputFeedback>}
      </InputRow>
      <Description>{t('SLIPPAGE_DESC')}</Description>
      <ActionButton
        disabled={invalid}
        warning={invalid}
        text={t('APPLY')}
        onPress={() => onChange(result / 100)}
      />
    </Container>
  );
}
export default SlippageModalContent;
