type Listener<T> = (value: T) => void;

export function createStore<T>(storageKey: string, initial: T) {
  const listeners: Listener<T>[] = [];
  let state: T = initial;

  function callListeners() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  browser.storage.local.get([storageKey]).then(data => {
    state = ((data[storageKey] || initial) as unknown) as T; // todo: fix
    callListeners();
  });

  browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
      [storageKey]: initial as any // todo: fix
    });
  });

  browser.storage.onChanged.addListener(changeData => {
    if (storageKey in changeData) {
      state = changeData[storageKey].newValue;
      callListeners();
    }
  });

  return {
    update: (newState: T) => {
      return browser.storage.local
        .set({
          [storageKey]: newState as any // todo: fix
        })
        .then(() => {
          state = newState;
          callListeners();
        });
    },
    getState: () => state,
    listen: (listener: Listener<T>) => {
      listeners.push(listener);
    }
  };
}
