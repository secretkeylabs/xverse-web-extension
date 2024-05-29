/* eslint-disable class-methods-use-this */
class ChromeStorage {
  private driver!: chrome.storage.LocalStorageArea;

  constructor(driver: chrome.storage.LocalStorageArea) {
    this.driver = driver;
  }

  getError(): Error | undefined {
    if (!chrome.runtime.lastError) return undefined;

    return new Error(chrome.runtime.lastError.message);
  }

  setItem(key: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.driver.set({ [key]: item }, () => {
        const error = this.getError();
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }

  getItem<T = any, D = undefined>(key: string, defaultValue?: D): Promise<T | D> {
    return new Promise((resolve, reject) => {
      this.driver.get(key, (response: any) => {
        const error = this.getError();
        if (error) {
          return reject(error);
        }
        return resolve(response[key] ?? defaultValue);
      });
    });
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.driver.remove(key, () => {
        const error = this.getError();
        if (error) {
          return reject(error);
        }
        return resolve();
      });
    });
  }
}
export const chromeSessionStorage = new ChromeStorage(chrome.storage.session);
export const chromeLocalStorage = new ChromeStorage(chrome.storage.local);
