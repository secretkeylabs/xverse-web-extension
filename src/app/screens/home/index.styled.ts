import TokenTile from '@components/tokenTile';
import Callout from '@ui-library/callout';
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
  marginBottom: props.theme.space.l,
}));

export const ReceiveContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  padding: `${props.theme.space.m} 0`,
}));

export const TokenListButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: props.theme.space.xxxl,
}));

export const TokenListButton = styled.button((props) => ({
  ...props.theme.typography.body_medium_m,
  cursor: props.disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: props.theme.space.xs,
  borderRadius: props.theme.radius(1),
  backgroundColor: 'transparent',
  color: props.theme.colors.white_0,
  opacity: 0.8,
  transition: 'opacity 0.1s ease',
  '&:hover': {
    opacity: 1,
  },
  '&:active, &:disabled': {
    opacity: 0.6,
  },
}));

export const RowButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.xl,
  columnGap: props.theme.space.l,
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

export const StyledDivider = styled(Divider)<{
  $noMarginBottom?: boolean;
  $noMarginTop?: boolean;
}>`
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
  ${(props) =>
    props.$noMarginTop &&
    `
      margin-top: 0;
    `}
`;

export const SpacedCallout = styled(Callout)((props) => ({
  marginTop: props.theme.space.s,
}));

export const InfoMessageContainer = styled.div((props) => ({
  marginBottom: props.theme.space.m,
}));
