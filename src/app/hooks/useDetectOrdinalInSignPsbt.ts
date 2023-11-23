import { getUtxoOrdinalBundle, ParsedPSBT } from '@secretkeylabs/xverse-core';
import { BundleItem, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignPsbt = (parsedPsbt: undefined | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [userReceivesOrdinal, setUserReceivesOrdinal] = useState(false);
  const [bundleItemsData, setBundleItemsData] = useState<BundleItem[]>([]);
  const { ordinalsAddress, network } = useWalletSelector();

  async function handleOrdinalAndOrdinalInfo() {
    const bundleItems: BundleItem[] = [];
    if (parsedPsbt) {
      setLoading(true);
      await Promise.all(
        parsedPsbt.inputs.map(async (input) => {
          try {
            const data = await getUtxoOrdinalBundle(network.type, input.txid, input.index);

            const bundle = mapRareSatsAPIResponseToRareSats(data);
            bundle.items.forEach((item) => {
              // we don't show unknown items for now
              if (item.type === 'unknown') {
                return;
              }
              bundleItems.push(item);
            });
          } catch (e) {
            // we get back a 404 if the UTXO is not found, so it is likely this is a UTXO from an unpublished txn
            if (!isAxiosError(e) || e.response?.status !== 404) {
              // rethrow error if response was not 404
              throw e;
            }
          }
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
