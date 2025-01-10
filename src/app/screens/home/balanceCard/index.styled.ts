import styled from 'styled-components';

export const Container = styled.div`
  position: relative;
  min-height: 90px; // it's the height of RowContainer + BalanceContainer + PercentageChangeContainer + indent between them
  margin-top: ${({ theme }) => theme.space.m};
`;

export const RowContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: props.theme.space.xs,
  columnGap: props.theme.space.xxs,
  minHeight: 20,
}));

export const LoaderContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
}));

export const BalanceHeadingText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  lineHeight: '140%',
}));

export const ShowBalanceButton = styled.button((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_200,
  lineHeight: '140%',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  backgroundColor: 'transparent',
  transition: 'color 0.1s ease',
  '&:hover': {
    color: props.theme.colors.white_0,
  },
}));

export const BalanceAmountText = styled.p((props) => ({
  ...props.theme.typography.headline_l,
  lineHeight: '1',
  color: props.theme.colors.white_0,
  transition: 'color 0.1s ease',
  '&:hover': {
    color: props.theme.colors.white_200,
  },
}));

export const BarLoaderContainer = styled.div({
  display: 'flex',
});

export const BalanceContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  width: 'fit-content',
  alignItems: 'center',
  gap: props.theme.spacing(5),
  minHeight: 34,
  cursor: 'pointer',
}));

export const ContentWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
`;

export const PercentageChangeContainer = styled.div((props) => ({
  marginTop: props.theme.space.s,
  marginBottom: props.theme.space.xxxs,
}));
