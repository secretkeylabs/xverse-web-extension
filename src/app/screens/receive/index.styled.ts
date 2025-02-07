import TooltipCalloutRaw from '@components/tooltip';
import Callout from '@ui-library/callout';
import styled from 'styled-components';

export const OuterContainer = styled.div((props) => ({
  ...props.theme.scrollbar,
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  paddingLeft: props.theme.space.xs,
  paddingRight: props.theme.space.xs,
}));

export const AddressContainer = styled.div({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  columnGap: 16,
});

export const AddressTypeContainer = styled.div((props) => ({
  display: 'flex',
  marginBottom: props.theme.space.xs,
}));

export const Button = styled.button((props) => ({
  width: 44,
  height: 44,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: props.theme.space.s,
  backgroundColor: props.theme.colors.elevation2,
  borderRadius: props.theme.radius(5),
  transition: 'background-color 0.1s ease',
  '&:hover': {
    backgroundColor: props.theme.colors.elevation5,
  },
}));

export const TopTitleText = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  textAlign: 'center',
}));

export const DescriptionText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'center',
  color: props.theme.colors.white_200,
  marginTop: props.theme.spacing(6),
}));

export const BnsNameText = styled.h1((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  ...props.theme.typography.body_bold_l,
  textAlign: 'center',
  marginBottom: 4,
}));

export const QRCodeContainer = styled.div<{ $marginBottom: number }>((props) => ({
  display: 'flex',
  backgroundColor: props.theme.colors.white_0,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: props.theme.radius(1),
  width: 159,
  height: 159,
  alignSelf: 'center',
  marginTop: props.theme.spacing(15),
  marginBottom: props.$marginBottom,
}));

export const AddressText = styled.h1((props) => ({
  ...props.theme.typography.body_m,
  textAlign: 'left',
  color: props.theme.colors.white_200,
  wordBreak: 'break-all',
}));

export const BottomBarContainer = styled.div({
  marginTop: 22,
});

export const SpacedCallout = styled(Callout)((props) => ({
  marginTop: props.theme.space.s,
}));

export const TooltipCallout = styled(TooltipCalloutRaw)(() => ({
  maxWidth: 300,
}));
