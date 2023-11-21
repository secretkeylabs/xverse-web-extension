import { t } from 'i18next';
import { getTruncatedAddress } from './helper';

export const RoadArmorRareSats = [
  'MYTHIC',
  'LEGENDARY',
  'EPIC',
  'RARE',
  'UNCOMMON',
  'COMMON',
] as const;
export type RoadArmorRareSatsType = (typeof RoadArmorRareSats)[number];

export const Sattributes = [
  'BLACK_LEGENDARY',
  'BLACK_EPIC',
  'BLACK_RARE',
  'BLACK_UNCOMMON',
  'FIBONACCI',
  '1D_PALINDROME',
  '2D_PALINDROME',
  '3D_PALINDROME',
  'SEQUENCE_PALINDROME',
  'PERFECT_PALINCEPTION',
  'PALIBLOCK_PALINDROME',
  'PALINDROME',
  'NAME_PALINDROME',
  'ALPHA',
  'OMEGA',
  'FIRST_TRANSACTION',
  'BLOCK9',
  'BLOCK78',
  'NAKAMOTO',
  'VINTAGE',
  'PIZZA',
  'JPEG',
  'HITMAN',
  'SILK_ROAD',
] as const;
export type SattributesType = (typeof Sattributes)[number];

// TODO: remove unknown and unify with common
export const RareSats = [...RoadArmorRareSats, 'UNKNOWN', ...Sattributes] as const;
export type RareSatsType = (typeof RareSats)[number];

export const getRareSatsLabelByType = (type: RareSatsType) => t(`RARE_SATS.RARITY_LABEL.${type}`);

export type SatType = 'inscription' | 'rare-sat' | 'inscribed-sat' | 'unknown';

export const getBundleItemSubText = ({
  satType,
  rareSatsType,
}: {
  satType: SatType;
  rareSatsType?: RareSatsType;
}) =>
  ({
    inscription: t('COMMON.INSCRIPTION'),
    'rare-sat': t('RARE_SATS.SAT_TYPES.RARE_SAT', {
      type: getRareSatsLabelByType(rareSatsType ?? 'UNKNOWN'),
    }),
    'inscribed-sat': t('RARE_SATS.SAT_TYPES.INSCRIBED_RARE_SAT', {
      type: getRareSatsLabelByType(rareSatsType ?? 'UNKNOWN'),
    }),
    unknown: t('RARE_SATS.SAT_TYPES.UNKNOWN_RARE_SAT'),
  }[satType]);

// TODO: make number separator dynamic by locale, extension only supports en-US for now so this is not a priority
export const getRarityLabelByRareSatsType = (rareSatsType: RareSatsType) =>
  ({
    mythic: t('RARE_SATS.RARITY_RANKING_POSITION', { position: '1 / 2.1' }),
    legendary: t('RARE_SATS.RARITY_RANKING_POSITION', { position: '5 / 2.1' }),
    epic: t('RARE_SATS.RARITY_RANKING_POSITION', { position: '32 / 2.1' }),
    rare: t('RARE_SATS.RARITY_RANKING_POSITION', { position: '3,437 / 2.1' }),
    uncommon: t('RARE_SATS.RARITY_RANKING_POSITION', { position: '6,929,999 / 2.1' }),
    common: '--',
  }[rareSatsType]);

export const getRareSatsColorsByRareSatsType = (rareSatsType: RareSatsType) =>
  ({
    unknown: {
      color: 'rgb(175,186,189)',
      backgroundColor: 'rgba(175,186,189,0.20)',
    },
    uncommon: {
      color: 'rgb(215, 105, 254)',
      backgroundColor: 'rgba(215, 105, 254, 0.20)',
    },
    rare: {
      color: 'rgb(131, 113, 242)',
      backgroundColor: 'rgba(131, 113, 242, 0.20)',
    },
    epic: {
      color: 'rgb(145, 226, 96)',
      backgroundColor: 'rgba(145, 226, 96, 0.20)',
    },
    legendary: {
      color: 'rgb(255,205,120)',
      backgroundColor: 'rgba(255,205,120,0.20)',
    },
    mythic: {
      color: 'rgb(255,244,203)',
      backgroundColor: 'rgba(255,244,203, 0.20)',
    },
    common: {
      color: 'rgb(216,216,216)',
      backgroundColor: 'rgba(216,216,216,0.20)',
    },
  }[rareSatsType ?? 'common']);

type SatInscription = {
  id: string;
  offset: number;
  content_type: string;
};

type Sat = { number: string; offset: number; rarity_ranking: Lowercase<RoadArmorRareSatsType> };

export type ApiBundle = {
  txid: string;
  vout: number;
  block_height: number;
  value: number;
  sats: Array<Sat>;
  inscriptions: Array<SatInscription>;
};

export type BundleItem =
  | {
      type: 'rare-sat';
      rarity_ranking: RoadArmorRareSatsType;
      number: string;
    }
  | {
      type: 'inscribed-sat';
      rarity_ranking: RoadArmorRareSatsType;
      number: string;
      inscription: {
        id: string;
        content_type: string;
      };
    }
  | {
      type: 'inscription';
      rarity_ranking: RoadArmorRareSatsType;
      inscription: {
        id: string;
        content_type: string;
      };
    }
  | {
      type: 'unknown';
      rarity_ranking: 'UNKNOWN';
    };

export type Bundle = Omit<ApiBundle, 'sats' | 'inscriptions'> & {
  items: Array<BundleItem>;
};

export const mapRareSatsAPIResponseToRareSats = (apiBundles: ApiBundle): Bundle => {
  const generalBundleInfo = {
    txid: apiBundles.txid,
    vout: apiBundles.vout,
    block_height: apiBundles.block_height,
    value: apiBundles.value,
  };

  // unknown
  if (!apiBundles.sats.length && !apiBundles.inscriptions.length) {
    return { ...generalBundleInfo, items: [{ type: 'unknown', rarity_ranking: 'UNKNOWN' }] };
  }

  // only rare sats
  if (!apiBundles.inscriptions.length) {
    return {
      ...generalBundleInfo,
      items: apiBundles.sats.map((sat) => ({
        type: 'rare-sat',
        rarity_ranking: sat.rarity_ranking.toUpperCase() as RoadArmorRareSatsType,
        number: sat.number,
      })),
    };
  }

  // can be mixed
  const satsObject = apiBundles.sats.reduce((acc, sat) => {
    acc[sat.offset] = sat;
    return acc;
  }, {} as Record<number, Sat>);

  const inscriptionsObject: Record<number, SatInscription> = {};
  const items: Array<BundleItem> = [];

  apiBundles.inscriptions.forEach((inscription) => {
    inscriptionsObject[inscription.offset] = inscription;

    if (satsObject[inscription.offset]) {
      return;
    }
    items.push({
      type: 'inscription',
      rarity_ranking: 'COMMON',
      inscription: {
        id: inscription.id,
        content_type: inscription.content_type,
      },
    });
  });

  apiBundles.sats.forEach((sat) => {
    const inscription = inscriptionsObject[sat.offset];
    if (!inscription) {
      return items.push({
        type: 'rare-sat',
        rarity_ranking: sat.rarity_ranking.toUpperCase() as RoadArmorRareSatsType,
        number: sat.number,
      });
    }
    items.push({
      type: 'inscribed-sat',
      rarity_ranking: sat.rarity_ranking.toUpperCase() as RoadArmorRareSatsType,
      number: sat.number,
      inscription: {
        id: inscription.id,
        content_type: inscription.content_type,
      },
    });
  });

  return {
    ...generalBundleInfo,
    items,
  };
};

export const getFormattedTxIdVoutFromBundle = (bundle: Bundle | BundleV2) =>
  `${getTruncatedAddress(bundle.txid, 6)}:${bundle.vout}`;

export const getBundleId = (bundle: Bundle): string => {
  if (
    bundle.items.length === 1 &&
    bundle.items[0].type !== 'unknown' &&
    bundle.items[0].type !== 'inscription'
  ) {
    return bundle.items[0].number;
  }

  return getFormattedTxIdVoutFromBundle(bundle);
};

export const getBundleSubText = (bundle: Bundle): string => {
  if (bundle.items.length > 1) {
    return t('RARE_SATS.RARE_SATS_BUNDLE');
  }

  const item = bundle.items[0];
  return getBundleItemSubText({ satType: item.type, rareSatsType: item.rarity_ranking });
};

export const getBundleItemId = (bundle: Bundle, index: number): string => {
  const item = bundle.items[index];
  if (item.type === 'unknown') {
    return getFormattedTxIdVoutFromBundle(bundle);
  }
  if (item.type === 'inscription' || item.type === 'inscribed-sat') {
    return getTruncatedAddress(item.inscription.id, 6);
  }
  return item.number;
};

// TODO: once we define the layout changes for inscriptions and buy/sell confirmation screen we can remove old implementation and remove the v2 from here
type Inscription = {
  id: string;
  content_type: string;
};

type BundleSatRange = Omit<ApiBundleSatRange, 'year_mined'> & {
  totalSats: number;
  yearMined: number;
};

export type BundleV2 = Omit<ApiBundleV2, 'sat_ranges'> & {
  satRanges: BundleSatRange[];
  inscriptions: Inscription[];
  satributes: RareSatsType[][];
};

export type ApiBundleSatRange = {
  range: {
    start: string;
    end: string;
  };
  year_mined: number;
  block: number;
  offset: number;
  satributes: RareSatsType[];
  inscriptions: Inscription[];
};

export type ApiBundleV2 = {
  txid: string;
  vout: number;
  block_height?: number;
  value: number;
  sat_ranges: ApiBundleSatRange[];
};

export const mapRareSatsAPIResponseToRareSatsV2 = (apiBundle: ApiBundleV2): BundleV2 => {
  const generalBundleInfo = {
    txid: apiBundle.txid,
    vout: apiBundle.vout,
    block_height: apiBundle.block_height,
    value: apiBundle.value,
  };

  const commonUnknownRange: BundleSatRange = {
    range: {
      start: '0',
      end: '0',
    },
    yearMined: 0,
    block: 0,
    offset: 0,
    satributes: ['UNKNOWN'],
    inscriptions: [],
    totalSats: apiBundle.value,
  };

  // if bundle has and empty sat ranges, it means that it's a common/unknown bundle
  if (!apiBundle.sat_ranges.length) {
    return {
      ...generalBundleInfo,
      satRanges: [commonUnknownRange],
      inscriptions: [],
      satributes: [['UNKNOWN']],
    };
  }

  const satRanges = apiBundle.sat_ranges.map((satRange) => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { year_mined, ...satRangeProps } = satRange;
    return {
      ...satRangeProps,
      totalSats: Number(BigInt(satRange.range.end) - BigInt(satRange.range.start)),
      yearMined: year_mined,
    };
  });

  // we map this previous to a possible push of a common unknown range cause we don't need to show the icon rare sats tab. We only show it if the bundle is fully common/unknown
  const inscriptions = satRanges.reduce(
    (acc, curr) => [...acc, ...curr.inscriptions],
    [] as BundleV2['satRanges'][0]['inscriptions'],
  );
  const satributes = satRanges.reduce(
    (acc, curr) => [...acc, curr.satributes],
    [] as RareSatsType[][],
  );

  // if totalExotics doesn't match the value of the bundle, it means that the bundle is not fully exotic and we need to add a common unknown sat range more
  const totalExotics = satRanges.reduce((acc, curr) => acc + curr.totalSats, 0);
  if (totalExotics !== apiBundle.value) {
    satRanges.push({
      ...commonUnknownRange,
      totalSats: apiBundle.value - totalExotics,
    });
  }

  return {
    ...generalBundleInfo,
    satRanges,
    inscriptions,
    satributes,
  };
};
