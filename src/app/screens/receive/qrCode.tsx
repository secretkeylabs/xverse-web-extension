import QRCodeStyling, { type DotType, type Options } from 'qr-code-styling';
import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

const QRCodeContainer = styled.div({
  display: 'flex',
});

type Props = {
  image: string;
  data: string;
  gradientColor: string;
};

function QrCode({ image, data, gradientColor }: Props) {
  const options: Options = useMemo(
    () => ({
      width: 154,
      height: 154,
      data,
      image,
      dotsOptions: {
        color: 'white',
        type: 'dots' as DotType,
        gradient: {
          type: 'radial',
          rotation: 90,
          colorStops: [
            { offset: 0, color: gradientColor },
            { offset: 1, color: '#000000' },
          ],
        },
      },
      backgroundOptions: {
        color: 'white',
      },
      cornersSquareOptions: {
        color: 'black',
        type: 'dot',
      },
      cornersDotOptions: {
        color: 'black',
        type: 'dot',
      },
      imageOptions: {
        hideBackgroundDots: false,
        imageSize: 1,
      },
      qrOptions: {
        errorCorrectionLevel: 'L',
      },
    }),
    [data, image, gradientColor],
  );
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling(options));
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }
  }, [qrCode, ref]);

  useEffect(() => {
    if (!qrCode) return;
    qrCode.update(options);
  }, [qrCode, options]);

  return <QRCodeContainer ref={ref} />;
}

export default QrCode;
