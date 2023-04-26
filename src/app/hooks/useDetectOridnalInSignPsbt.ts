import {
  BtcUtxoDataResponse,
  getOrdinalIdFromUtxo,
  getOrdinalInfo,
  OrdinalInfo,
  ParsedPSBT,
} from '@secretkeylabs/xverse-core';
import { useEffect, useState } from 'react';

const useDetectOrdinalInSignPsbt = (parsedPsbt: '' | ParsedPSBT) => {
  const [loading, setLoading] = useState(false);
  const [ordinalId, setOrdinalId] = useState<string | undefined>(undefined);
  const [ordinalInfoData, setOrdinalInfoData] = useState<OrdinalInfo | undefined>(undefined);

  const getOridnalId = async (utxoHash: string, index: number) => {
    const utxo: BtcUtxoDataResponse = {
      tx_hash: utxoHash,
      block_height: 0,
      tx_input_n: 0,
      tx_output_n: index,
      value: 0,
      ref_balance: 0,
      spent: false,
      confirmations: 0,
      confirmed: '',
      double_spend: false,
      double_spend_tx: '',
    };
    const data = await getOrdinalIdFromUtxo(utxo);
    return data;
  };

  async function handleOrdinalAndOrdinalInfo() {
    if (parsedPsbt) {
      setLoading(true);
      const data = await getOridnalId(parsedPsbt.inputs[0].txid, parsedPsbt.inputs[0].index);
      if (data) {
        setOrdinalId(data);
        const response = await getOrdinalInfo(data);
        setOrdinalInfoData(response);
      }
      setLoading(false);
    }
  }

  useEffect(() => {
    handleOrdinalAndOrdinalInfo();
  }, []);

  return {
    ordinalId,
    loading,
    ordinalInfoData,
  };
};

export default useDetectOrdinalInSignPsbt;
