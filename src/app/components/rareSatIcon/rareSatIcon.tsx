import OneDPali from '@assets/img/nftDashboard/rareSats/1d_pali.svg';
import TwoDPali from '@assets/img/nftDashboard/rareSats/2d_pali.svg';
import ThreeDPali from '@assets/img/nftDashboard/rareSats/3d_pali.svg';
import Alpha from '@assets/img/nftDashboard/rareSats/alpha.svg';
import BlackEpic from '@assets/img/nftDashboard/rareSats/black_epic.svg';
import BlackLegendary from '@assets/img/nftDashboard/rareSats/black_legendary.svg';
import BlackRare from '@assets/img/nftDashboard/rareSats/black_rare.svg';
import BlackUncommon from '@assets/img/nftDashboard/rareSats/black_uncommon.svg';
import Block78 from '@assets/img/nftDashboard/rareSats/block_78.svg';
import Block9 from '@assets/img/nftDashboard/rareSats/block_9.svg';
import BlockPali from '@assets/img/nftDashboard/rareSats/block_pali.svg';
import Epic from '@assets/img/nftDashboard/rareSats/epic.svg';
import FibonacciSequence from '@assets/img/nftDashboard/rareSats/fibonacci_sequence.svg';
import FirstTransactionSilkroad from '@assets/img/nftDashboard/rareSats/first_transaction_silkroad.svg';
import Hitman from '@assets/img/nftDashboard/rareSats/hitman.svg';
import Jpeg from '@assets/img/nftDashboard/rareSats/jpeg.svg';
import Legendary from '@assets/img/nftDashboard/rareSats/legendary.svg';
import Mythic from '@assets/img/nftDashboard/rareSats/mythic.svg';
import Nakamoto from '@assets/img/nftDashboard/rareSats/nakamoto.svg';
import Omega from '@assets/img/nftDashboard/rareSats/omega.svg';
import Palinception from '@assets/img/nftDashboard/rareSats/palinception.svg';
import Palindrome from '@assets/img/nftDashboard/rareSats/palindrome.svg';
import Pizza from '@assets/img/nftDashboard/rareSats/pizza.svg';
import Rare from '@assets/img/nftDashboard/rareSats/rare.svg';
import SequencePali from '@assets/img/nftDashboard/rareSats/sequence_pali.svg';
import Uncommon from '@assets/img/nftDashboard/rareSats/uncommon.svg';
import Unknown from '@assets/img/nftDashboard/rareSats/unknown.svg';
import Vintage from '@assets/img/nftDashboard/rareSats/vintage.svg';
import { getRareSatsColorsByRareSatsType, RareSatsType } from '@utils/rareSats';
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
    EPIC: Epic,
    LEGENDARY: Legendary,
    MYTHIC: Mythic,
    RARE: Rare,
    UNCOMMON: Uncommon,
    UNKNOWN: Unknown,
    BLACK_LEGENDARY: BlackLegendary,
    BLACK_EPIC: BlackEpic,
    BLACK_RARE: BlackRare,
    BLACK_UNCOMMON: BlackUncommon,
    FIBONACCI: FibonacciSequence,
    '1D_PALINDROME': OneDPali,
    '2D_PALINDROME': TwoDPali,
    '3D_PALINDROME': ThreeDPali,
    SEQUENCE_PALINDROME: SequencePali,
    PERFECT_PALINCEPTION: Palinception,
    PALIBLOCK_PALINDROME: BlockPali,
    PALINDROME: Palindrome,
    NAME_PALINDROME: Palindrome,
    ALPHA: Alpha,
    OMEGA: Omega,
    FIRST_TRANSACTION: FirstTransactionSilkroad,
    BLOCK9: Block9,
    BLOCK78: Block78,
    NAKAMOTO: Nakamoto,
    VINTAGE: Vintage,
    PIZZA: Pizza,
    JPEG: Jpeg,
    HITMAN: Hitman,
    SILK_ROAD: FirstTransactionSilkroad,
  }[type];
  if (!src) {
    return null;
  }
  const backgroundColor = bgColor ? Theme.colors.background[bgColor] : 'transparent';
  const { color, backgroundColor: outerColor } = getRareSatsColorsByRareSatsType(type) ?? {
    color: 'transparent',
    backgroundColor: 'transparent',
  };

  return (
    <Container bgColor={backgroundColor} padding={padding}>
      <ImageContainer size={size} dynamicSize={isDynamicSize}>
        {glow && type !== 'UNKNOWN' && (
          <Glow color={color} outerColor={outerColor} isCollage={isCollage} isGallery={isGallery} />
        )}
        <Image src={src} alt={type} />
      </ImageContainer>
    </Container>
  );
}

export default RareSatIcon;
