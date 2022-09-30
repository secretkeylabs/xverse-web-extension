import {
  FetchBackupRemindKey,
  UpdateBackupRemindKey,
  UserPrefActions,
} from '../actions/userPreferences/types';

type UserPrefState = {
  nextBackupRemind?: Date;
};

const userPrefReducer = (
  // eslint-disable-next-line @typescript-eslint/default-param-last
  state: UserPrefState = {},
  action: UserPrefActions,
) => {
  switch (action.type) {
    case UpdateBackupRemindKey:
      return {
        ...state,
        nextBackupRemind: action.nextBackupRemind,
      };
    case FetchBackupRemindKey:
      return {
        ...state,
      };
    default:
      return state;
  }
};
export default userPrefReducer;
