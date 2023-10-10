import RareSatIcon from '@components/rareSatIcon/rareSatIcon';
import OrdinalImage from '@screens/ordinals/ordinalImage';
import { Inscription } from '@secretkeylabs/xverse-core';
import { BundleItem } from '@utils/rareSats';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const InscriptionContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const RareSatIconContainer = styled.div<{ isGallery: boolean }>((props) => ({
  display: 'flex',
  position: 'absolute',
  zIndex: 1,
  left: props.isGallery ? 20 : 8,
  top: props.isGallery ? 20 : 8,
}));

const RareSatsContainer = styled.div((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  aspectRatio: '1',
  overflow: 'hidden',
  position: 'relative',
  backgroundColor: props.theme.colors.elevation1,
  borderRadius: 8,
}));

const DynamicSizeContainer = styled.div<{ isCollage: boolean }>((props) => ({
  width: props.isCollage ? '40%' : '50%',
  height: props.isCollage ? '40%' : '50%',
}));

interface Props {
  item: BundleItem;
  isCollage?: boolean;
}

function RareSatAsset({ item, isCollage = false }: Props) {
  const isGallery: boolean = document.documentElement.clientWidth > 360;
  const isInscription = item.type === 'inscription' || item.type === 'inscribed-sat';

  return (
    <Container>
      {isInscription ? (
        <InscriptionContainer>
          {!isCollage && item.rarity_ranking !== 'common' && (
            <RareSatIconContainer isGallery={isGallery}>
              <RareSatIcon
                type={item.rarity_ranking}
                size={isGallery ? 40 : 24}
                padding={isGallery ? 8 : 4}
                bgColor="elevation0"
                glow={false}
              />
            </RareSatIconContainer>
          )}
          <OrdinalImage
            ordinal={item.inscription as Inscription}
            isSmallImage={!isGallery && isCollage}
            withoutSizeIncrease={!isGallery || isCollage}
          />
        </InscriptionContainer>
      ) : (
        <RareSatsContainer>
          <DynamicSizeContainer isCollage={isCollage}>
            <RareSatIcon type={item.rarity_ranking} isDynamicSize isCollage={isCollage} />
          </DynamicSizeContainer>
        </RareSatsContainer>
      )}
    </Container>
  );
}

export default RareSatAsset;
