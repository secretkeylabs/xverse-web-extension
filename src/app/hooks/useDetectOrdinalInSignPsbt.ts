import {
  Bundle,
  BundleSatRange,
  getUtxoOrdinalBundle,
  mapRareSatsAPIResponseToBundle,
  ParsedPSBT,
} from '@secretkeylabs/xverse-core';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';

type InputsBundle = Pick<Bundle, 'value' | 'satRanges' | 'totalExoticSats'>;

const useDetectOrdinalInSignPsbt = (parsedPsbt: undefined | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [userReceivesOrdinal, setUserReceivesOrdinal] = useState(false);
  const [bundleItemsData, setBundleItemsData] = useState<InputsBundle>({
    value: 0,
    satRanges: [],
    totalExoticSats: 0,
  });
  const { ordinalsAddress, network } = useWalletSelector();

  async function handleOrdinalAndOrdinalInfo() {
    const satRanges: BundleSatRange[] = [];
    let value = 0;
    let totalExoticSats = 0;
    if (parsedPsbt) {
      setLoading(true);
      await Promise.all(
        parsedPsbt.inputs.map(async (input) => {
          try {
            const data = await getUtxoOrdinalBundle(network.type, input.txid, input.index);

            const bundle = mapRareSatsAPIResponseToBundle(data);
            satRanges.push(...bundle.satRanges);
            value += bundle.value;
            totalExoticSats += bundle.totalExoticSats;
          } catch (e) {
            // we get back a 404 if the UTXO is not found, so it is likely this is a UTXO from an unpublished txn
            if (!isAxiosError(e) || e.response?.status !== 404) {
              // rethrow error if response was not 404
              throw e;
            }
          }
        }),
      );

      setBundleItemsData({ value, satRanges, totalExoticSats });
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
