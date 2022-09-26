import * as action from './types';

export const setBackupRemindAction = (nextBackupRemind?: Date): action.UpdateBackupRemind => ({
  type: action.UpdateBackupRemindKey,
  nextBackupRemind,
});

export const getBackupRemindAction = (): action.FetchBackupRemind => ({
  type: action.FetchBackupRemindKey,
});
