import { isLedgerAccount } from '@utils/helper';
import { getMixpanelInstance } from 'app/mixpanelSetup';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useSelectedAccount from './useSelectedAccount';

const useTrackMixPanelPageViewed = (properties?: any, deps: any[] = []) => {
  const selectedAccount = useSelectedAccount();
  const location = useLocation();

  useEffect(() => {
    getMixpanelInstance('web-extension').track_pageview({
      path: location.pathname,
      wallet_type: isLedgerAccount(selectedAccount) ? 'ledger' : 'software',
      ...properties,
    });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useTrackMixPanelPageViewed;
