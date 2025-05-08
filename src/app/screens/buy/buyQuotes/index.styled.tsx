import Button from '@ui-library/button';
import styled from 'styled-components';

export const LoadingSpinnerContainer = styled.div`
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${(props) => props.theme.space.l};
  ${(props) => props.theme.typography.body_medium_l}
`;

export const QuoteListLoadingWrapper = styled.div`
  position: relative;
`;

export const LoadingOverlay = styled.div({
  position: 'absolute',
  inset: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const QuoteList = styled.div<{ $isVisable?: boolean }>((props) => ({
  opacity: props.$isVisable ? 1 : 0,
  pointerEvents: props.$isVisable ? 'all' : 'none',
}));

export const QuotesDescriptionContainer = styled.div((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_200,
  padding: `0 ${props.theme.space.m}`,
  marginBottom: props.theme.space.l,
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xxxs,

  '& .timer': {
    ...props.theme.typography.body_medium_m,
    color: props.theme.colors.white_0,
  },
}));

export const QuotesListContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.ml,
  padding: `0 ${props.theme.space.m}`,
  paddingBottom: props.theme.space.xxl,
}));

export const QuotesListSection = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
}));

export const QuotesListSectionTitle = styled.div((props) => ({
  ...props.theme.typography.body_bold_s,
}));

export const QuotesList = styled.ul((props) => ({
  listStyle: 'none',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.xs,
}));

export const SheetErrorContainer = styled.div<{ $verticalPaddingSmaller?: boolean }>((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: props.theme.space.l,
  padding: props.$verticalPaddingSmaller ? '40px 0' : '54px 0',
}));

export const SheetErrorContent = styled.div((props) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: props.theme.space.xxs,
  '.title': {
    ...props.theme.typography.body_medium_l,
    color: props.theme.colors.white_0,
    textAlign: 'center',
  },
  '.message': {
    ...props.theme.typography.body_m,
    color: props.theme.colors.white_400,
    textAlign: 'center',
  },
}));

export const TryAgainButton = styled(Button)({
  width: 'auto',
});
