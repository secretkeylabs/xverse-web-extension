import { DlcAPI }  from './DlcApi'
import { DlcManager } from 'dlc-lib'
import { AnyContract } from 'dlc-lib'
import { ContractRepository } from 'dlc-lib'
import { offerMessageFromJson } from 'dlc-lib'

export class DlcService implements DlcAPI {
  constructor(
    readonly dlcManager: DlcManager,
    readonly contractRepository: ContractRepository
  ) {}
  getAllContracts(): Promise<AnyContract[]> {
    return this.contractRepository.getContracts()
  }
  processContractOffer(offer: string): Promise<AnyContract> {
    const offerMessage = offerMessageFromJson(offer)
    return this.dlcManager.onOfferMessage(offerMessage)
  }
  processContractSign(sign: string): Promise<AnyContract> {
    return this.dlcManager.onSignMessage(JSON.parse(sign))
  }
  getContract(contractId: string): Promise<AnyContract> {
    return this.contractRepository.getContract(contractId)
  }
  acceptContract(contractId: string): Promise<AnyContract> {
    return this.dlcManager.acceptOffer(contractId)
  }
  rejectContract(contractId: string): Promise<AnyContract> {
    return this.dlcManager.onRejectContract(contractId)
  }
}
