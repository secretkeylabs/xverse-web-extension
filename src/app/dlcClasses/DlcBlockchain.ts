import {
  broadcastRawBtcTransaction,
  fetchBtcAddressUnspent,
  fetchBtcTransactionRawData,
  NetworkType,
} from '@secretkeylabs/xverse-core';
import { Blockchain, Utxo } from 'dlc-lib';
export class DlcBitcoinBlockchain implements Blockchain {
  constructor() {}

  async getTransaction(txid: string, network: NetworkType): Promise<string> {
    const rawTx = await fetchBtcTransactionRawData(txid, network);
    return rawTx;
  }
  async sendRawTransaction(txHex: string, network: NetworkType): Promise<void> {
    const tx = await broadcastRawBtcTransaction(txHex, network);
    console.log('Broadcasted TX: ', tx)
  }

  async getUtxosForAddress(address: string, network: NetworkType): Promise<Utxo[]> {
    const utxos = new Array<Utxo>();
    const utxoDataResponses = await fetchBtcAddressUnspent(address, network);

    utxoDataResponses.map((utxoDataResponse) => {
      const utxo = {
        txid: utxoDataResponse.tx_hash,
        vout: utxoDataResponse.tx_output_n,
        amount: utxoDataResponse.value,
        reserved: false,
        address,
        redeemScript: '',
        maxWitnessLength: 107,
      };
      utxos.push(utxo);
    });
    return utxos;
  }
}
