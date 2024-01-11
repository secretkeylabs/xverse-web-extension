import {
  getBtcFees,
  getBtcFeesForNonOrdinalBtcSend,
  getBtcFeesForOrdinalSend,
  Recipient,
  UTXO,
} from '@secretkeylabs/xverse-core';
import { useEffect, useMemo, useState } from 'react';
import useBtcClient from './useBtcClient';
import useOrdinalsByAddress from './useOrdinalsByAddress';
import useWalletSelector from './useWalletSelector';

interface Params {
  isRestoreFlow: boolean;
  nonOrdinalUtxos?: UTXO[];
  btcRecipients?: Recipient[];
  type?: string;
  ordinalTxUtxo?: UTXO;
}

interface FeeData {
  standardFeeRate: string;
  standardTotalFee: string;
  highFeeRate: string;
  highTotalFee: string;
}

const useBtcFees = ({
  isRestoreFlow,
  nonOrdinalUtxos,
  btcRecipients,
  type,
  ordinalTxUtxo,
}: Params): FeeData => {
  const [feeData, setFeeData] = useState<FeeData>({
    standardFeeRate: '',
    standardTotalFee: '',
    highFeeRate: '',
    highTotalFee: '',
  });
  const { network, btcAddress, ordinalsAddress } = useWalletSelector();
  const btcClient = useBtcClient();
  const { ordinals } = useOrdinalsByAddress(btcAddress);
  const ordinalsUtxos = useMemo(() => ordinals?.map((ord) => ord.utxo), [ordinals]);

  useEffect(() => {
    async function fetchFees(mode: 'standard' | 'high') {
      try {
        let feeInfo;
        if (isRestoreFlow) {
          feeInfo = await getBtcFeesForNonOrdinalBtcSend(
            btcAddress,
            nonOrdinalUtxos || [],
            ordinalsAddress,
            network.type,
            mode,
          );
        } else if (type !== 'Ordinals' && btcRecipients) {
          feeInfo = await getBtcFees(btcRecipients, btcAddress, btcClient, network.type, mode);
        } else if (type === 'Ordinals' && btcRecipients && ordinalTxUtxo) {
          feeInfo = await getBtcFeesForOrdinalSend(
            btcRecipients[0].address,
            ordinalTxUtxo,
            btcAddress,
            btcClient,
            network.type,
            ordinalsUtxos || [],
            mode,
          );
        }

        return {
          fee: feeInfo?.fee.toString() || '',
          feeRate: feeInfo?.selectedFeeRate.toString() || '',
        };
      } catch (error) {
        return { fee: '', feeRate: '' };
      }
    }

    async function calculateFees() {
      const standard = await fetchFees('standard');
      const high = await fetchFees('high');

      setFeeData({
        standardFeeRate: standard.feeRate,
        standardTotalFee: standard.fee,
        highFeeRate: high.feeRate,
        highTotalFee: high.fee,
      });
    }

    calculateFees();
  }, [
    isRestoreFlow,
    nonOrdinalUtxos,
    btcRecipients,
    type,
    ordinalTxUtxo,
    btcAddress,
    btcClient,
    network,
    ordinalsUtxos,
    ordinalsAddress,
  ]);

  return feeData;
};

export default useBtcFees;
