import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Container, TitleContainer, TitleText } from '@screens/swap/swapConfirmation/stxInfoBlock';

const FunctionName = styled.div((props) => ({
  color: props.theme.colors.white[0],
  fontSize: 14,
  fontWeight: 500,
}));

interface FunctionBlockProps {
  name: string;
}

export default function FunctionBlock({ name }: FunctionBlockProps) {
  const { t } = useTranslation('translation', { keyPrefix: 'SWAP_CONFIRM_SCREEN' });
  return (
    <Container>
      <TitleContainer>
        <TitleText>{t('FUNCTION')}</TitleText>
        <FunctionName>{name}</FunctionName>
      </TitleContainer>
    </Container>
  );
}
