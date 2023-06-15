import useWalletSelector from '@hooks/useWalletSelector';
import { setWalletLockPeriodAction } from '@stores/wallet/actions/actionCreators';
import { WalletSessionPeriods } from '@stores/wallet/actions/types';
import { addMinutes } from 'date-fns';
import { useDispatch } from 'react-redux';

const SESSION_START_TIME_KEY = 'sessionStartTime';

const useWalletSession = () => {
  const { walletLockPeriod } = useWalletSelector();
  const dispatch = useDispatch();

  const setSessionStartTime = () => {
    const sessionStartTime = new Date().getTime();
    chrome.storage.session.set({ [SESSION_START_TIME_KEY]: sessionStartTime });
  };

  const clearSessionTime = async () => {
    await chrome.storage.session.remove(SESSION_START_TIME_KEY);
  };

  const getSessionStartTime = async () => {
    const { sessionStartTime } = await chrome.storage.session.get(SESSION_START_TIME_KEY);
    return sessionStartTime;
  };

  const shouldLock = async () => {
    const pHash = await chrome.storage.session.get('pHash');

    if (!pHash) return false;

    const startTime = await getSessionStartTime();
    const currentTime = new Date().getTime();
    return currentTime >= addMinutes(startTime, walletLockPeriod).getTime();
  };

  const setWalletLockPeriod = async (lockPeriod: WalletSessionPeriods) => {
    await clearSessionTime();
    dispatch(setWalletLockPeriodAction(lockPeriod));
    setSessionStartTime();
  };

  const clearSessionKey = async () => {
    await chrome.storage.session.remove('pHash');
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
