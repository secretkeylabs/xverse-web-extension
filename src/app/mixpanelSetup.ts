import { MIX_PANEL_TOKEN, MIX_PANEL_TOKEN_EXPLORE_APP } from '@utils/constants';
import mixpanel from 'mixpanel-browser';

// Initialize the web-extension Mixpanel instance
export const mixpanelInstance = mixpanel.init(
  MIX_PANEL_TOKEN,
  {
    debug: process.env.NODE_ENV === 'development',
    ip: false,
    persistence: 'localStorage',
  },
  'web-extension',
);

// Initialize the explore-app Mixpanel instance
export const mixpanelInstanceExploreApp = mixpanel.init(
  MIX_PANEL_TOKEN_EXPLORE_APP,
  {
    debug: process.env.NODE_ENV === 'development',
    ip: false,
    persistence: 'localStorage',
  },
  'explore-app',
);
