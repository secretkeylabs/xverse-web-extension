const driverMap = new WeakMap();
const runtimeMap = new WeakMap();

class ChromeStorage {
  constructor(driver: any, runtime: any) {
    driverMap.set(this, driver);
    runtimeMap.set(this, runtime);
  }

  getDriver(): chrome.storage.StorageArea {
    return driverMap.get(this);
  }

  hasError() {
    return !!this.getError();
  }

  getError(): string | undefined {
    return runtimeMap.get(this).lastError;
  }

  setItem(key: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDriver().set({ [key]: item }, () => {
        if (this.hasError()) {
          return reject(this.getError());
        }
        return resolve();
      });
    });
  }

  getItem<T = any, D = undefined>(key: string, defaultValue?: D): Promise<T | D> {
    return new Promise((resolve, reject) => {
      this.getDriver().get(key, (response: any) => {
        if (this.hasError()) {
          return reject(this.getError());
        }
        return resolve(response[key] ?? defaultValue);
      });
    });
  }

  removeItem(key: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDriver().remove(key, () => {
        if (this.hasError()) {
          return reject(this.getError());
        }
        return resolve();
      });
    });
  }
}
export default ChromeStorage;
export const chromeSessionStorage = new ChromeStorage(chrome.storage.session, chrome.runtime);
export const chromeLocalStorage = new ChromeStorage(chrome.storage.local, chrome.runtime);
