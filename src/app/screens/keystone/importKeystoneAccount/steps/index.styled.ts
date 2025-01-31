import styled from 'styled-components';

export const ImportStartImage = styled.img((props) => ({
  marginLeft: props.theme.spacing(0),
}));

export const ImportStartContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const ImportStartTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
  marginTop: props.theme.spacing(40),
  textAlign: 'center',
}));
export const ImportStartText = styled.p((props) => ({
  ...props.theme.body_m,
  textAlign: 'center',
  marginTop: props.theme.spacing(6),
  color: props.theme.colors.white[200],
}));

export const SelectAssetTitle = styled.h1((props) => ({
  ...props.theme.headline_s,
}));

export const SelectAssetText = styled.p<{
  centered?: boolean;
}>((props) => ({
  ...props.theme.body_m,
  color: props.theme.colors.white[200],
  textAlign: props.centered ? 'center' : 'left',
}));

export const AddressAddedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: auto;
  text-align: center;
  gap: 8px;
  > :first-child {
    margin-bottom: 26px;
  }
`;

export const AddAccountNameContainer = styled.div((props) => ({
  marginTop: props.theme.spacing(20),
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(6),
}));

export const AddAccountNameTitleContainer = styled.div((props) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: props.theme.spacing(4),
  marginBottom: props.theme.spacing(22),
}));

export const EndScreenContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const EndScreenTextContainer = styled.div((props) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: props.theme.spacing(6),
  marginBottom: props.theme.spacing(20),
}));
