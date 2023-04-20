import { getId, BroadcastContract, ContractState } from 'dlc-lib';
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
import { Transaction } from 'bitcoinjs-lib';
import { getBtcTxStatusUrl } from '@utils/helper';

const initialDlcState: DlcState = {
  contracts: [],
  processing: false,
  success: false,
  error: undefined,
  signingRequested: false,
  acceptMessageSubmitted: false,
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
      };
    case AcceptRequestKey:
      return { ...state, processing: true, acceptMessageSubmitted: true };
    case RejectRequestKey:
      return { ...state, processing: true };
    case SignRequestKey:
      return { ...state, processing: true, signingRequested: true };
    case ActionSuccessKey: {
      const updatedContract = action.contract;
      const newContracts = [...state.contracts];
      // NOTE: This is what fails. Contract ID is born in the dlcAPI.acceptContract call in the saga file. So our tempID is no longer found in the array so things break.
      const contractIndex = state.contracts.findIndex(
        (c) =>
          getId(c) === getId(updatedContract) ||
          c.temporaryContractId === updatedContract.temporaryContractId
      );
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract;
      else newContracts.push(updatedContract);
      const newState = {
        ...state,
        contracts: newContracts,
        processing: false,
        success: true,
        selectedContract: updatedContract,
        currentId: getId(updatedContract),
      };
      console.log('newState', newState);
      return newState;
    }
    case ActionErrorKey: {
      const { error } = action;
      let newContracts = state.contracts;
      const updatedContract = error.contract;
      if (updatedContract) {
        newContracts = [...state.contracts];
        const contractIndex = state.contracts.findIndex((c) => getId(c) === getId(updatedContract));
        if (contractIndex >= 0) newContracts[contractIndex] = updatedContract;
        else newContracts.push(updatedContract);
      }
      const newState = {
        ...state,
        contracts: newContracts,
        processing: false,
        actionSuccess: false,
        error: error.error,
      };
      return newState;
    }
    case UpdateKey: {
      const updatedContract = action.contract;
      const newContracts = [...state.contracts];
      const contractIndex = state.contracts.findIndex((c) => getId(c) === getId(updatedContract));
      if (contractIndex >= 0) newContracts[contractIndex] = updatedContract;
      else newContracts.push(updatedContract);
      return { ...state, contracts: newContracts };
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
