import {
  getOrdinalIdFromUtxo,
  getOrdinalInfo,
  OrdinalInfo,
  ParsedPSBT,
  UTXO,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';
import useWalletSelector from './useWalletSelector';

const useDetectOrdinalInSignPsbt = (parsedPsbt: '' | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [ordinalId, setOrdinalId] = useState<string | undefined>(undefined);
  const [userReceivesOrdinal, setUserReceivesOrdinal] = useState(false);
  const [ordinalInfoData, setOrdinalInfoData] = useState<OrdinalInfo | undefined>(undefined);
  const {
    ordinalsAddress,
  } = useWalletSelector();

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
    if (parsedPsbt) {
      setLoading(true);
      parsedPsbt.inputs.forEach(async (input) => {
        const data = await getOrdinalId(input.txid, input.index);
        if (data) {
          setOrdinalId(data);
          const response = await getOrdinalInfo(data);
          setOrdinalInfoData(response);
        }
        setLoading(false);
      });
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
    ordinalId,
    loading,
    ordinalInfoData,
    userReceivesOrdinal,
  };
};

export default useDetectOrdinalInSignPsbt;
