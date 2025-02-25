import useWalletSelector from '@hooks/useWalletSelector';
import { setWalletLockPeriodAction } from '@stores/wallet/actions/actionCreators';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import chromeStorage from '@utils/chromeStorage';
import { addMinutes } from 'date-fns';
import { useDispatch } from 'react-redux';

const SESSION_START_TIME_KEY = 'sessionStartTime';

const useWalletSession = () => {
  const { walletLockPeriod } = useWalletSelector();
  const dispatch = useDispatch();

  const setSessionStartTime = async () => {
    const sessionStartTime = new Date().getTime();
    await chromeStorage.session.setItem(SESSION_START_TIME_KEY, sessionStartTime);
  };

  const getSessionStartTime = async () =>
    chromeStorage.session.getItem<number>(SESSION_START_TIME_KEY);

  const clearSessionTime = async () => {
    await chromeStorage.session.removeItem(SESSION_START_TIME_KEY);
  };

  const shouldLock = async () => {
    const startTime = await getSessionStartTime();
    // we don't know when the session started, so we assume we need to lock
    if (!startTime) return true;

    const currentTime = new Date().getTime();
    return currentTime >= addMinutes(startTime, walletLockPeriod).getTime();
  };

  const setWalletLockPeriod = async (lockPeriod: WalletSessionPeriods) => {
    await clearSessionTime();
    dispatch(setWalletLockPeriodAction(lockPeriod));
    await setSessionStartTime();
  };

  const setSessionStartTimeAndMigrate = async () => {
    if (walletLockPeriod < WalletSessionPeriods.LOW) {
      return setWalletLockPeriod(WalletSessionPeriods.LOW);
    }

    await setSessionStartTime();
  };

  return {
    setSessionStartTime,
    getSessionStartTime,
    setWalletLockPeriod,
    shouldLock,
    clearSessionTime,
    setSessionStartTimeAndMigrate,
  };
};

export default useWalletSession;
