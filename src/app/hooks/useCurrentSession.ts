import { addMinutes } from 'date-fns';
import useWalletSelector from './useWalletSelector';

const SESSION_START_TIME_KEY = 'sessionStartTime';

const useCurrentSession = () => {
  const { walletLockPeriod } = useWalletSelector();

  const setSessionStartTime = () => {
    const sessionStartTime = new Date().getTime();
    chrome.storage.session.set({ sessionStartTime });
  };

  const clearSessionTime = () => {
    chrome.storage.session.remove(SESSION_START_TIME_KEY);
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

  return {
    setSessionStartTime,
    getSessionStartTime,
    shouldLock,
    clearSessionTime,
  };
};

export default useCurrentSession;
