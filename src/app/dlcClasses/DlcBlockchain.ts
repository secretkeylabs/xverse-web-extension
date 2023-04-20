import { Blockchain, Utxo } from 'dlc-lib';
import { UTXO } from '@secretkeylabs/xverse-core';
import BitcoinEsploraApiProvider from '@secretkeylabs/xverse-core/api/esplora/esploraAPiProvider';
class EsploraBlockchain implements Blockchain {
  private readonly btcClient: BitcoinEsploraApiProvider;

  constructor(btcClient: BitcoinEsploraApiProvider) {
    this.btcClient = btcClient;
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
    return await this.btcClient.getRawTransaction(txid);
  }

  async sendRawTransaction(txHex: string): Promise<void> {
    await this.btcClient.sendRawTransaction(txHex);
  }

  async getUtxosForAddress(address: string): Promise<Utxo[]> {
    const utxos = await this.btcClient.getUnspentUtxos(address);
    const formattedUTXOs = utxos.map((utxo) => this.formatUTXO(utxo, address));
    console.log(formattedUTXOs, 'formattedUTXOs')
    return formattedUTXOs;
  }
}

export default EsploraBlockchain;
