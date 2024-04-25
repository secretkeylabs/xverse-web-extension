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
  Object.keys(mixpanelInstances).forEach((instanceKey) => {
    trackMixPanel(
      AnalyticsEvents.OptOut,
      undefined,
      { send_immediately: true },
      () => {
        getMixpanelInstance(instanceKey).opt_out_tracking();
      },
      instanceKey,
    );
  });
};

export const optInMixPanel = (masterPubKey?: string) => {
  Object.keys(mixpanelInstances).forEach((instanceKey) => {
    getMixpanelInstance(instanceKey).opt_in_tracking();

    if (masterPubKey) {
      getMixpanelInstance(instanceKey).identify(sha256(masterPubKey));
    }
  });
};

export const hasOptedInMixPanelTracking = () =>
  Object.keys(mixpanelInstances).every((instanceKey) =>
    getMixpanelInstance(instanceKey).has_opted_in_tracking(),
  );

export const resetMixPanel = () => {
  Object.keys(mixpanelInstances).forEach((instanceKey) => {
    getMixpanelInstance(instanceKey).reset();
  });
};
