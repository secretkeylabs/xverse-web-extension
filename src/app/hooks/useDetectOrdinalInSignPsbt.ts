import {
  Bundle,
  getUtxoOrdinalBundleIfFound,
  mapRareSatsAPIResponseToBundle,
  ParsedPSBT,
} from '@secretkeylabs/xverse-core';
import useWalletSelector from './useWalletSelector';

export type InputsBundle = (Pick<Bundle, 'satRanges' | 'totalExoticSats'> & {
  inputIndex: number;
})[];

const useDetectOrdinalInSignPsbt = () => {
  const { ordinalsAddress, network } = useWalletSelector();

  const handleOrdinalAndOrdinalInfo = async (
    parsedPsbt?: ParsedPSBT,
  ): Promise<{ bundleItemsData: InputsBundle; userReceivesOrdinal: boolean }> => {
    const bundleItemsData: InputsBundle = [];
    let userReceivesOrdinal = false;

    if (parsedPsbt) {
      const inputsRequest = parsedPsbt.inputs.map((input) =>
        getUtxoOrdinalBundleIfFound(network.type, input.txid, input.index),
      );
      const inputsResponse = await Promise.all(inputsRequest);
      inputsResponse.forEach((inputResponse, index) => {
        if (!inputResponse) {
          return;
        }
        const bundle = mapRareSatsAPIResponseToBundle(inputResponse);
        if (
          bundle.inscriptions.length > 0 ||
          bundle.satributes.some((satributes) => !satributes.includes('COMMON'))
        ) {
          bundleItemsData.push({
            satRanges: bundle.satRanges,
            totalExoticSats: bundle.totalExoticSats,
            inputIndex: index,
          });
        }
      });

      parsedPsbt.outputs.forEach((output) => {
        if (output.address === ordinalsAddress) {
          userReceivesOrdinal = true;
        }
      });
    }

    return {
      bundleItemsData,
      userReceivesOrdinal,
    };
  };

  return handleOrdinalAndOrdinalInfo;
};

export default useDetectOrdinalInSignPsbt;
