import RoutePaths from 'app/routes/paths';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const resetUserFlowChannel = 'resetUserFlow';

/*
 * Extend UserFlowConfigKey here
 *
 * resetTo: should be a valid route
 */
const userFlowConfig: Record<string, { resetTo: string }> = {
  '/send-btc': { resetTo: '/send-btc' },
  '/send-brc20-one-step': { resetTo: '/' },
  '/confirm-brc20-tx': { resetTo: '/' },
  '/ordinals-collection': { resetTo: '/nft-dashboard?tab=inscriptions' },
  '/ordinal-detail': { resetTo: '/nft-dashboard?tab=inscriptions' },
  [RoutePaths.SendOrdinal]: { resetTo: '/nft-dashboard?tab=inscriptions' },
  '/nft-collection': { resetTo: '/nft-dashboard?tab=nfts' },
  '/nft-detail': { resetTo: '/nft-dashboard?tab=nfts' },
  '/send-nft': { resetTo: '/nft-dashboard?tab=nfts' },
  '/confirm-nft-tx': { resetTo: '/nft-dashboard?tab=nfts' },
  '/rare-sats-detail': { resetTo: '/nft-dashboard?tab=rareSats' },
  '/rare-sats-bundle': { resetTo: '/nft-dashboard?tab=rareSats' },
  '/verify-ledger': { resetTo: '/verify-ledger?mismatch=true' },
  '/add-stx-address-ledger': { resetTo: '/add-stx-address-ledger?mismatch=true' },
  [RoutePaths.SendRune]: { resetTo: '/' },
  '/coinDashboard': { resetTo: '/' },
};
type UserFlowConfigKey = keyof typeof userFlowConfig;

/*
 * Usage:
 *
 * To subscribe:
 *   useResetUserFlow('/send-brc20-one-step');
 *
 * To broadcast:
 *   broadcastResetUserFlow();
 */
export const useResetUserFlow = (path: UserFlowConfigKey) => {
  const navigate = useNavigate();

  useEffect(() => {
    const broadcastChannel = new BroadcastChannel(resetUserFlowChannel);
    broadcastChannel.onmessage = (message) => {
      if (message.data !== 'reset') {
        return;
      }

      // TODO: infer UserFlowConfigKey from location?
      if (!userFlowConfig[path]) {
        return;
      }
      navigate(userFlowConfig[path]?.resetTo);
    };

    return () => {
      broadcastChannel.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
};

export const broadcastResetUserFlow = () => {
  const broadcastChannel = new BroadcastChannel(resetUserFlowChannel);
  broadcastChannel.postMessage('reset');
  broadcastChannel.close();
};
