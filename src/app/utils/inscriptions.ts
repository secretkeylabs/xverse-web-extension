import {
  CondensedInscription,
  Inscription,
  InscriptionCollectionsData,
  isBrcTransferValid,
} from '@secretkeylabs/xverse-core';
import type { Color } from 'theme';
import { BundleItem } from './rareSats';

export type Brc20Status = 'valid' | 'used';

export const isCollection = (collection: InscriptionCollectionsData): boolean =>
  collection.collection_id !== null;

export const getCollectionKey = (collection: InscriptionCollectionsData): string =>
  (isCollection(collection)
    ? collection.collection_id
    : collection.thumbnail_inscriptions?.[0]?.id) ?? '';

export const getInscriptionsCollectionGridItemId = (inscription?: Inscription): string =>
  inscription?.number?.toString() ?? '';

export const getInscriptionsCollectionGridItemSubText = (inscription?: Inscription): string => {
  if (inscription?.category === 'brc-20') {
    return isBrcTransferValid(inscription) ? 'Valid' : 'Used';
  }
  return '';
};

export const getInscriptionsCollectionGridItemSubTextColor = (inscription?: Inscription): Color => {
  if (inscription?.category === 'brc-20') {
    return isBrcTransferValid(inscription) ? 'success_light' : 'white_400';
  }
  return 'white_400';
};

export const getInscriptionsTabGridItemId = (collection: InscriptionCollectionsData) =>
  (isCollection(collection)
    ? collection.collection_name
    : collection.thumbnail_inscriptions?.[0]?.number?.toString()) ?? '';

export const getInscriptionsTabGridItemSubText = (collection: InscriptionCollectionsData) => {
  if (!isCollection(collection)) {
    return '';
  }
  return collection.total_inscriptions > 1 ? `${collection.total_inscriptions} Items` : '1 Item';
};

export const mapCondensedInscriptionToBundleItem = (
  inscription: CondensedInscription,
): BundleItem => ({
  inscription,
  type: 'inscription',
  rarity_ranking: 'COMMON', // TODO eventually want to fetch this rarity and display it
});
