import OneDPali from '@assets/img/nftDashboard/rareSats/1Dpali.png';
import FirstTx from '@assets/img/nftDashboard/rareSats/1stx.png';
import TwoDPali from '@assets/img/nftDashboard/rareSats/2Dpali.png';
import ThreeDPali from '@assets/img/nftDashboard/rareSats/3Dpali.png';
import Alpha from '@assets/img/nftDashboard/rareSats/alpha.png';
import Block78 from '@assets/img/nftDashboard/rareSats/b78.png';
import Block9 from '@assets/img/nftDashboard/rareSats/b9.png';
import BlackEpic from '@assets/img/nftDashboard/rareSats/black_epic.svg';
import BlackLegendary from '@assets/img/nftDashboard/rareSats/black_legendary.svg';
import BlackRare from '@assets/img/nftDashboard/rareSats/black_rare.svg';
import BlackUncommon from '@assets/img/nftDashboard/rareSats/black_uncommon.svg';
import Epic from '@assets/img/nftDashboard/rareSats/epic.svg';
import FibonacciSequence from '@assets/img/nftDashboard/rareSats/fibonacci.png';
import Hitman from '@assets/img/nftDashboard/rareSats/hitman.png';
import Jpeg from '@assets/img/nftDashboard/rareSats/jpeg.png';
import Legendary from '@assets/img/nftDashboard/rareSats/legendary.svg';
import Mythic from '@assets/img/nftDashboard/rareSats/mythic.svg';
import Nakamoto from '@assets/img/nftDashboard/rareSats/nakamoto.png';
import Omega from '@assets/img/nftDashboard/rareSats/omega.png';
import Palindrome from '@assets/img/nftDashboard/rareSats/pali.png';
import BlockPali from '@assets/img/nftDashboard/rareSats/paliblock.png';
import Palinception from '@assets/img/nftDashboard/rareSats/perfectpaliception.png';
import Pizza from '@assets/img/nftDashboard/rareSats/pizza.png';
import Rare from '@assets/img/nftDashboard/rareSats/rare.svg';
import SequencePali from '@assets/img/nftDashboard/rareSats/seqpali.png';
import SilkRoad from '@assets/img/nftDashboard/rareSats/silkroad.png';
import Uncommon from '@assets/img/nftDashboard/rareSats/uncommon.svg';
import Unknown from '@assets/img/nftDashboard/rareSats/unknown.svg';
import Vintage from '@assets/img/nftDashboard/rareSats/vintage.png';
import { RareSatsType } from '@secretkeylabs/xverse-core';
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
  object-fit: cover;
`;

interface Props {
  type: RareSatsType;
  size?: number;
  bgColor?: keyof (typeof Theme)['colors']['background'];
  padding?: number;
  isDynamicSize?: boolean;
}

function RareSatIcon({ type, size = 24, bgColor, padding = 0, isDynamicSize = false }: Props) {
  const src = {
    EPIC: Epic,
    LEGENDARY: Legendary,
    MYTHIC: Mythic,
    RARE: Rare,
    UNCOMMON: Uncommon,
    COMMON: Unknown,
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
    FIRST_TRANSACTION: FirstTx,
    BLOCK9: Block9,
    BLOCK78: Block78,
    NAKAMOTO: Nakamoto,
    VINTAGE: Vintage,
    PIZZA: Pizza,
    JPEG: Jpeg,
    HITMAN: Hitman,
    SILK_ROAD: SilkRoad,
  }[type];
  if (!src) {
    return null;
  }
  const backgroundColor = bgColor ? Theme.colors.background[bgColor] : 'transparent';
  return (
    <Container bgColor={backgroundColor} padding={padding}>
      <ImageContainer size={size} dynamicSize={isDynamicSize}>
        <Image src={src} alt={type} />
      </ImageContainer>
    </Container>
  );
}

export default RareSatIcon;
