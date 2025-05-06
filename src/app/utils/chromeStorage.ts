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

  getItems<T extends string>(...keys: T[]): Promise<{ [key in T]?: string }> {
    return new Promise((resolve, reject) => {
      this.driver.get(keys, (response: any) => {
        const error = this.getError();
        if (error) {
          return reject(error);
        }
        return resolve(response);
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

  addListener(
    callback: (changes: { [key: string]: chrome.storage.StorageChange }) => void,
  ): () => void {
    this.driver.onChanged.addListener(callback);

    return () => {
      this.driver.onChanged.removeListener(callback);
    };
  }

  getAllKeys(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.driver.get((response: any) => {
        const error = this.getError();
        if (error) {
          return reject(error);
        }
        return resolve(Object.keys(response));
      });
    });
  }
}

const storageInstances: { session?: ChromeStorage; local?: ChromeStorage } = {};

export default {
  get session() {
    if (!storageInstances.session) {
      storageInstances.session = new ChromeStorage(chrome.storage.session);
    }
    return storageInstances.session;
  },
  get local() {
    if (!storageInstances.local) {
      storageInstances.local = new ChromeStorage(chrome.storage.local);
    }
    return storageInstances.local;
  },
};
