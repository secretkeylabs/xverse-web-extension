import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: 0,
  right: 0,
  justifyContent: 'center',
  paddingLeft: props.theme.spacing(6),
  paddingRight: props.theme.spacing(8),
  paddingTop: props.theme.spacing(8),
  paddingBottom: props.theme.spacing(8),
  borderRadius: props.theme.radius(6),
  width: 260,
  background: props.theme.colors.background.elevation2,
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  justify-content: center;
  padding: 8px;
  :hover {
    opacity: 0.8;
  }
  :active {
    opacity: 0.6;
  }
`;

const OuterContainer = styled.button((props) => ({
  width: '100%',
  height: '100vw',
  backgroundColor: 'red',
}));

function OptionsDialog() {
  const { t } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });
  return (
    <OuterContainer>
      <Container>
        <ButtonRow>{t('SWITCH_ACCOUNT')}</ButtonRow>
      </Container>
    </OuterContainer>

  );
}

export default OptionsDialog;
