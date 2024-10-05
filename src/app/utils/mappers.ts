import type { FungibleToken, RuneBase } from '@secretkeylabs/xverse-core';

// eslint-disable-next-line import/prefer-default-export
export const mapRuneBaseToFungibleToken = (rune: RuneBase): FungibleToken => ({
  protocol: 'runes',
  name: rune.runeName,
  principal: rune.runeId,
  assetName: '',
  balance: '',
  total_received: '',
  total_sent: '',
  runeSymbol: rune.symbol,
  runeInscriptionId: rune.inscriptionId,
});
