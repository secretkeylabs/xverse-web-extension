import { t } from 'i18next';
import type { Account } from '@secretkeylabs/xverse-core/types';
import { getTruncatedAddress } from './helper';

const RoadArmorRareSats = ['uncommon', 'rare', 'epic', 'legendary', 'mythic', 'common'] as const;
export type RoadArmorRareSatsType = (typeof RoadArmorRareSats)[number];

export const RareSats = ['unknown', ...RoadArmorRareSats] as const;
export type RareSatsType = (typeof RareSats)[number];

export const getRareSatsLabelByType = (type: RareSatsType) =>
  t(`RARE_SATS.RARE_TYPES.${type.toUpperCase()}`);

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
      type: getRareSatsLabelByType(rareSatsType ?? 'unknown'),
    }),
    'inscribed-sat': t('RARE_SATS.SAT_TYPES.INSCRIBED_RARE_SAT', {
      type: getRareSatsLabelByType(rareSatsType ?? 'unknown'),
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
      backgroundColor: 'rgba(175,186,189,0.15)',
    },
    uncommon: {
      color: 'rgb(0,218,182)',
      backgroundColor: 'rgba(0,218,182,0.15)',
    },
    rare: {
      color: 'rgb(100,196,246)',
      backgroundColor: 'rgba(100,196,246,0.15)',
    },
    epic: {
      color: 'rgb(182,105,254)',
      backgroundColor: 'rgba(182,105,254,0.15)',
    },
    legendary: {
      color: 'rgb(255,205,120)',
      backgroundColor: 'rgba(255,205,120,0.15)',
    },
    mythic: {
      color: 'rgb(255,244,203)',
      backgroundColor: 'rgba(255,244,203, 0.15)',
    },
    common: {
      color: 'rgb(216,216,216)',
      backgroundColor: 'rgba(216,216,216,0.15)',
    },
  }[rareSatsType ?? 'common']);

type SatInscription = {
  id: string;
  offset: number;
  content_type: string;
};

type Sat = { number: string; offset: number; rarity_ranking: RoadArmorRareSatsType };

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
      rarity_ranking: 'unknown';
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
    return { ...generalBundleInfo, items: [{ type: 'unknown', rarity_ranking: 'unknown' }] };
  }

  // only rare sats
  if (!apiBundles.inscriptions.length) {
    return {
      ...generalBundleInfo,
      items: apiBundles.sats.map((sat) => ({
        type: 'rare-sat',
        rarity_ranking: sat.rarity_ranking,
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
      rarity_ranking: 'common',
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
        rarity_ranking: sat.rarity_ranking,
        number: sat.number,
      });
    }
    items.push({
      type: 'inscribed-sat',
      rarity_ranking: sat.rarity_ranking,
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

export const getBundleId = (bundle: Bundle): string => {
  if (
    bundle.items.length === 1 &&
    bundle.items[0].type !== 'unknown' &&
    bundle.items[0].type !== 'inscription'
  ) {
    return bundle.items[0].number;
  }

  return getTruncatedAddress(bundle.txid, 6);
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
    return getTruncatedAddress(bundle.txid, 6);
  }
  if (item.type === 'inscription' || item.type === 'inscribed-sat') {
    return getTruncatedAddress(item.inscription.id, 6);
  }
  return item.number;
};
