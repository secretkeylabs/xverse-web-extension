import { OPTIONS_DIALOG_WIDTH } from '@utils/constants';
import styled from 'styled-components';

const Container = styled.div<{ $width: number }>((props) => ({
  width: 'auto',
  maxWidth: props.$width,
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: props.theme.space.l,
  right: props.theme.space.s,
  borderRadius: props.theme.space.s,
  paddingTop: props.theme.space.s,
  paddingBottom: props.theme.space.s,
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
  zIndex: 2,
});

interface Props {
  children: React.ReactNode;
  closeDialog: () => void;
  optionsDialogIndents?: { top: string; left: string };
  width?: number;
}

function OptionsDialog({
  closeDialog,
  optionsDialogIndents,
  children,
  width = OPTIONS_DIALOG_WIDTH,
}: Props) {
  return (
    <OuterContainer onClick={closeDialog}>
      <Container style={optionsDialogIndents} $width={width}>
        {children}
      </Container>
    </OuterContainer>
  );
}

export default OptionsDialog;
