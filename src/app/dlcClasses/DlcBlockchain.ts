import {
  broadcastRawBtcTransaction,
  fetchBtcAddressUnspent,
  fetchBtcTransactionData,
  NetworkType,
} from '@secretkeylabs/xverse-core';
import { Blockchain, Utxo } from 'dlc-lib';

export class DlcBitcoinBlockchain implements Blockchain {
  constructor() {}

  async getTransaction(txid: string, network: NetworkType): Promise<string> {
    // Not yet available in the xverse-core, might change it later when the update is released
    const rawTx = await fetchBtcTransactionData(txid, network);
    console.log('xverse-web-extension/DlcBlockchain.ts/getTransaction | Raw TX: ', rawTx);
    return rawTx;
  }
  async sendRawTransaction(txHex: string, network: NetworkType): Promise<void> {
    console.log('Broadcasting!')
    const response = await broadcastRawBtcTransaction(txHex, network);
    console.log(response)
  }

  async getUtxosForAddress(address: string, network: NetworkType): Promise<Utxo[]> {
    const utxos = new Array<Utxo>();
    const utxoDataResponses = await fetchBtcAddressUnspent(address, network);

    console.log(
      'xverse-web-extension/DlcBlockchain.ts/getUtxosForAddress | UTXO Data Responses: ',
      utxoDataResponses
    );

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
