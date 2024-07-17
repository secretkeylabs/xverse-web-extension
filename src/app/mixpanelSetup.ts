import { MIX_PANEL_EXPLORE_APP_TOKEN, MIX_PANEL_TOKEN } from '@utils/constants';
import mixpanel, { type Mixpanel } from 'mixpanel-browser';

export const mixpanelInstances: Record<string, { token?: string }> = {
  'web-extension': {
    token: MIX_PANEL_TOKEN,
  },
  'explore-app': {
    token: MIX_PANEL_EXPLORE_APP_TOKEN,
  },
};

// lazy load the mixpanel instances
export const getMixpanelInstance = (instanceKey: keyof typeof mixpanelInstances): Mixpanel => {
  if (mixpanel[instanceKey]) {
    return mixpanel[instanceKey];
  }

  const token = mixpanelInstances[instanceKey]?.token;
  if (!token) {
    throw new Error(`Mixpanel instance ${instanceKey} token not found`);
  }

  mixpanel.init(
    token,
    {
      debug: process.env.NODE_ENV === 'development',
      ip: false,
      persistence: 'localStorage',
    },
    instanceKey,
  );
  return mixpanel[instanceKey];
};
