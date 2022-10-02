import { combineReducers } from 'redux';
import walletReducer from '../wallet/reducers/walletReducer';

const appReducer = combineReducers({
  walletState: walletReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

export type StoreState = ReturnType<typeof rootReducer>;
export default rootReducer;
