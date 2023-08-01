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
  children: React.ReactNode;
  closeDialog: () => void;
  optionsDialogTopIndent?: string;
}

function OptionsDialog({ closeDialog, optionsDialogTopIndent, children }: Props) {
  return (
    <OuterContainer onClick={closeDialog}>
      <Container style={optionsDialogTopIndent ? { top: optionsDialogTopIndent } : undefined}>
        {children}
      </Container>
    </OuterContainer>
  );
}

export default OptionsDialog;
