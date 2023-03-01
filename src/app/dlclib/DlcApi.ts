import { AnyContract } from 'dlc-lib';

export interface DlcAPI {
  getAllContracts(): Promise<AnyContract[]>;

  processContractOffer(offer: string): Promise<AnyContract>;

  processContractSign(sign: string): Promise<AnyContract>;

  getContract(contractId: string): Promise<AnyContract>;

  acceptContract(contractId: string): Promise<AnyContract>;

  rejectContract(contractId: string): Promise<AnyContract>;
}
