import OneDPali from '@assets/img/nftDashboard/rareSats/1Dpali.png';
import FirstTx from '@assets/img/nftDashboard/rareSats/1stx.png';
import TwoDPali from '@assets/img/nftDashboard/rareSats/2Dpali.png';
import ThreeDPali from '@assets/img/nftDashboard/rareSats/3Dpali.png';
import Alpha from '@assets/img/nftDashboard/rareSats/alpha.png';
import Block286 from '@assets/img/nftDashboard/rareSats/b286.png';
import Block78 from '@assets/img/nftDashboard/rareSats/b78.png';
import Block9 from '@assets/img/nftDashboard/rareSats/b9.png';
import Block9_450 from '@assets/img/nftDashboard/rareSats/b9_450.png';
import BlackEpic from '@assets/img/nftDashboard/rareSats/black_epic.png';
import BlackLegendary from '@assets/img/nftDashboard/rareSats/black_legendary.png';
import BlackRare from '@assets/img/nftDashboard/rareSats/black_rare.png';
import BlackUncommon from '@assets/img/nftDashboard/rareSats/black_uncommon.png';
import Epic from '@assets/img/nftDashboard/rareSats/epic.png';
import FibonacciSequence from '@assets/img/nftDashboard/rareSats/fibonacci.png';
import Hitman from '@assets/img/nftDashboard/rareSats/hitman.png';
import Jpeg from '@assets/img/nftDashboard/rareSats/jpeg.png';
import Legacy from '@assets/img/nftDashboard/rareSats/legacy.png';
import Legendary from '@assets/img/nftDashboard/rareSats/legendary.png';
import Mythic from '@assets/img/nftDashboard/rareSats/mythic.png';
import Nakamoto from '@assets/img/nftDashboard/rareSats/nakamoto.png';
import Omega from '@assets/img/nftDashboard/rareSats/omega.png';
import Palindrome from '@assets/img/nftDashboard/rareSats/pali.png';
import BlockPali from '@assets/img/nftDashboard/rareSats/paliblock.png';
import Palinception from '@assets/img/nftDashboard/rareSats/perfectpaliception.png';
import Pizza from '@assets/img/nftDashboard/rareSats/pizza.png';
import Rare from '@assets/img/nftDashboard/rareSats/rare.png';
import SequencePali from '@assets/img/nftDashboard/rareSats/seqpali.png';
import SilkRoad from '@assets/img/nftDashboard/rareSats/silkroad.png';
import Uncommon from '@assets/img/nftDashboard/rareSats/uncommon.png';
import Unknown from '@assets/img/nftDashboard/rareSats/unknown.png';
import Vintage from '@assets/img/nftDashboard/rareSats/vintage.png';
import type { RareSatsType } from '@secretkeylabs/xverse-core';
import styled from 'styled-components';

const Image = styled.img<{ size?: number }>`
  object-fit: cover;
  width: ${(props) => (typeof props.size === 'undefined' ? '100%' : `${props.size}px`)};
  height: ${(props) => (typeof props.size === 'undefined' ? '100%' : `${props.size}px`)};
`;

interface Props {
  type: RareSatsType;
  size?: number;
}

function RareSatIcon({ type, size }: Props) {
  const srcByType: Record<RareSatsType, string> = {
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
    ALPHA: Alpha,
    OMEGA: Omega,
    FIRST_TRANSACTION: FirstTx,
    BLOCK9: Block9,
    BLOCK9_450: Block9_450,
    BLOCK78: Block78,
    BLOCK286: Block286,
    NAKAMOTO: Nakamoto,
    VINTAGE: Vintage,
    PIZZA: Pizza,
    JPEG: Jpeg,
    HITMAN: Hitman,
    SILK_ROAD: SilkRoad,
    LEGACY: Legacy,
  };
  const src = srcByType[type];
  if (!src) {
    return null;
  }
  return <Image src={src} alt={type} size={size} />;
}

export default RareSatIcon;
