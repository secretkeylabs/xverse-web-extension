import { Coin } from '@secretkeylabs/xverse-core';
import { ClarityValue, StacksTransaction, PostCondition } from '@stacks/transactions';

export interface Args {
  name: string;
  type: string;
}

export interface Output {
  type: Output;
}
export interface ContractFunction {
  name: string;
  access: string;
  args: Args[];
  output: Output;
}

type ComponentState = {
  isLoading: boolean;
  functionArguments: ClarityValue[];
  unsignedFunctionCallTx: StacksTransaction | null;
  funcMetaData: ContractFunction | null;
  coinMetaData: Coin[] | null;
  postConditions: PostCondition[];
};

type ComponentAction =
  | {
    type: 'UPDATE_FUNC_ARGS_POST_COND';
    payload: { funcArgs: ClarityValue[]; postConds: PostCondition[] };
  }
  | {
    type: 'UPDATE_UNSIGNED_FUNCTION_CALL_TX';
    payload: StacksTransaction | null;
  }
  | {
    type: 'PREPARE_INITIAL_TX_META';
    payload: {
      unsignedFunctionCallTx: StacksTransaction;
      funcMetaData: ContractFunction;
      coinMetaData: Coin[] | null;
    };
  }
  | { type: 'RESET_STATE' };

export const initialState: ComponentState = {
  isLoading: false,
  functionArguments: [],
  unsignedFunctionCallTx: null,
  funcMetaData: null,
  coinMetaData: [],
  postConditions: [],
};

export const reducer = (state: ComponentState, action: ComponentAction) => {
  switch (action.type) {
    case 'UPDATE_FUNC_ARGS_POST_COND':
      return {
        ...state,
        functionArguments: action.payload.funcArgs,
        postConditions: action.payload.postConds,
      };
    case 'UPDATE_UNSIGNED_FUNCTION_CALL_TX':
      return {
        ...state,
        unsignedFunctionCallTx: action.payload,
      };
    case 'PREPARE_INITIAL_TX_META':
      return {
        ...state,
        unsignedFunctionCallTx: action.payload.unsignedFunctionCallTx,
        funcMetaData: action.payload.funcMetaData,
        coinMetaData: action.payload.coinMetaData,
      };
    case 'RESET_STATE':
      return initialState;
    default:
      return state;
  }
};
