import styled from 'styled-components';

export const ScrollContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
`;

export const OuterContainer = styled.div`
  display: flex;
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
  marginTop: props.theme.space.l,
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
  marginBottom: props.theme.space.m,
}));

export const Subtitle = styled.p`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_200};
  margin-top: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.xs};
`;

export const ButtonContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: props.theme.space.s,
  marginLeft: props.theme.space.m,
  marginRight: props.theme.space.m,
  marginTop: props.theme.space.l,
  marginBottom: props.theme.space.l,
}));

export const ErrorContainer = styled.div((props) => ({
  marginTop: props.theme.space.m,
}));

export const ErrorText = styled.p((props) => ({
  ...props.theme.body_xs,
  color: props.theme.colors.danger_medium,
}));

export const ReviewTransactionText = styled.h1((props) => ({
  ...props.theme.headline_s,
  color: props.theme.colors.white_0,
  marginBottom: props.theme.spacing(10),
  textAlign: 'left',
}));

export const StyledCallouts = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.s};
  margin-bottom: ${(props) => props.theme.space.l};
`;

export const RecipientCardContainer = styled.div`
  margin-bottom: ${(props) => props.theme.space.s};
`;

export const FeeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.space.m};
  padding: ${(props) => props.theme.space.m};
  background-color: ${(props) => props.theme.colors.elevation1};
  border-radius: ${(props) => props.theme.radius(2)}px;
`;
