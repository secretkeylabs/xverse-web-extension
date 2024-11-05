import Button from '@ui-library/button';
import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-top: 22px;
  padding-left: ${(props) => props.theme.space.m};
  padding-right: ${(props) => props.theme.space.m};
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  padding: `${props.theme.space.l} ${props.theme.space.m}`,
  columnGap: props.theme.space.s,
}));

export const EditNonceButton = styled(Button)((props) => ({
  justifyContent: 'flex-start',
  padding: props.theme.space.xxs,
  '&.tertiary': {
    color: props.theme.colors.tangerine,
    '&:hover:enabled': {
      color: props.theme.colors.tangerine,
      opacity: 0.8,
    },
    '&:active:enabled': {
      color: props.theme.colors.tangerine,
      opacity: 0.6,
    },
    '&:disabled': {
      color: props.theme.colors.tangerine,
      opacity: 0.6,
    },
  },
}));

export const SponsoredInfoText = styled.p((props) => ({
  ...props.theme.typography.body_m,
  color: props.theme.colors.white_400,
}));

export const SuccessActionsContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.space.s,
  paddingLeft: props.theme.space.m,
  paddingRight: props.theme.space.m,
  marginBottom: props.theme.space.xxl,
  marginTop: props.theme.space.xxl,
}));

export const ReviewTransactionText = styled.p((props) => ({
  ...props.theme.typography.headline_s,
  color: props.theme.colors.white_0,
  textAlign: 'left',
}));

export const RequestedByText = styled.p((props) => ({
  ...props.theme.typography.body_medium_m,
  color: props.theme.colors.white_400,
  marginTop: props.theme.space.xs,
  textAlign: 'left',
}));

export const TitleContainer = styled.div((props) => ({
  marginBottom: props.theme.space.l,
}));

export const WarningWrapper = styled.div((props) => ({
  marginBottom: props.theme.space.m,
}));

export const FeeRateContainer = styled.div`
  margin-bottom: ${(props) => props.theme.space.m};
  background-color: ${(props) => props.theme.colors.background.elevation1};
  border-radius: ${(props) => props.theme.space.s};
  padding: ${(props) => props.theme.space.m};
`;
