import styled from 'styled-components';

const dimensions = {
  height: 32,
  width: 32,
};

export const Img = styled('img')({
  ...dimensions,
  borderRadius: '50%',
  objectFit: 'cover',
});

export const TextFallback = styled('div')((props) => ({
  ...props.theme.typography.body_bold_m,
  ...dimensions,

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '50%',

  color: props.theme.colors.white_0,
}));
