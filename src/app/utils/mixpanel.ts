import { AnalyticsEvents } from '@secretkeylabs/xverse-core';
import { getMixpanelInstance, mixpanelInstances } from 'app/mixpanelSetup';
import { sha256 } from 'js-sha256';

export const trackMixPanel = (
  event: string,
  properties?: any,
  options?: any,
  callback?: any,
  instanceKey: keyof typeof mixpanelInstances = 'web-extension',
) => {
  getMixpanelInstance(instanceKey).track(event, properties, options, callback);
};

export const optOutMixPanel = () => {
  const mixpanelInstance = getMixpanelInstance('web-extension');
  const mixpanelInstanceExploreApp = getMixpanelInstance('explore-app');
  if (!mixpanelInstance || !mixpanelInstanceExploreApp) {
    return;
  }

  trackMixPanel(AnalyticsEvents.OptOut, undefined, { send_immediately: true }, () => {
    mixpanelInstance.opt_out_tracking();
    mixpanelInstanceExploreApp.opt_out_tracking();
  });
};

export const optInMixPanel = (masterPubKey?: string) => {
  const mixpanelInstance = getMixpanelInstance('web-extension');
  const mixpanelInstanceExploreApp = getMixpanelInstance('explore-app');
  if (!mixpanelInstance || !mixpanelInstanceExploreApp) {
    return;
  }

  mixpanelInstance.opt_in_tracking();
  mixpanelInstanceExploreApp.opt_in_tracking();

  if (masterPubKey) {
    mixpanelInstance.identify(sha256(masterPubKey));
    mixpanelInstanceExploreApp.identify(sha256(masterPubKey));
  }
};

export const hasOptedInMixPanelTracking = async () => {
  const mixpanelInstance = getMixpanelInstance('web-extension');
  const mixpanelInstanceExploreApp = getMixpanelInstance('explore-app');
  if (!mixpanelInstance || !mixpanelInstanceExploreApp) {
    return;
  }

  const hasOptedIn =
    (await mixpanelInstance.has_opted_in_tracking()) &&
    (await mixpanelInstanceExploreApp.has_opted_in_tracking());
  return hasOptedIn;
};

export const resetMixPanel = () => {
  const mixpanelInstance = getMixpanelInstance('web-extension');
  const mixpanelInstanceExploreApp = getMixpanelInstance('explore-app');
  if (!mixpanelInstance || !mixpanelInstanceExploreApp) {
    return;
  }

  mixpanelInstance.reset();
  mixpanelInstanceExploreApp.reset();
};
