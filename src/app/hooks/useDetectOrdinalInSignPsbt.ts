import {
  Bundle,
  BundleSatRange,
  getUtxoOrdinalBundle,
  mapRareSatsAPIResponseToBundle,
  ParsedPSBT,
} from '@secretkeylabs/xverse-core';
import useWalletSelector from './useWalletSelector';

export type InputsBundle = Pick<Bundle, 'value' | 'satRanges' | 'totalExoticSats'>;

const useDetectOrdinalInSignPsbt = () => {
  const { ordinalsAddress, network } = useWalletSelector();

  const handleOrdinalAndOrdinalInfo = async (parsedPsbt?: ParsedPSBT) => {
    const satRanges: BundleSatRange[] = [];
    let value = 0;
    let totalExoticSats = 0;
    let userReceivesOrdinal = false;

    if (parsedPsbt) {
      const inputsRequest = parsedPsbt.inputs.map((input) =>
        getUtxoOrdinalBundle(network.type, input.txid, input.index),
      );
      const inputsResponse = await Promise.all(inputsRequest);
      inputsResponse.forEach((inputResponse) => {
        const bundle = mapRareSatsAPIResponseToBundle(inputResponse);
        value += bundle.value;
        totalExoticSats += bundle.totalExoticSats;
        satRanges.push(...bundle.satRanges);
      });

      parsedPsbt.outputs.forEach((output) => {
        if (output.address === ordinalsAddress) {
          userReceivesOrdinal = true;
        }
      });
    }

    const bundleItemsData = {
      value,
      satRanges,
      totalExoticSats,
    };

    return {
      bundleItemsData,
      userReceivesOrdinal,
    };
  };

  return handleOrdinalAndOrdinalInfo;
};

export default useDetectOrdinalInSignPsbt;
