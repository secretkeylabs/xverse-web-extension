import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';
import { AnalyticsEvents, type AnalyticsEventProperties } from '@secretkeylabs/xverse-core';
import type { Callback, RequestOptions } from 'mixpanel-browser';
import { getMixpanelInstance, mixpanelInstances } from '../mixpanelSetup';

declare const VERSION: string;

// Overload definitions
export function trackMixPanel<E extends keyof AnalyticsEventProperties>(
  event: E,
  properties: AnalyticsEventProperties[E],
  options?: RequestOptions | Callback,
  callback?: Callback,
  instanceKey?: keyof typeof mixpanelInstances,
): void;
export function trackMixPanel(
  event: Exclude<AnalyticsEvents, keyof AnalyticsEventProperties>,
  properties?: any,
  options?: RequestOptions | Callback,
  callback?: Callback,
  instanceKey?: keyof typeof mixpanelInstances,
): void;

// Implementation
export function trackMixPanel(
  event: AnalyticsEvents,
  properties?: any,
  options?: RequestOptions | Callback,
  callback?: Callback,
  instanceKey: keyof typeof mixpanelInstances = 'web-extension',
) {
  getMixpanelInstance(instanceKey).track(
    event,
    {
      client_version: VERSION,
      ...properties,
    },
    options,
    callback,
  );
}

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
      getMixpanelInstance(instanceKey).identify(bytesToHex(sha256(masterPubKey)));
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
