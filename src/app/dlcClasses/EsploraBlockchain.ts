import { Blockchain, Utxo } from 'dlc-lib';
import { UTXO } from '@secretkeylabs/xverse-core';
import { BtcTransactionBroadcastResponse } from '@secretkeylabs/xverse-core';
class EsploraBlockchain implements Blockchain {
  private readonly _getTransaction: (txid: string) => Promise<string>;
  private readonly _sendRawTransaction: (txHex: string) => Promise<BtcTransactionBroadcastResponse>;
  private readonly _getUtxosForAddress: (address: string) => Promise<UTXO[]>;

  constructor(
    _getTransaction: (txid: string) => Promise<string>,
    _sendRawTransaction: (txHex: string) => Promise<BtcTransactionBroadcastResponse>,
    _getUtxosForAddress: (address: string) => Promise<UTXO[]>
  ) {
    this._getTransaction = _getTransaction;
    this._sendRawTransaction = _sendRawTransaction;
    this._getUtxosForAddress = _getUtxosForAddress;
  }

  formatUTXO(utxo: UTXO, address: string): Utxo {
    return {
      txid: utxo.txid,
      vout: utxo.vout,
      amount: utxo.value,
      reserved: false,
      address: address,
      redeemScript: '',
      maxWitnessLength: 107,
    };
  }

  async getTransaction(txid: string): Promise<string> {
    return await this._getTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<void> {
    await this._sendRawTransaction(txHex);
  }

  async getUtxosForAddress(address: string): Promise<Utxo[]> {
    const UTXOs = await this._getUtxosForAddress(address);
    const formattedUTXOs = UTXOs.map((utxo) => this.formatUTXO(utxo, address));
    return formattedUTXOs;
  }
}

export default EsploraBlockchain;
