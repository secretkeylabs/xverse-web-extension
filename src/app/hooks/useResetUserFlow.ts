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
  '/add-stx-address-ledger': { resetTo: '/add-stx-address-ledger?mismatch=true' },
  '/coinDashboard': { resetTo: '/' },
  '/confirm-brc20-tx': { resetTo: '/' },
  '/confirm-nft-tx': { resetTo: '/nft-dashboard?tab=nfts' },
  '/nft-collection': { resetTo: '/nft-dashboard?tab=nfts' },
  '/nft-detail': { resetTo: '/nft-dashboard?tab=nfts' },
  '/ordinal-detail': { resetTo: '/nft-dashboard?tab=inscriptions' },
  '/ordinals-collection': { resetTo: '/nft-dashboard?tab=inscriptions' },
  '/rare-sats-bundle': { resetTo: '/nft-dashboard?tab=rareSats' },
  '/rare-sats-detail': { resetTo: '/nft-dashboard?tab=rareSats' },
  '/send-brc20-one-step': { resetTo: '/' },
  '/send-btc': { resetTo: '/send-btc' },
  '/send-nft': { resetTo: '/nft-dashboard?tab=nfts' },
  '/send-strk': { resetTo: '/' },
  '/verify-ledger': { resetTo: '/verify-ledger?mismatch=true' },
  [RoutePaths.SendOrdinal]: { resetTo: '/nft-dashboard?tab=inscriptions' },
  [RoutePaths.SendRune]: { resetTo: '/' },
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
