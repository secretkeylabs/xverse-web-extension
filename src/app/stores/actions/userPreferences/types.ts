export const UpdateBackupRemindKey = 'UpdateBackupRemind';
export const FetchBackupRemindKey = 'FetchBackupRemind';

export interface UpdateBackupRemind {
  type: typeof UpdateBackupRemindKey;
  nextBackupRemind?: Date;
}

export interface FetchBackupRemind {
  type: typeof FetchBackupRemindKey;
}

export type AllUserPrefAction =
  | UpdateBackupRemind
  | FetchBackupRemind;

export type UserPrefActions = AllUserPrefAction;
