import { PayloadType } from '@stacks/transactions';
import { ContractCallDetails } from './components/contractCallDetails';
import { NotYetSupported } from './components/notYetSupported';
import { SmartContractDetails } from './components/smartContractDetails';
import { TokenTransferDetails } from './components/tokenTransferDetails';
import { VersionedSmartContractDetails } from './components/versionedSmartContractDetails';
import type { TransactionInfoProps } from './types';

export const transactionTypeToDetailsComponentMap: Record<
  PayloadType,
  React.ComponentType<TransactionInfoProps>
> = {
  [PayloadType.TokenTransfer]: TokenTransferDetails,
  [PayloadType.SmartContract]: SmartContractDetails,
  [PayloadType.VersionedSmartContract]: VersionedSmartContractDetails,
  [PayloadType.ContractCall]: ContractCallDetails,

  // Not yet supported
  [PayloadType.PoisonMicroblock]: NotYetSupported,
  [PayloadType.Coinbase]: NotYetSupported,
  [PayloadType.CoinbaseToAltRecipient]: NotYetSupported,
  [PayloadType.TenureChange]: NotYetSupported,
  [PayloadType.NakamotoCoinbase]: NotYetSupported,
};
