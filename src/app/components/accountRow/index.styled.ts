import Button from '@ui-library/button';
import styled from 'styled-components';

export const Container = styled.div<{ $disableClick?: boolean }>((props) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'transparent',
  opacity: props.$disableClick ? 0.5 : 1,
}));

export const AccountInfoContainer = styled.button<{ $cursor?: string }>((props) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'transparent',
  cursor: props.$cursor,
}));

export const GradientCircle = styled.div<{
  $firstGradient: string;
  $secondGradient: string;
  $thirdGradient: string;
  $isBig: boolean;
  $isSelected: boolean;
}>((props) => ({
  width: props.$isBig ? 32 : 20,
  height: props.$isBig ? 32 : 20,
  borderRadius: 25,
  background: `linear-gradient(to bottom, ${props.$firstGradient}, ${props.$secondGradient}, ${props.$thirdGradient})`,
  opacity: props.$isSelected ? 1 : 0.5,
}));

export const AvatarContainer = styled.div<{
  $isBig: boolean;
  $isSelected: boolean;
}>((props) => ({
  width: props.$isBig ? 32 : 20,
  height: props.$isBig ? 32 : 20,
  borderRadius: props.$isBig ? 16 : 10,
  opacity: props.$isSelected ? 1 : 0.5,
  overflow: 'hidden',
}));

export const CurrentAccountContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  paddingLeft: props.theme.space.s,
  gap: props.theme.space.xxxs,
}));

export const CurrentAccountTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: props.theme.space.xs,
}));

export const AccountName = styled.span<{ $isSelected: boolean }>((props) => ({
  ...props.theme.typography.body_bold_m,
  color: props.$isSelected ? props.theme.colors.white_0 : props.theme.colors.white_400,
  textAlign: 'start',
  maxWidth: 160,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minHeight: 19,
}));

export const BarLoaderContainer = styled.div((props) => ({
  width: 200,
  paddingTop: props.theme.space.xxs,
  backgroundColor: 'transparent',
}));

export const TransparentSpan = styled.span`
  background: transparent;
`;

export const OptionsButton = styled.button({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  background: 'transparent',
});

export const ModalContent = styled.form((props) => ({
  paddingBottom: props.theme.space.xxl,
}));

export const ModalDescription = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
}));

export const ModalControlsContainer = styled.div<{
  $bigSpacing?: boolean;
}>((props) => ({
  display: 'flex',
  columnGap: props.theme.space.s,
  marginTop: props.$bigSpacing ? props.theme.space.l : props.theme.space.m,
}));

export const ModalButtonContainer = styled.div({
  width: '100%',
});

export const ButtonRow = styled.button<{ $color?: string }>`
  ${(props) => props.theme.typography.body_medium_m};
  display: flex;
  align-items: center;
  background-color: transparent;
  justify-content: flex-start;
  padding: ${(props) => props.theme.space.l};
  padding-top: ${(props) => props.theme.space.s};
  padding-bottom: ${(props) => props.theme.space.s};
  font: ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.$color || props.theme.colors.white_0};
  transition: background-color 0.2s ease;
  :hover {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
  :active {
    background-color: ${(props) => props.theme.colors.elevation3};
  }
`;

export const InputLabel = styled.div((props) => ({
  ...props.theme.typography.body_medium_m,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: props.theme.colors.white_200,
  marginTop: props.theme.space.m,
  marginBottom: props.theme.space.xs,
}));

export const Balance = styled.div<{ $isSelected?: boolean }>((props) => ({
  ...props.theme.typography.body_medium_m,
  marginTop: props.theme.space.xxs,
  color: props.$isSelected ? props.theme.colors.white_200 : props.theme.colors.white_600,
  display: 'flex',
  alignItems: 'center',
  columnGap: props.theme.space.xs,
}));

export const StyledButton = styled(Button)((props) => ({
  padding: 0,
  width: 'auto',
  transition: 'opacity 0.1s ease',
  div: {
    color: props.theme.colors.tangerine,
  },
  ':hover:enabled': {
    opacity: 0.8,
  },
  ':active:enabled': {
    opacity: 0.6,
  },
}));
