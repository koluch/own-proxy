import StorageValue = browser.storage.StorageValue;

export type Listener<T> = (value: T) => void;

interface Store<T> {
  update: (newState: T) => Promise<void>;
  getState: () => T;
  listen: (listener: Listener<T>) => void;
}

export function createStore<T>(
  storageKey: string,
  initial: T,
  serialize: (value: T) => StorageValue,
  deserialize: (object: StorageValue) => T,
): Store<T> {
  const listeners: Listener<T>[] = [];
  let state: T = initial;

  function callListeners(): void {
    for (const listener of listeners) {
      listener(state);
    }
  }

  browser.storage.local.get([storageKey]).then(data => {
    const item: StorageValue = data[storageKey];
    state = item != null ? deserialize(item) : initial;
    callListeners();
  });

  browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
      [storageKey]: serialize(initial),
    });
  });

  browser.storage.onChanged.addListener(changeData => {
    if (storageKey in changeData) {
      state = changeData[storageKey].newValue;
      callListeners();
    }
  });

  return {
    update: async (newState: T): Promise<void> => {
      await browser.storage.local.set({
        [storageKey]: serialize(newState),
      });
      state = newState;
      callListeners();
    },
    getState: (): T => state,
    listen: (listener: Listener<T>): void => {
      listeners.push(listener);
    },
  };
}
