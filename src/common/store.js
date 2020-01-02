export function createStore(storageKey, initial) {
  const listeners = [];
  let state = initial;

  function callListeners() {
    for (const listener of listeners) {
      listener(state);
    }
  }

  browser.storage.local.get([storageKey]).then(data => {
    state = data[storageKey];
    callListeners();
  });

  browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
      [storageKey]: initial
    });
  });

  browser.storage.onChanged.addListener(changeData => {
    if (storageKey in changeData) {
      state = changeData[storageKey].newValue;
      callListeners();
    }
  });

  return {
    update: newState => {
      return browser.storage.local
        .set({
          [storageKey]: newState
        })
        .then(() => {
          state = newState;
          callListeners();
        });
    },
    getState: () => state,
    listen: listener => {
      listeners.push(listener);
    }
  };
}
