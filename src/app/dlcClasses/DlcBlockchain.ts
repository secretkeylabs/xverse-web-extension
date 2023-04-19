import { Blockchain, Utxo } from 'dlc-lib';
import useBtcClient from '@hooks/useBtcClient';

class DlcBitcoinBlockchain implements Blockchain {
  // eslint-disable-next-line class-methods-use-this
  async getTransaction(txid: string): Promise<string> {
    const btcClient = useBtcClient();
    const rawTx = await btcClient.getRawTransaction(txid);
    return rawTx;
  }

  // eslint-disable-next-line class-methods-use-this
  async sendRawTransaction(txHex: string): Promise<void> {
    const btcClient = useBtcClient();
    const rawTx = await btcClient.sendRawTransaction(txHex);
    console.log('Broadcasted TX: ', rawTx);
  }

  // eslint-disable-next-line class-methods-use-this
  async getUtxosForAddress(address: string): Promise<Utxo[]> {
    const btcClient = useBtcClient();
    const utxoDataResponses = await btcClient.getUnspentUtxos(address)
    return utxoDataResponses.map((utxoDataResponse) => ({
      txid: utxoDataResponse.txid,
      vout: utxoDataResponse.vout,
      amount: utxoDataResponse.value,
      reserved: false,
      address,
      redeemScript: '',
      maxWitnessLength: 107,
    }));
  }
}

export default DlcBitcoinBlockchain;
