import { useEffect } from 'react';

const ONBOARDING_CHANNEL_NAME = 'onboarding';
const ONBOARDING_PING = 'pingOnboarding';

/**
 * This hook is used to ensure that only one onboarding window is open at a time.
 */
const useOnboardingSingleton = (): void => {
  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(ONBOARDING_CHANNEL_NAME);

    broadcastChannel.onmessage = (message) => {
      if (message.data !== ONBOARDING_PING) {
        return;
      }

      broadcastChannel.close();
      window.close();
    };

    broadcastChannel.postMessage(ONBOARDING_PING);

    return () => {
      broadcastChannel.close();
    };
  }, []);
};

export default useOnboardingSingleton;
