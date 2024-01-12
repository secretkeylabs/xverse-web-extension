import ActionButton from '@components/button';
import { Faders } from '@phosphor-icons/react';
import styled from 'styled-components';

export const Title = styled.h1((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

export const Container = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  ...props.theme.scrollbar,
}));

export const DetailText = styled.span((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.space.xs,
}));

export const HighlightedText = styled.span((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_0,
}));

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: ${(props) => props.theme.space.s};
  gap: ${(props) => props.theme.space.xs};
`;

export const FeeButton = styled.button<{
  isSelected: boolean;
  centered?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_m,
  textAlign: 'left',
  color: props.theme.colors.white_0,
  backgroundColor: `${props.isSelected ? props.theme.colors.elevation6_600 : 'transparent'}`,
  border: `1px solid ${
    props.isSelected ? props.theme.colors.white_800 : props.theme.colors.white_850
  }`,
  borderRadius: props.theme.radius(2),
  height: 'auto',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: props.centered ? 'center' : 'flex-start',
  transition: 'background-color 0.1s ease-in-out, border 0.1s ease-in-out',
  padding: props.theme.space.m,
  paddingTop: props.theme.space.s,
  paddingBottom: props.theme.space.s,
  ':not(:disabled):hover': {
    borderColor: props.theme.colors.white_800,
  },
  ':disabled': {
    cursor: 'not-allowed',
    color: props.theme.colors.white_400,
    div: {
      color: 'inherit',
    },
    svg: {
      fill: props.theme.colors.white_600,
    },
  },
}));

export const ControlsContainer = styled.div`
  display: flex;
  column-gap: ${(props) => props.theme.space.s};
  margin: ${(props) => props.theme.space.xxl} 0px ${(props) => props.theme.space.xxl};
`;

export const CustomFeeIcon = styled(Faders)({
  transform: 'rotate(90deg)',
});

export const FeeButtonLeft = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  gap: props.theme.space.s,
}));

export const FeeButtonRight = styled.div({
  textAlign: 'right',
});

export const SecondaryText = styled.div<{
  alignRight?: boolean;
}>((props) => ({
  ...props.theme.typography.body_medium_s,
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.xxs,
  textAlign: props.alignRight ? 'right' : 'left',
}));

export const StyledActionButton = styled(ActionButton)((props) => ({
  'div, h1': {
    ...props.theme.typography.body_medium_m,
  },
}));

export const WarningText = styled.span((props) => ({
  ...props.theme.typography.body_medium_s,
  display: 'block',
  color: props.theme.colors.danger_light,
  marginTop: props.theme.space.xxs,
}));
