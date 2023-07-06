import { setShouldResetUserFlow } from '@stores/wallet/actions/actionCreators';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const userFlowConfig: Record<string, { resetTo: string }> = {
  '/send-btc': { resetTo: '/send-btc' },
  '/confirm-btc-tx': { resetTo: '/send-btc' },
  '/send-brc20': { resetTo: '/send-brc20' },
  '/confirm-inscription-request': { resetTo: '/send-brc20' },
  '/send-ordinal': { resetTo: '/nft-dashboard' },
  '/confirm-ordinal-tx': { resetTo: '/nft-dashboard' },
  '/send-nft': { resetTo: '/nft-dashboard' },
  '/confirm-nft-tx': { resetTo: '/nft-dashboard' },
};

export const hasTabWhichRequiresReset = async (): Promise<boolean> => {
  const optionsTabs = await chrome.tabs.query({ url: chrome.runtime.getURL('options.html') });
  return !!optionsTabs?.some((tab) =>
    Object.keys(userFlowConfig).some((matchPattern) => tab.url?.match(matchPattern)),
  );
};

export const useResetUserFlow = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const resetUserFlow = (path: keyof typeof userFlowConfig) => {
    if (!userFlowConfig[path]) {
      return;
    }
    navigate(userFlowConfig[path]?.resetTo);
    dispatch(setShouldResetUserFlow(false));
  };
  return resetUserFlow;
};
