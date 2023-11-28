import {
  Bundle,
  RareSatsType,
  RoadArmorRareSats,
  RoadArmorRareSatsType,
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
  if (RoadArmorRareSats.includes(satributes[0] as RoadArmorRareSatsType)) {
    return `${getRareSatsLabelByType(satributes[0])} ${t(
      isLengthGrateThanTwo ? 'COMMON.COMBO' : `RARE_SATS.RARITY_LABEL.${satributes[1]}`,
    )}`;
  }

  return isLengthGrateThanTwo
    ? `${t('COMMON.COMBO')}`
    : `${getRareSatsLabelByType(satributes[0])} ${getRareSatsLabelByType(satributes[1])}`;
};
