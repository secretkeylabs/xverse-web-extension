import { useState } from 'react';
import { Img, TextFallback } from './index.styles';

type Props = {
  src: string;
  textFallback: string;
};

export function TokenImage({ src, textFallback }: Props) {
  const [error, setError] = useState(false);

  if (error) {
    return <TextFallback>{textFallback}</TextFallback>;
  }

  return <Img src={src} onError={() => setError(true)} />;
}
