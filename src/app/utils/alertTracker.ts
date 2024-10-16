export type AnnouncementKey = 'native_segwit_intro';
type CalloutKey =
  | 'co:panel:address_changed_to_native'
  | 'co:receive:address_changed_to_native'
  | 'co:receive:address_change_button';

const alertTrackerStorageKey = 'alertTracker:alertsToShow';

const getAlertData = () => {
  try {
    const alertsToShow = localStorage.getItem(alertTrackerStorageKey);
    const alertsToShowParsed = alertsToShow && JSON.parse(alertsToShow);
    return Array.isArray(alertsToShowParsed) ? alertsToShowParsed : [];
  } catch (e) {
    return [];
  }
};

export const shouldShowAlert = (callout: AnnouncementKey | CalloutKey): boolean => {
  const alertsToShow = getAlertData();
  return alertsToShow.includes(callout);
};

export const markAlertSeen = (alertType: AnnouncementKey | CalloutKey): void => {
  const alertsToShow = getAlertData();

  if (alertsToShow.includes(alertType)) {
    const newAlertsToShow = alertsToShow.filter((alert) => alert !== alertType);
    localStorage.setItem(alertTrackerStorageKey, JSON.stringify(newAlertsToShow));
  }
};

export const markAlertsForShow = (...alertTypes: (AnnouncementKey | CalloutKey)[]): void => {
  const alertsToShow = getAlertData();

  let changed = false;
  alertTypes.forEach((alertType) => {
    if (!alertsToShow.includes(alertType)) {
      alertsToShow.push(alertType);
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(alertTrackerStorageKey, JSON.stringify(alertsToShow));
  }
};
