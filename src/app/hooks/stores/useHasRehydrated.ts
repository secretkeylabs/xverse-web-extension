import type { StoreState } from '@stores/index';
import { useSelector } from 'react-redux';
import type { PersistPartial } from 'redux-persist/es/persistReducer';

// eslint-disable-next-line no-underscore-dangle
const selectHasRehydrated = (state: StoreState & PersistPartial) => state._persist.rehydrated;

export default function useHasStateRehydrated() {
  return useSelector(selectHasRehydrated);
}
