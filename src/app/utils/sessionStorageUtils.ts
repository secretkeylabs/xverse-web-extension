export enum SessionStorageKeys {
  PASSWORD_HASH = 'passwordHash',
}

export const getFromSessionStorage = async (key: string) => {
  const result = await chrome.storage.session.get(key);
  return result[key];
};

export const setFromSessionStorage = async (key: string, value: string) =>
  chrome.storage.session.set({
    [key]: value,
  });
