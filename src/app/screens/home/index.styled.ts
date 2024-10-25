import TokenTile from '@components/tokenTile';
import Divider from '@ui-library/divider';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 ${(props) => props.theme.space.xs};
  ${(props) => props.theme.scrollbar}
`;

export const ColumnContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'space-between',
  justifyContent: 'space-between',
  marginTop: props.theme.space.xs,
  marginBottom: props.theme.space.s,
}));

export const ReceiveContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.xl,
  gap: props.theme.space.m,
}));

export const TokenListButton = styled.button((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  opacity: 0.8,
  marginTop: props.theme.spacing(5),
  cursor: props.disabled ? 'not-allowed' : 'pointer',
}));

export const ButtonText = styled.div((props) => ({
  ...props.theme.typography.body_s,
  fontWeight: 700,
  color: props.theme.colors.white_0,
  textAlign: 'center',
}));

export const ButtonImage = styled.img((props) => ({
  marginRight: props.theme.spacing(3),
  alignSelf: 'center',
  transform: 'all',
}));

export const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.spacing(11),
  columnGap: props.theme.spacing(11),
}));

export const TokenListButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginTop: props.theme.space.s,
  marginBottom: props.theme.spacing(22),
}));

export const StyledTokenTile = styled(TokenTile)`
  background-color: transparent;
`;

export const Icon = styled.img({
  width: 24,
  height: 24,
});

export const MergedOrdinalsIcon = styled.img({
  width: 64,
  height: 24,
});

export const VerifyOrViewContainer = styled.div((props) => ({
  marginTop: props.theme.space.xl,
  marginBottom: props.theme.spacing(20),
}));

export const VerifyButtonContainer = styled.div((props) => ({
  marginBottom: props.theme.spacing(6),
}));

export const ModalContent = styled.div((props) => ({
  padding: props.theme.space.m,
  paddingTop: 0,
  paddingBottom: props.theme.space.xl,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

export const ModalIcon = styled.img((props) => ({
  marginBottom: props.theme.spacing(10),
}));

export const ModalTitle = styled.div((props) => ({
  ...props.theme.typography.body_bold_l,
  marginBottom: props.theme.space.xs,
  textAlign: 'center',
}));

export const ModalDescription = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xl,
  textAlign: 'center',
}));

export const ModalControlsContainer = styled.div({
  display: 'flex',
  width: '100%',
});

export const ModalButtonContainer = styled.div((props) => ({
  width: '100%',
  '&:first-child': {
    marginRight: props.theme.spacing(6),
  },
}));

export const StacksIcon = styled.img({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 2,
  left: 0,
  top: 0,
});

export const MergedIcon = styled.div((props) => ({
  position: 'relative',
  marginBottom: props.theme.space.l,
}));

export const IconBackground = styled.div((props) => ({
  width: 24,
  height: 24,
  position: 'absolute',
  zIndex: 1,
  left: 20,
  top: 0,
  backgroundColor: props.theme.colors.white_900,
  borderRadius: 30,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

export const StyledDivider = styled(Divider)<{ $noMarginBottom?: boolean }>`
  flex: 1 0 auto;
  width: calc(100% + ${(props) => props.theme.space.xl});
  margin-left: -${(props) => props.theme.space.m};
  margin-right: -${(props) => props.theme.space.m};
  transition: margin-bottom 0.1s ease;
  ${(props) =>
    props.$noMarginBottom &&
    `
      margin-bottom: 0;
    `}
`;

export const StyledDividerSingle = styled(StyledDivider)`
  margin-bottom: 0;
`;
