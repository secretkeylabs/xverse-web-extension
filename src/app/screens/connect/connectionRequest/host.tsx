import styled from 'styled-components';

/* eslint-disable import/prefer-default-export */
const Container = styled('div')((props) => ({
  color: props.theme.colors.white_400,
  ...props.theme.typography.body_medium_m,
  textAlign: 'center',
}));

type Props = {
  url: ConstructorParameters<typeof URL>[0];
};

export function Host({ url }: Props) {
  const parsedUrl = new URL(url);
  const { host } = parsedUrl;

  return <Container>{host}</Container>;
}
