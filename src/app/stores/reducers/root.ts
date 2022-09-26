import { combineReducers } from 'redux';
import userPrefReducer from './userPreferencesReducer';
import walletReducer from './walletReducer';

const appReducer = combineReducers({
  userPrefState: userPrefReducer,
  walletState: walletReducer,
});

const rootReducer = (state: any, action: any) => appReducer(state, action);

export type StoreState = ReturnType<typeof rootReducer>;
export default rootReducer;
