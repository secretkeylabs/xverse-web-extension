import { RuneItem } from '@utils/runes';

interface ListRunesState {
  listItemsMap: Record<string, RuneItem>;
  section: 'SELECT_RUNES' | 'SET_PRICES';
  selectAllToggle: boolean;
  runePriceOption: 1 | 1.05 | 1.1 | 1.2 | 'custom';
  customRunePrice: number | null;
  individualCustomItem: string | null;
  toggleCustomPriceModal: boolean;
}

type Action =
  | { type: 'INITIATE_LIST_ITEMS'; payload: Record<string, RuneItem> }
  | { type: 'TOGGLE_ALL_LIST_ITEMS'; payload: boolean }
  | { type: 'SET_ALL_LIST_ITEMS_PRICES'; payload: number }
  | { type: 'UPDATE_ONE_LIST_ITEM'; key: string; payload: RuneItem }
  | { type: 'SET_SECTION'; payload: 'SELECT_RUNES' | 'SET_PRICES' }
  | { type: 'SET_SELECT_ALL_TOGGLE'; payload: boolean }
  | { type: 'SET_RUNE_PRICE_OPTION'; payload: 1 | 1.05 | 1.1 | 1.2 | 'custom' }
  | { type: 'SET_CUSTOM_RUNE_PRICE'; payload: number | null }
  | { type: 'SET_INDIVIDUAL_CUSTOM_ITEM'; payload: string | null }
  | { type: 'SET_TOGGLE_CUSTOM_PRICE_MODAL'; payload: boolean }
  | { type: 'RESTORE_STATE_FROM_PSBT'; payload: ListRunesState };

export const initialListRunesState: ListRunesState = {
  listItemsMap: {},
  section: 'SELECT_RUNES',
  selectAllToggle: false,
  runePriceOption: 1,
  customRunePrice: null,
  individualCustomItem: null,
  toggleCustomPriceModal: false,
};

export function ListRunesReducer(state: ListRunesState, action: Action): ListRunesState {
  switch (action.type) {
    case 'INITIATE_LIST_ITEMS':
      return { ...state, listItemsMap: action.payload };
    case 'TOGGLE_ALL_LIST_ITEMS':
      return {
        ...state,
        listItemsMap: Object.fromEntries(
          Object.entries(state.listItemsMap).map(([fullTxId, listItem]) => [
            fullTxId,
            { ...listItem, selected: action.payload },
          ]),
        ),
      };
    case 'SET_ALL_LIST_ITEMS_PRICES':
      return {
        ...state,
        listItemsMap: Object.fromEntries(
          Object.entries(state.listItemsMap).map(([fullTxId, listItem]) => [
            fullTxId,
            { ...listItem, priceSats: action.payload, useIndividualCustomPrice: false },
          ]),
        ),
      };
    case 'UPDATE_ONE_LIST_ITEM':
      return {
        ...state,
        listItemsMap: {
          ...state.listItemsMap,
          [action.key]: action.payload,
        },
      };
    case 'SET_SECTION':
      return { ...state, section: action.payload };
    case 'SET_SELECT_ALL_TOGGLE':
      return { ...state, selectAllToggle: action.payload };
    case 'SET_RUNE_PRICE_OPTION':
      return {
        ...state,
        runePriceOption: action.payload,
        listItemsMap: Object.fromEntries(
          Object.entries(state.listItemsMap).map(([fullTxId, listItem]) => [
            fullTxId,
            { ...listItem, useIndividualCustomPrice: false },
          ]),
        ),
      };
    case 'SET_CUSTOM_RUNE_PRICE':
      return { ...state, customRunePrice: action.payload };
    case 'SET_INDIVIDUAL_CUSTOM_ITEM':
      return { ...state, individualCustomItem: action.payload };
    case 'SET_TOGGLE_CUSTOM_PRICE_MODAL':
      return { ...state, toggleCustomPriceModal: action.payload };
    case 'RESTORE_STATE_FROM_PSBT':
      return { ...action.payload };
    default:
      throw new Error('Invalid action type');
  }
}
