import Epic from '@assets/img/nftDashboard/rareSats/epic.svg';
import Legendary from '@assets/img/nftDashboard/rareSats/legendary.svg';
import Mythic from '@assets/img/nftDashboard/rareSats/mythic.svg';
import Rare from '@assets/img/nftDashboard/rareSats/rare.svg';
import Uncommon from '@assets/img/nftDashboard/rareSats/uncommon.svg';
import Unknown from '@assets/img/nftDashboard/rareSats/unknown.svg';
import { RareSatsType, getRareSatsColorsByRareSatsType } from '@utils/rareSats';
import styled from 'styled-components';

import Theme from '../../../theme';

const Container = styled.div<{ bgColor: string; padding: number }>((props) => ({
  backgroundColor: props.bgColor,
  padding: props.padding,
  borderRadius: props.bgColor && props.padding ? '100%' : 0,
}));
const ImageContainer = styled.div<{ size: number; dynamicSize: boolean }>((props) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: props.dynamicSize ? '100%' : props.size,
  height: props.dynamicSize ? '100%' : props.size,
  position: 'relative',
}));
const Image = styled.img`
  width: 100%;
  height: 100%;
  zindex: 2;
`;
type GlowProps = {
  color: string;
  outerColor: string;
  isCollage: boolean;
  isGallery: boolean;
};
const Glow = styled.div<GlowProps>((props) => {
  const boxShadow = {
    'extension-collage': `0 0 calc(5vw) calc(1.5vw) ${props.color}`,
    'extension-one-item': `0 0 calc(12vw) calc(2vw) ${props.color}`,
    'gallery-collage': `0 0 calc(3.5vw) calc(0.8vw) ${props.color}`,
    'gallery-one-item': `0 0 calc(7vw) calc(1.5vw) ${props.color}`,
  }[`${props.isGallery ? 'gallery' : 'extension'}-${props.isCollage ? 'collage' : 'one-item'}`];
  return {
    position: 'absolute',
    zIndex: 1,
    width: '10%',
    height: '10%',
    borderRadius: '100%',
    boxShadow,
  };
});

interface Props {
  type: RareSatsType;
  size?: number;
  bgColor?: keyof (typeof Theme)['colors']['background'];
  padding?: number;
  isDynamicSize?: boolean;
  isCollage?: boolean;
  glow?: boolean;
}

function RareSatIcon({
  type,
  size = 24,
  bgColor,
  padding = 0,
  isDynamicSize = false,
  isCollage = false,
  glow = true,
}: Props) {
  const isGallery: boolean = document.documentElement.clientWidth > 360;
  const src = {
    epic: Epic,
    legendary: Legendary,
    mythic: Mythic,
    rare: Rare,
    uncommon: Uncommon,
    unknown: Unknown,
  }[type];
  const backgroundColor = bgColor ? Theme.colors.background[bgColor] : 'transparent';
  const { color, backgroundColor: outerColor } = getRareSatsColorsByRareSatsType(type);
  return (
    <Container bgColor={backgroundColor} padding={padding}>
      <ImageContainer size={size} dynamicSize={isDynamicSize}>
        {glow && type !== 'unknown' && (
          <Glow color={color} outerColor={outerColor} isCollage={isCollage} isGallery={isGallery} />
        )}
        <Image src={src} alt={type} />
      </ImageContainer>
    </Container>
  );
}

export default RareSatIcon;
