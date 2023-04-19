import { Blockchain, Utxo } from 'dlc-lib';
import useBtcClient from '@hooks/useBtcClient';

class DlcBitcoinBlockchain implements Blockchain {
  // eslint-disable-next-line class-methods-use-this
  async getTransaction(txid: string, network: NetworkType): Promise<string> {
    const rawTx = await fetchBtcTransactionRawData(txid, network);
    return rawTx;
  }

  // eslint-disable-next-line class-methods-use-this
  async sendRawTransaction(txHex: string, network: NetworkType): Promise<void> {
    const tx = await broadcastRawBtcTransaction(txHex, network);
    console.log('Broadcasted TX: ', tx);
  }

  // eslint-disable-next-line class-methods-use-this
  async getUtxosForAddress(address: string, network: NetworkType): Promise<Utxo[]> {
    const utxoDataResponses = await fetchBtcAddressUnspent(address, network);
    return utxoDataResponses.map((utxoDataResponse) => ({
      txid: utxoDataResponse.tx_hash,
      vout: utxoDataResponse.tx_output_n,
      amount: utxoDataResponse.value,
      reserved: false,
      address,
      redeemScript: '',
      maxWitnessLength: 107,
    }));
  }
}

export default DlcBitcoinBlockchain;
