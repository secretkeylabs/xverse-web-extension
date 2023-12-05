import {
  Bundle,
  RareSatsType,
  RodarmorRareSats,
  RodarmorRareSatsType,
} from '@secretkeylabs/xverse-core';
import { t } from 'i18next';
import { getTruncatedAddress } from './helper';

export const getRareSatsLabelByType = (type: RareSatsType) => t(`RARE_SATS.RARITY_LABEL.${type}`);

export const getRareSatsColorsByRareSatsType = (rareSatsType: RareSatsType) => {
  const colors: Partial<Record<RareSatsType, string>> = {
    UNCOMMON: 'rgba(215, 105, 254, 0.20)',
    RARE: 'rgba(131, 113, 242, 0.20)',
    EPIC: 'rgba(145, 226, 96, 0.20)',
    LEGENDARY: 'rgba(255,205,120,0.20)',
    MYTHIC: 'rgba(255,244,203, 0.20)',
    COMMON: 'rgba(175,186,189,0.20)',
  };
  return colors[rareSatsType];
};

export const getFormattedTxIdVoutFromBundle = (bundle: Bundle) =>
  `${getTruncatedAddress(bundle.txid, 6)}:${bundle.vout}`;

export const getSatLabel = (satributes: RareSatsType[]): string => {
  const isLengthGrateThanTwo = satributes.length > 2;
  if (satributes.length === 1) {
    return `${getRareSatsLabelByType(satributes[0])}`;
  }

  // we expect to roadarmor sats be in the first position
  if (RodarmorRareSats.includes(satributes[0] as RodarmorRareSatsType)) {
    return `${getRareSatsLabelByType(satributes[0])} ${t(
      isLengthGrateThanTwo ? 'COMMON.COMBO' : `RARE_SATS.RARITY_LABEL.${satributes[1]}`,
    )}`;
  }

  return isLengthGrateThanTwo
    ? `${t('COMMON.COMBO')}`
    : `${getRareSatsLabelByType(satributes[0])} ${getRareSatsLabelByType(satributes[1])}`;
};

// remove later when we fix sign psbt screen
export type BundleItem =
  | {
      type: 'rare-sat';
      rarity_ranking: RodarmorRareSatsType;
      number: string;
    }
  | {
      type: 'inscribed-sat';
      rarity_ranking: RodarmorRareSatsType;
      number: string;
      inscription: {
        id: string;
        content_type: string;
      };
    }
  | {
      type: 'inscription';
      rarity_ranking: RodarmorRareSatsType;
      inscription: {
        id: string;
        content_type: string;
      };
    }
  | {
      type: 'unknown';
      rarity_ranking: 'unknown';
    };

// remove later when we fix sign psbt screen
export const convertV2ToV1Bundle = (v2: any): BundleItem[] => {
  console.log('v2:', v2);
  const bundleItems: BundleItem[] = [];
  v2.forEach((item) => {
    item.satRanges.forEach((satRange) => {
      satRange.inscriptions.forEach((inscription) => {
        bundleItems.push({
          type: 'inscription',
          rarity_ranking: 'COMMON',
          inscription,
        });
      });
    });
  });
  return bundleItems;
};

// remove later when we fix sign psbt screen
export const getBundleItemSubText = ({
  satType,
  rareSatsType,
}: {
  satType: any;
  rareSatsType: RareSatsType;
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
