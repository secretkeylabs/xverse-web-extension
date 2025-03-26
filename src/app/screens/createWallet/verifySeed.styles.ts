import styled from 'styled-components';

export const Container = styled.div((props) => ({
  display: 'flex',
  paddingTop: props.theme.spacing(21),
  flexDirection: 'column',
  flex: 1,
}));

export const ButtonsContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  flex: 1,
  alignItems: 'flex-end',
  marginBottom: props.theme.spacing(30),
  width: '100%',
}));

export const TransparentButtonContainer = styled.div((props) => ({
  marginRight: props.theme.spacing(2),
  width: '100%',
}));

export const Heading = styled.h3((props) => ({
  ...props.theme.typography.body_l,
  color: props.theme.colors.white_200,
  marginBottom: props.theme.spacing(16),
}));

export const WordGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${(props) => props.theme.spacing(5)}px;
  margin-bottom: ${(props) => props.theme.spacing(12)}px;
`;

export const WordButton = styled.button`
  ${(props) => props.theme.typography.body_medium_m};
  color: ${(props) => props.theme.colors.white_0};
  background-color: ${(props) => props.theme.colors.elevation3};
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${(props) => props.theme.spacing(6)}px;
  border-radius: ${(props) => props.theme.radius(1)}px;
  transition: opacity 0.1s ease;
  :hover:enabled,
  :focus:enabled {
    opacity: 0.8;
  }
  :active:enabled {
    opacity: 0.6;
  }
`;

export const NthSpan = styled.span`
  ${(props) => props.theme.typography.body_bold_l};
  color: ${(props) => props.theme.colors.white_0};
`;

export const ErrorMessage = styled.div<{ $visible: boolean }>`
  visibility: ${(props) => (props.$visible ? 'initial' : 'hidden')};
`;

export const LoadingContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: props.theme.space.xxl,
  width: '100%',
}));
