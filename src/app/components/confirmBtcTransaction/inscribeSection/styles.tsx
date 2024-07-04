import styled from 'styled-components';

export const CardContainer = styled.div<{ bottomPadding?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.m,
  background: props.theme.colors.elevation1,
  borderRadius: 12,
  padding: props.theme.spacing(8),
  paddingBottom: props.bottomPadding ? props.theme.spacing(12) : props.theme.spacing(8),
  justifyContent: 'center',
  marginBottom: props.theme.spacing(6),
  fontSize: 14,
}));

type CardRowProps = {
  topMargin?: boolean;
  center?: boolean;
};
export const CardRow = styled.div<CardRowProps>((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: props.center ? 'center' : 'flex-start',
  justifyContent: 'space-between',
  marginTop: props.topMargin ? props.theme.spacing(8) : 0,
}));

export const IconLabel = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
}));

export const ButtonIcon = styled.img((props) => ({
  width: 32,
  height: 32,
  marginRight: props.theme.spacing(4),
}));

export const InfoIconContainer = styled.div((props) => ({
  background: props.theme.colors.white_0,
  color: props.theme.colors.elevation0,
  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '50%',
  marginRight: props.theme.spacing(5),
}));

export const YourAddress = styled.div`
  text-align: right;
`;
