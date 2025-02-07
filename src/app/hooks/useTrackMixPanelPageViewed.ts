import { isKeystoneAccount, isLedgerAccount } from '@utils/helper';
import { getMixpanelInstance } from 'app/mixpanelSetup';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useSelectedAccount from './useSelectedAccount';

declare const VERSION: string;

const useTrackMixPanelPageViewed = (properties?: any, deps: any[] = []) => {
  const selectedAccount = useSelectedAccount();
  const location = useLocation();

  useEffect(() => {
    getMixpanelInstance('web-extension').track_pageview({
      path: location.pathname,
      wallet_type: isLedgerAccount(selectedAccount)
        ? 'ledger'
        : isKeystoneAccount(selectedAccount)
        ? 'keystone'
        : 'software',
      client_version: VERSION,
      ...properties,
    });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useTrackMixPanelPageViewed;
