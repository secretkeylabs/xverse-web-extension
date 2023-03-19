import { DlcManager } from 'dlc-lib';
import { AnyContract } from 'dlc-lib';
import { ContractRepository } from 'dlc-lib';
import { offerMessageFromJson } from 'dlc-lib';
import { DlcAPI } from 'dlc-lib/src/interfaces';
import { Network } from 'bitcoinjs-lib';
import { NetworkType } from '@secretkeylabs/xverse-core';

export class DlcService implements DlcAPI {
  constructor(readonly dlcManager: DlcManager, readonly contractRepository: ContractRepository) {}
  getAllContracts(): Promise<AnyContract[]> {
    return this.contractRepository.getContracts();
  }
  processContractOffer(offer: string): Promise<AnyContract> {
    const offerMessage = offerMessageFromJson(offer);
    return this.dlcManager.onOfferMessage(offerMessage);
  }
  processContractSign(sign: string, btcPrivateKey: string, btcNetwork: NetworkType): Promise<AnyContract> {
    return this.dlcManager.onSignMessage(JSON.parse(sign), btcPrivateKey, btcNetwork);
  }
  getContract(contractId: string): Promise<AnyContract> {
    return this.contractRepository.getContract(contractId);
  }
  acceptContract(contractId: string, btcAddress: string, btcPublicKey: string, btcPrivateKey: string, btcNetwork: NetworkType): Promise<AnyContract> {
    return this.dlcManager.acceptOffer(contractId, btcAddress, btcPublicKey, btcPrivateKey, btcNetwork);
  }
  rejectContract(contractId: string): Promise<AnyContract> {
    return this.dlcManager.onRejectContract(contractId);
  }
}
