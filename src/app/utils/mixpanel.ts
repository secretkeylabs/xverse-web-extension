import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { mixpanelInstance, mixpanelInstanceExploreApp } from 'app/mixpanelSetup';
import { sha256 } from 'js-sha256';
import { MIX_PANEL_TOKEN, MIX_PANEL_TOKEN_EXPLORE_APP } from './constants';

export const isMixPanelInited = () => !!MIX_PANEL_TOKEN && !!mixpanelInstance.config;
export const isMixPanelExploreAppInited = () =>
  !!MIX_PANEL_TOKEN_EXPLORE_APP && !!mixpanelInstanceExploreApp.config;

export const trackMixPanel = (event: string, properties?: any, options?: any, callback?: any) => {
  if (!isMixPanelInited()) {
    return;
  }

  mixpanelInstance.track(event, properties, options, callback);
};

export const trackMixPanelExploreApp = (
  event: string,
  properties?: any,
  options?: any,
  callback?: any,
) => {
  if (!isMixPanelExploreAppInited()) {
    return;
  }

  mixpanelInstanceExploreApp.track(event, properties, options, callback);
};

export const optOutMixPanel = () => {
  if (!isMixPanelInited()) {
    return;
  }

  trackMixPanel(AnalyticsEvents.OptOut, undefined, { send_immediately: true }, () => {
    mixpanelInstance.opt_out_tracking();
    mixpanelInstanceExploreApp.opt_out_tracking();
  });
};

export const optInMixPanel = (masterPubKey?: string) => {
  if (!isMixPanelInited() || !isMixPanelExploreAppInited()) {
    return;
  }

  mixpanelInstance.opt_in_tracking();
  mixpanelInstanceExploreApp.opt_in_tracking();

  if (masterPubKey) {
    mixpanelInstance.identify(sha256(masterPubKey));
  }
};

export const hasOptedInMixPanelTracking = async () => {
  if (!isMixPanelInited() || !isMixPanelExploreAppInited()) {
    return false;
  }

  const hasOptedIn =
    (await mixpanelInstance.has_opted_in_tracking()) &&
    (await mixpanelInstanceExploreApp.has_opted_in_tracking());
  return hasOptedIn;
};

export const resetMixPanel = () => {
  if (!isMixPanelInited() || !isMixPanelExploreAppInited()) {
    return;
  }

  mixpanelInstance.reset();
  mixpanelInstanceExploreApp.reset();
};
