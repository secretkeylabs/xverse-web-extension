import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Container, TitleContainer, TitleText } from '@screens/swap/swapConfirmation/stxInfoBlock';

const FunctionName = styled.div((props) => ({
  ...props.theme.body_medium_m,
  marginLeft: 10,
  color: props.theme.colors.white_0,
  textAlign: 'right',
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
