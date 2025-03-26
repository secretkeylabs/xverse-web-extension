/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';

const ImgContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
});

const Img = styled('img')((props) => ({
  height: 48,
  width: 48,
  alignSelf: 'center',
  objectFit: 'contain',
  borderRadius: props.theme.radius(1),
}));

type Props = {
  /**
   * Any source that can be used as an image source.
   */
  src?: string | null;
};
export function DappLogo({ src }: Props) {
  if (!src) {
    return null;
  }

  return (
    <ImgContainer>
      <Img src={src} alt="Dapp Logo" />
    </ImgContainer>
  );
}
