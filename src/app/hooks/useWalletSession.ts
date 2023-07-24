import useWalletSelector from '@hooks/useWalletSelector';
import { setWalletLockPeriodAction } from '@stores/wallet/actions/actionCreators';
import { SeedVaultStorageKeys } from '@secretkeylabs/xverse-core/seedVault';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import { addMinutes } from 'date-fns';
import { useDispatch } from 'react-redux';
import {getSessionItem, removeSessionItem, setSessionItem} from '@utils/sessionStorageUtils';

const SESSION_START_TIME_KEY = 'sessionStartTime';

const useWalletSession = () => {
  const { walletLockPeriod } = useWalletSelector();
  const dispatch = useDispatch();

  const setSessionStartTime = () => {
    const sessionStartTime = new Date().getTime();
    setSessionItem(SESSION_START_TIME_KEY, sessionStartTime);
  };

  const clearSessionTime = async () => {
    await removeSessionItem(SESSION_START_TIME_KEY);
  };

  const shouldLock = async () => {
    const pHash = await getSessionItem(SeedVaultStorageKeys.PASSWORD_HASH);
    if (!pHash) return false;
    const startTime = await getSessionItem(SESSION_START_TIME_KEY);
    const currentTime = new Date().getTime();
    return currentTime >= addMinutes(startTime, walletLockPeriod).getTime();
  };

  const setWalletLockPeriod = async (lockPeriod: WalletSessionPeriods) => {
    await clearSessionTime();
    dispatch(setWalletLockPeriodAction(lockPeriod));
    setSessionStartTime();
  };

  return {
    setSessionStartTime,
    setWalletLockPeriod,
    shouldLock,
    clearSessionTime,
  };
};

export default useWalletSession;
