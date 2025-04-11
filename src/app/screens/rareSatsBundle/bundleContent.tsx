import { useRuneFungibleTokensQuery } from '@hooks/queries/runes/useRuneFungibleTokensQuery';
import { RuneAmountContainer } from '@screens/rareSatsBundle/index.styled';
import RareSatsBundleGridItem from '@screens/rareSatsBundle/rareSatsBundleGridItem';
import RuneAmount from '@screens/rareSatsBundle/runeAmount';
import type { Bundle, BundleSatRange, FungibleToken } from '@secretkeylabs/xverse-core';
import { POPUP_WIDTH } from '@utils/constants';

export default function BundleContent({ bundle }: { bundle: Bundle }) {
  const isGalleryOpen: boolean = document.documentElement.clientWidth > POPUP_WIDTH;
  const { data: runesCoinsList } = useRuneFungibleTokensQuery();
  return (
    <>
      {bundle?.satRanges.map((item: BundleSatRange) => (
        <RareSatsBundleGridItem key={`${item.block}-${item.offset}`} item={item} />
      ))}
      {bundle?.runes?.map((runeUtxo) => {
        const matchedRune: FungibleToken | undefined = (runesCoinsList ?? []).find(
          (ft) => ft.name === runeUtxo[0],
        );
        if (matchedRune) {
          return (
            // eslint-disable-next-line react/jsx-key
            <RuneAmountContainer isGalleryOpen={isGalleryOpen}>
              <RuneAmount
                hasSufficientBalance
                rune={{
                  runeName: matchedRune.name,
                  runeId: matchedRune.principal,
                  amount: BigInt(Number(runeUtxo[1].amount)),
                  divisibility: matchedRune.decimals ?? 0,
                  symbol: matchedRune.runeSymbol ?? '',
                  inscriptionId: matchedRune.runeInscriptionId ?? '',
                }}
              />
            </RuneAmountContainer>
          );
        }
        return null;
      })}
    </>
  );
}
