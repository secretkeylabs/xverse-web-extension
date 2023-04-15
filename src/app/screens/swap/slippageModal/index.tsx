import BottomModal from '@components/bottomModal';
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

const Title = styled.div((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['0'],
}));

const Input = styled.input((props) => ({
  ...props.theme.body_medium_m,
  height: 48,
  backgroundColor: props.theme.colors.background.elevation1,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderWidth: 1,
  borderRadius: 8,
  color: props.theme.colors.white['0'],
  padding: '14px 16px',
  outline: 'none',
  ':focus': {
    borderColor: props.theme.colors.background.elevation6,
  },
}));

const Description = styled.p((props) => ({
  ...props.theme.body_medium_m,
  color: props.theme.colors.white['400'],
}));

export function SlippageModalContent(props: {
  slippage: number;
  onChange: (slippage: number) => void;
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_SCREEN' });
  const [percentage, setPercentage] = useState((props.slippage * 100).toString() + '%');
  const result = Number(percentage.replace('%', ''));
  let invalid = isNaN(result) || result >= 100 || result <= 0;
  return (
    <Container>
      <Title>{t('SLIPPAGE')}</Title>
      <Input
        placeholder="4%"
        value={percentage}
        onChange={(e) => setPercentage(e.target.value)}
        onFocus={(e) => {
          const current = e.target.value.replace('%', '');
          e.target.setSelectionRange(0, current.length);
        }}
      />
      <Description>{t('SLIPPAGE_DESC')}</Description>
      <ActionButton
        disabled={invalid}
        warning={invalid}
        text={t('APPLY')}
        onPress={() => props.onChange(result / 100)}
      />
    </Container>
  );
}
