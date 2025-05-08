import { useEffect, useState } from 'react';
import { PaymentMethodImg } from './index.styled';
import { DEFAULT_PAYMENT_METHOD_IMG } from './utils';

type PaymentMethodImageProps = {
  src: string;
  alt: string;
  className?: string;
  size?: number;
  backgroundTransparent?: boolean;
};

function PaymentMethodImage({
  src,
  alt,
  className,
  size,
  backgroundTransparent,
}: PaymentMethodImageProps) {
  const [imgSrc, setImgSrc] = useState(DEFAULT_PAYMENT_METHOD_IMG);

  useEffect(() => {
    const image = new Image();
    image.src = src;

    image.onload = () => {
      setImgSrc(src);
    };

    image.onerror = () => {
      setImgSrc(DEFAULT_PAYMENT_METHOD_IMG);
    };
  }, [src]);

  return (
    <PaymentMethodImg
      $size={size}
      $backgroundTransparent={backgroundTransparent}
      src={imgSrc}
      alt={alt}
      className={className}
    />
  );
}

export default PaymentMethodImage;
