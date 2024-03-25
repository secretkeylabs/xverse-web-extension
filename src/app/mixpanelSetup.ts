import { MIX_PANEL_EXPLORE_APP_TOKEN, MIX_PANEL_TOKEN } from '@utils/constants';
import mixpanel from 'mixpanel-browser';

const mixpanelInstances = {
  'web-extension': {
    token: MIX_PANEL_TOKEN,
    instance: undefined,
  },
  'explore-app': {
    token: MIX_PANEL_EXPLORE_APP_TOKEN,
    instance: undefined,
  },
};

// lazy load the mixpanel instances
const getMixpanelInstance = (instanceKey: keyof typeof mixpanelInstances): typeof mixpanel.init => {
  if (!mixpanelInstances[instanceKey]) {
    console.error(`Mixpanel instance with key ${instanceKey} not found`);
    return;
  }

  if (!mixpanelInstances[instanceKey].token) {
    console.error(`Mixpanel instance ${instanceKey} token not found`);
    return;
  }

  if (!mixpanelInstances[instanceKey].instance) {
    const instance = mixpanel.init(
      mixpanelInstances[instanceKey].token,
      {
        debug: process.env.NODE_ENV === 'development',
        ip: false,
        persistence: 'localStorage',
      },
      instanceKey,
    );
    mixpanelInstances[instanceKey].instance = instance;
    return instance;
  }

  return mixpanelInstances[instanceKey].instance;
};

export { getMixpanelInstance, mixpanelInstances };
