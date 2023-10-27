import { getUtxoOrdinalBundle, ParsedPSBT } from '@secretkeylabs/xverse-core';
import { BundleItem, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignBatchPsbt = (parsedPsbts: ('' | ParsedPSBT)[]) => {
  const [results, setResults] = useState<
    { loading: boolean; bundleItemsData: BundleItem[]; userReceivesOrdinal: boolean }[]
  >(parsedPsbts.map(() => ({ loading: false, bundleItemsData: [], userReceivesOrdinal: false })));
  const { ordinalsAddress } = useWalletSelector();

  useEffect(() => {
    parsedPsbts.forEach(async (parsedPsbt, index) => {
      const bundleItems: BundleItem[] = [];
      if (parsedPsbt) {
        setResults((prevResults) =>
          prevResults.map((result, idx) => (idx === index ? { ...result, loading: true } : result)),
        );
        await Promise.all(
          parsedPsbt.inputs.map(async (input) => {
            try {
              const data = await getUtxoOrdinalBundle(input.txid, input.index);
              const bundle = mapRareSatsAPIResponseToRareSats(data);
              bundle.items.forEach((item) => {
                if (item.type !== 'unknown') {
                  bundleItems.push(item);
                }
              });
            } catch (e) {
              if (!isAxiosError(e) || e.response?.status !== 404) {
                throw e;
              }
            }
          }),
        );

        setResults((prevResults) =>
          prevResults.map((result, idx) =>
            idx === index ? { ...result, bundleItemsData: bundleItems } : result,
          ),
        );
        setResults((prevResults) =>
          prevResults.map((result, idx) =>
            idx === index ? { ...result, loading: false } : result,
          ),
        );

        parsedPsbt.outputs.forEach(async (output) => {
          if (output.address === ordinalsAddress) {
            setResults((prevResults) =>
              prevResults.map((result, idx) =>
                idx === index ? { ...result, userReceivesOrdinal: true } : result,
              ),
            );
          }
        });
      }
    });
  }, []);

  return results;
};

export default useDetectOrdinalInSignBatchPsbt;
