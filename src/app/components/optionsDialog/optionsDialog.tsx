import styled from 'styled-components';

export const OPTIONS_DIALOG_WIDTH = 179;

const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: props.theme.spacing(15),
  right: props.theme.spacing(10),
  borderRadius: 12,
  paddingTop: 11,
  paddingBottom: 11,
  width: OPTIONS_DIALOG_WIDTH,
  background: props.theme.colors.elevation2,
  userSelect: 'none',
}));

const OuterContainer = styled.div({
  position: 'fixed',
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
  optionsDialogIndents?: { top: string; left: string };
}

function OptionsDialog({ closeDialog, optionsDialogIndents, children }: Props) {
  return (
    <OuterContainer onClick={closeDialog}>
      <Container style={optionsDialogIndents}>{children}</Container>
    </OuterContainer>
  );
}

export default OptionsDialog;
