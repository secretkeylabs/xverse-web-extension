import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: props.theme.spacing(15),
  right: props.theme.spacing(10),
  borderRadius: 12,
  paddingTop: 11,
  paddingBottom: 11,
  width: 179,
  background: props.theme.colors.background.elevation2,
}));

const ButtonRow = styled.button`
  display: flex;
  align-items: center;
  background: transparent;
  justify-content: flex-start;
  padding-left: 24px;
  padding-right: 24px;
  padding-top: 11px;
  padding-bottom: 11px;
  font: ${(props) => props.theme.body_medium_m};
  color: ${(props) => props.theme.colors.white['0']};
  :hover {
    background: ${(props) => props.theme.colors.background.elevation3};
  }
  :active {
    background: ${(props) => props.theme.colors.background.elevation3};
  }
`;

const OuterContainer = styled.div({
  position: 'fixed',
  width: 360,
  height: 600,
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: 'transparent',
  zIndex: 1,
});

interface Props {
  closeDialog: () => void;
  showRemoveAccountPrompt: () => void;
  optionsDialogTopIndent: string;
}

function OptionsDialog({ closeDialog, showRemoveAccountPrompt, optionsDialogTopIndent }: Props) {
  const { t } = useTranslation('translation', { keyPrefix: 'OPTIONS_DIALOG' });

  return (
    <OuterContainer onClick={closeDialog}>
      <Container style={{ top: optionsDialogTopIndent }}>
        <ButtonRow onClick={showRemoveAccountPrompt}>{t('REMOVE_FROM_LIST')}</ButtonRow>
      </Container>
    </OuterContainer>
  );
}

export default OptionsDialog;
