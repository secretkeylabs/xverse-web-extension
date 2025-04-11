import Button from '@ui-library/button';
import CrossButton from '@ui-library/crossButton';
import styled from 'styled-components';

export const CloseContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: props.theme.space.s,
}));

export const OuterContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  marginTop: props.theme.spacing(11),
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
}));

export const ModalContainer = styled(Container)({
  marginTop: 0,
});

export const HeaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: props.theme.space.l,
  alignItems: 'center',
}));

export const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.l,
}));

export const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.space.xs,
  textAlign: 'left',
}));

export const BundleLinkContainer = styled.button((props) => ({
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  color: props.theme.colors.tangerine,
  transition: 'color 0.2s ease',
  marginBottom: props.theme.space.s,
  ':hover': {
    color: props.theme.colors.tangerine_light,
  },
}));

export const BundleLinkText = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  marginRight: props.theme.space.xxs,
}));

export const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  columnGap: props.theme.space.s,
  padding: `${props.theme.space.l} ${props.theme.space.m}`,
}));

export const InlineButtonsContainer = styled(ButtonsContainer)((props) => ({
  columnGap: props.theme.space.xs,
  padding: 'inherit',
}));

export const SmallButton = styled(Button)(() => ({
  minWidth: 44,
  padding: 'initial',
}));
