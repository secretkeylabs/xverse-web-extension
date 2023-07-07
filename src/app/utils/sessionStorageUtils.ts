export const getSessionItem= async (key: string) => {
  const result = await chrome.storage.session.get(key);
  return result[key];
};

export const setSessionItem = async (key: string, value: any) =>
  chrome.storage.session.set({
    [key]: value,
  });

export const removeSessionItem = async (key: string) => chrome.storage.session.remove(key);
