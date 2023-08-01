import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const resetUserFlowChannel = 'resetUserFlow';

/*
 * Extend UserFlowConfigKey here
 *
 * resetTo: should be a valid route
 *
 */
const userFlowConfig: Record<string, { resetTo: string }> = {
  '/send-btc': { resetTo: '/send-btc' },
  '/confirm-btc-tx': { resetTo: '/send-btc' },
  '/send-brc20': { resetTo: '/account-list' },
  '/confirm-inscription-request': { resetTo: '/account-list' },
  '/ordinal-detail': { resetTo: '/nft-dashboard' },
  '/send-ordinal': { resetTo: '/nft-dashboard' },
  '/confirm-ordinal-tx': { resetTo: '/nft-dashboard' },
  '/nft-detail': { resetTo: '/nft-dashboard' },
  '/send-nft': { resetTo: '/nft-dashboard' },
  '/confirm-nft-tx': { resetTo: '/nft-dashboard' },
};
type UserFlowConfigKey = keyof typeof userFlowConfig;

/*
 * Usage:
 *
 * To subscribe:
 *   const { subscribeToResetUserFlow } = useResetUserFlow();
 *   useEffect(() => subscribeToResetUserFlow('/nft-detail'), []);
 *
 * To broadcast (once on first render):
 *   const { broadcastResetUserFlow, closeChannel } = useResetUserFlow();
 *   useEffect(() => broadcastResetUserFlow(), []);
 *
 * Both subscribe and broadcast methods return the cleanup callback,
 * but you can also use closeChannel, which only returns a close callback:
 *   const { closeChannel } = useResetUserFlow();
 *   useEffect(() => closeChannel, []);
 *
 */
export const useResetUserFlow = () => {
  const navigate = useNavigate();

  const resetUserFlow = (path: UserFlowConfigKey) => {
    // TODO: infer UserFlowConfigKey from location?
    if (!userFlowConfig[path]) {
      return;
    }
    navigate(userFlowConfig[path]?.resetTo);
  };

  const broadcastChannel = useMemo(() => new BroadcastChannel(resetUserFlowChannel), []);
  const closeChannel = () => broadcastChannel.close();

  const broadcastResetUserFlow = () => {
    broadcastChannel.postMessage('reset');
    return closeChannel;
  };

  const subscribeToResetUserFlow = (path: UserFlowConfigKey) => {
    broadcastChannel.onmessage = (message) => {
      if (message.data !== 'reset') {
        return;
      }
      resetUserFlow(path);
    };
    return closeChannel;
  };
  return { subscribeToResetUserFlow, broadcastResetUserFlow, closeChannel };
};

export default useResetUserFlow;
