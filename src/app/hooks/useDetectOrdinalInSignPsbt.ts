import { getUtxoOrdinalBundle, ParsedPSBT } from '@secretkeylabs/xverse-core';
import { BundleItem, mapRareSatsAPIResponseToRareSats } from '@utils/rareSats';
import { isAxiosError } from 'axios';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignPsbt = () => {
  const { ordinalsAddress, network } = useWalletSelector();

  const handleOrdinalAndOrdinalInfo = async (parsedPsbt?: ParsedPSBT) => {
    const bundleItems: BundleItem[] = [];
    let userReceivesOrdinal = false;

    if (parsedPsbt) {
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
      });

      parsedPsbt.outputs.forEach((output) => {
        if (output.address === ordinalsAddress) {
          userReceivesOrdinal = true;
        }
      });
    }

    return {
      bundleItemsData: bundleItems,
      userReceivesOrdinal,
    };
  };

  return handleOrdinalAndOrdinalInfo;
};

export default useDetectOrdinalInSignPsbt;
