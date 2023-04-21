import { getId, BroadcastContract, ContractState, AnyContract } from 'dlc-lib';
import {
  DlcActions,
  DlcState,
  ContractRequestKey,
  ContractSuccessKey,
  ContractErrorKey,
  OfferRequestKey,
  AcceptRequestKey,
  SignRequestKey,
  RejectRequestKey,
  ActionSuccessKey,
  ActionErrorKey,
  UpdateKey,
  SelectKey,
} from './actions/types';

const initialDlcState: DlcState = {
  contracts: [],
  processing: false,
  success: false,
  error: undefined,
  signingRequested: false,
  acceptMessageSubmitted: false,
  counterpartyWalletUrl: undefined,
};

const dlcReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: DlcState = initialDlcState,
  action: DlcActions
): DlcState => {
  switch (action.type) {
    case ContractRequestKey:
      return { ...state, processing: true };
    case ContractSuccessKey:
      return { ...state, processing: false, contracts: action.contracts };
    case ContractErrorKey:
      return {
        ...state,
        processing: false,
        error: action.error,
      };
    case OfferRequestKey:
      return {
        ...state,
        processing: true,
        acceptMessageSubmitted: false,
        signingRequested: false,
        error: undefined,
        success: false,
        counterpartyWalletUrl: action.counterpartyWalletUrl,
      };
    case AcceptRequestKey:
      return { ...state, processing: true, acceptMessageSubmitted: true };
    case RejectRequestKey:
      return { ...state, processing: true };
    case SignRequestKey:
      return { ...state, processing: true, signingRequested: true };
    case ActionSuccessKey: {
      const { contracts } = state;
      let updatedContracts: AnyContract[] = [];
      const updatedContract = action.contract;

      const existingContractIndex = contracts.findIndex(
        (c) =>
          getId(c) === getId(updatedContract) ||
          c.temporaryContractId === updatedContract.temporaryContractId
      );

      updatedContracts =
        existingContractIndex >= 0
          ? contracts.map((c, index) => (index === existingContractIndex ? updatedContract : c))
          : [...contracts, updatedContract];

      const updatedContractID = getId(updatedContract);

      return {
        ...state,
        contracts: updatedContracts,
        processing: false,
        success: true,
        selectedContract: updatedContract,
        currentId: updatedContractID,
      };
    }
    case ActionErrorKey: {
      const { error } = action;
      const { contracts } = state;
      let updatedContracts: AnyContract[] = [];
      const updatedContract = error.contract;

      if (updatedContract) {
        const existingContractIndex = contracts.findIndex(
          (c) => getId(c) === getId(updatedContract)
        );
        console.log(existingContractIndex);

        updatedContracts =
          existingContractIndex >= 0
            ? contracts.map((c, index) => (index === existingContractIndex ? updatedContract : c))
            : [...contracts, updatedContract];
      }

      return {
        ...state,
        contracts: updatedContracts,
        processing: false,
        success: false,
        error: error.error,
      };
    }
    case UpdateKey: {
      const { contracts } = state;
      let updatedContracts: AnyContract[] = [];
      const updatedContract = action.contract;

      const existingContractIndex = contracts.findIndex(
        (c) =>
          getId(c) === getId(updatedContract) ||
          c.temporaryContractId === updatedContract.temporaryContractId
      );

      updatedContracts =
        existingContractIndex >= 0
          ? contracts.map((c, index) => (index === existingContractIndex ? updatedContract : c))
          : [...contracts, updatedContract];

      return { ...state, contracts: updatedContracts };
    }
    case SelectKey: {
      const { contract } = action;
      return {
        ...state,
        selectedContract: contract,
      };
    }
    default:
      return state;
  }
};

export default dlcReducer;
