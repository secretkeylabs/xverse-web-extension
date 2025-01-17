import styled from 'styled-components';

export const Container = styled.div(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  rowGap: theme.space.xs,
}));

export const Title = styled.div(({ theme }) => ({
  ...theme.typography.body_medium_m,
  color: theme.colors.white_200,
}));

/**
 * This component exists to prevent icons or small buttons from registering any
 * height yet be vertically centered. This is needed since they may at times be
 * accidentally slightly taller than the row they're in (e.g., few extra px
 * padding) therefore vertically distorting the layout.
 */
export const VerticalCenteringNoHeight = styled.div({
  height: 0, // This is the important bit!

  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  overflow: 'visible',
});
