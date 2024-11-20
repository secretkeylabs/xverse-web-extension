/* eslint-disable import/prefer-default-export */
import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
const Logo = styled('img')((props) => ({
  maxHeight: 48,
  maxWidth: 48,
  paddingBlockStart: props.theme.space.xxl,
  alignSelf: 'center',
}));

type Props = {
  /**
   * Any source that can be used as an image source.
   */
  src?: string;
};
export function DappLogo({ src }: Props) {
  if (!src) {
    return null;
  }

  return <Logo src={src} alt="Dapp Logo" />;
}
