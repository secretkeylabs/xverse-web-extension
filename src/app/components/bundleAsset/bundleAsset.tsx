import RareSatAsset from '@components/rareSatAsset/rareSatAsset';
import { Bundle } from '@utils/rareSats';
import styled from 'styled-components';

import RareSatsCollage from './rareSatsCollage';

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: ${(props) => props.theme.radius(1)}px;
`;

const IndividualAssetContainer = styled.div`
  display: flex;
  width: 100%;
  background: ${(props) => props.theme.colors.elevation1};
`;

interface Props {
  bundle: Bundle;
}

function BundleAsset({ bundle }: Props) {
  const isMoreThanOneItem = bundle.items?.length > 1;
  return (
    <ImageContainer>
      {isMoreThanOneItem ? (
        <RareSatsCollage items={bundle.items} />
      ) : (
        <IndividualAssetContainer>
          <RareSatAsset item={bundle.items[0]} />
        </IndividualAssetContainer>
      )}
    </ImageContainer>
  );
}

export default BundleAsset;
