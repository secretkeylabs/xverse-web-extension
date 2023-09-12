import mixpanel from 'mixpanel-browser';
import { sha256 } from 'js-sha256';
import { MIX_PANEL_TOKEN } from './constants';

export const isMixPanelInited = () => !!MIX_PANEL_TOKEN && !!mixpanel.config;

export const trackMixPanel = (event: string, properties?: any, options?: any, callback?: any) => {
  if (!isMixPanelInited()) {
    return;
  }

  mixpanel.track(event, properties, options, callback);
};

export const optOutMixPanel = () => {
  if (!isMixPanelInited()) {
    return;
  }

  trackMixPanel('Opt Out', undefined, { send_immediately: true }, () => {
    mixpanel.opt_out_tracking();
  });
};

export const optInMixPanel = (masterPubKey?: string) => {
  if (!isMixPanelInited()) {
    return;
  }

  mixpanel.opt_in_tracking();

  if (masterPubKey) {
    mixpanel.identify(sha256(masterPubKey));
  }
};

export const hasOptedInMixPanelTracking = async () => {
  if (!isMixPanelInited()) {
    return false;
  }

  const hasOptedIn = await mixpanel.has_opted_in_tracking();
  return hasOptedIn;
};

export const resetMixPanel = () => {
  if (!isMixPanelInited()) {
    return;
  }

  mixpanel.reset();
};
