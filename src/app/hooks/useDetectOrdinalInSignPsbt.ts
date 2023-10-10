import { getUtxoOrdinalBundle, ParsedPSBT } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import { BundleItem, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignPsbt = (parsedPsbt: '' | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [userReceivesOrdinal, setUserReceivesOrdinal] = useState(false);
  const [bundleItemsData, setBundleItemsData] = useState<BundleItem[]>([]);
  const { ordinalsAddress } = useWalletSelector();

  async function handleOrdinalAndOrdinalInfo() {
    const bundleItems: BundleItem[] = [];
    if (parsedPsbt) {
      setLoading(true);
      await Promise.all(
        parsedPsbt.inputs.map(async (input) => {
          const data = await getUtxoOrdinalBundle(input.txid, input.index);
          console.log({ data });

          const bundle = mapRareSatsAPIResponseToRareSats(data);
          bundle.items.forEach((item) => {
            // we don't show unknown items for now
            if (item.type === 'unknown') {
              return;
            }
            bundleItems.push(item);
          });
        }),
      );
      setBundleItemsData(bundleItems);
      setLoading(false);
      parsedPsbt.outputs.forEach(async (output) => {
        if (output.address === ordinalsAddress) {
          setUserReceivesOrdinal(true);
        }
      });
    }
  }

  useEffect(() => {
    handleOrdinalAndOrdinalInfo();
  }, []);

  return {
    loading,
    bundleItemsData,
    userReceivesOrdinal,
  };
};

export default useDetectOrdinalInSignPsbt;
