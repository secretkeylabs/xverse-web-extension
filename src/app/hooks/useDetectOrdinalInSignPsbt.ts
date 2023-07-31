import { getOrdinalIdFromUtxo, Inscription, ParsedPSBT, UTXO } from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import useOrdinalsApi from './useOrdinalsApi';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignPsbt = (parsedPsbt: '' | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [userReceivesOrdinal, setUserReceivesOrdinal] = useState(false);
  const [ordinalInfoData, setOrdinalInfoData] = useState<Array<Inscription>>([]);
  const { ordinalsAddress } = useWalletSelector();
  const OrdinalsApi = useOrdinalsApi();

  const getOrdinalId = async (utxoHash: string, index: number) => {
    const utxo: UTXO = {
      txid: utxoHash,
      vout: index,
      status: {
        confirmed: false,
      },
      value: 0,
    };
    const data = await getOrdinalIdFromUtxo(utxo);
    return data;
  };

  async function handleOrdinalAndOrdinalInfo() {
    const ordinals: Inscription[] = [];
    if (parsedPsbt) {
      setLoading(true);
      await Promise.all(
        parsedPsbt.inputs.map(async (input) => {
          const data = await getOrdinalId(input.txid, input.index);
          if (data) {
            const response = await OrdinalsApi.getInscription(data);
            ordinals.push(response);
          }
        }),
      );
      setOrdinalInfoData(ordinals);
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
    ordinalInfoData,
    userReceivesOrdinal,
  };
};

export default useDetectOrdinalInSignPsbt;
