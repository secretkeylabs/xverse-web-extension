import { useDispatch } from 'react-redux';
import { addMinutes } from 'date-fns';
import useWalletSelector from '@hooks/useWalletSelector';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import { setWalletLockPeriodAction } from '@stores/wallet/actions/actionCreators';

const SESSION_START_TIME_KEY = 'sessionStartTime';

const useWalletSession = () => {
  const { walletLockPeriod } = useWalletSelector();
  const dispatch = useDispatch();

  const setSessionStartTime = () => {
    const sessionStartTime = new Date().getTime();
    chrome.storage.session.set({ sessionStartTime });
  };

  const clearSessionTime = async () => {
    await chrome.storage.session.remove(SESSION_START_TIME_KEY);
  };

  const getSessionStartTime = async () => {
    const { sessionStartTime } = await chrome.storage.session.get(SESSION_START_TIME_KEY);
    return sessionStartTime;
  };

  const shouldLock = async () => {
    const startTime = await getSessionStartTime();
    const currentTime = new Date().getTime();
    return currentTime >= addMinutes(startTime, walletLockPeriod).getTime();
  };

  const setWalletLockPeriod = async (lockPeriod: WalletSessionPeriods) => {
    await clearSessionTime();
    dispatch(setWalletLockPeriodAction(lockPeriod));
    setSessionStartTime();
  };

  const clearSessionKey = () => {
    chrome.storage.session.remove('pHash');
  };

  return {
    setSessionStartTime,
    setWalletLockPeriod,
    getSessionStartTime,
    shouldLock,
    clearSessionTime,
    clearSessionKey,
  };
};

export default useWalletSession;
