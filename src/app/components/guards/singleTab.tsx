import { useEffect } from 'react';

type GuardType =
  | 'onboarding'
  | 'importLedger'
  | 'closeWallet'
  | 'verifyLedger'
  | 'hardwareWalletImport';

const getChannelAndPingNames = (guardName: GuardType) => {
  const channelName = `${guardName}Channel`;
  const pingName = `${guardName}Ping`;
  return { channelName, pingName };
};

// NOTE: This is for calling the guard from a non-component context
// The window that is sending it will also receive it if the channel it is broadcasting to is open
// This is predominantly made for the reset wallet guard to close all tabs
// Use with care.
export const PostGuardPing = (guardName: GuardType): void => {
  const { channelName, pingName } = getChannelAndPingNames(guardName);
  const broadcastChannel = new BroadcastChannel(channelName);
  broadcastChannel.postMessage(pingName);
  broadcastChannel.close();
};

/**
 * This hook is used to ensure that only one window with the guard name is open at a time.
 * It fires off an event only once on its first render and will close the window if it receives
 * the event.
 */
export const useSingleTabGuard = (guardName: GuardType, broadcastOnLoad = true): void => {
  const { channelName, pingName } = getChannelAndPingNames(guardName);

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(channelName);

    broadcastChannel.onmessage = (message) => {
      if (message.data !== pingName) {
        return;
      }

      broadcastChannel.close();
      window.close();
    };

    if (broadcastOnLoad) {
      broadcastChannel.postMessage(pingName);
    }

    return () => {
      broadcastChannel.close();
    };
  }, []);
};

/**
 * This guard is used to ensure that only one window with the guard name is open at a time.
 * It fires off an event only once on its first render and will close the window if it receives
 * the event.
 */
export function SingleTabGuard({
  guardName,
  children,
}: React.PropsWithChildren<{
  guardName: GuardType;
}>) {
  useSingleTabGuard(guardName);

  // fragment is required here
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{children}</>;
}
