import {
  broadcastRawBtcTransaction,
  fetchBtcAddressUnspent,
  NetworkType,
} from '@secretkeylabs/xverse-core';
import { Blockchain, Utxo } from 'dlc-lib';
import axios from 'axios';
import { BtcTransactionData } from '@secretkeylabs/xverse-core';

export class XverseBitcoinBlockchain implements Blockchain {
  constructor() {}

  async getTransaction(txid: string): Promise<string> {
    // Not yet available in the xverse-core, might change it later when the update is released
    async function fetchBtcTransactionData(tx_hash: string, network: NetworkType): Promise<string> {
      const btcApiBaseUrl = 'https://api.blockcypher.com/v1/btc/main/txs/';
      const btcApiBaseUrlTestnet = 'https://api.blockcypher.com/v1/btc/test3/txs/';
      let apiUrl = `${btcApiBaseUrl}${tx_hash}`;
      if (network === 'Testnet') {
        apiUrl = `${btcApiBaseUrlTestnet}${tx_hash}`;
      }
      return axios
        .get<BtcTransactionData>(apiUrl, { headers: { 'Access-Control-Allow-Origin': '*' } })
        .then((response) => {
          const rawTx: string = response.data.hex;
          return rawTx;
        });
    }
    const network = 'Testnet';
    const rawTx = await fetchBtcTransactionData(txid, network);

    return rawTx;
  }

  async sendRawTransaction(txHex: string): Promise<void> {
    const network = 'Testnet';
    await broadcastRawBtcTransaction(txHex, network);
  }
  async getUtxosForAddress(address: string): Promise<Utxo[]> {
    const network = 'Testnet';
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

  isOutputSpent(txid: string, vout: number): Promise<boolean> {
    throw new Error('Method not implemented.');
  }
}
