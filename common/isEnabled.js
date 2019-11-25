window.initModule('isEnabled', () => {
  const IS_ENABLED_KEY = "isEnabled";

  const DEFAULT_VALUE = false;

  let isEnabled = false;

  const listeners = [];

  function callListener(listener) {
    listener(isEnabled);
  }

  function callListeners() {
    for (const listener of listeners) {
      callListener(listener);
    }
  }

  browser.storage.onChanged.addListener(changeData => {
    if (changeData[IS_ENABLED_KEY]) {
      isEnabled = changeData[IS_ENABLED_KEY].newValue || DEFAULT_VALUE;
      callListeners();
    }
  });

  browser.storage.local.get([IS_ENABLED_KEY]).then(data => {
    isEnabled = data[IS_ENABLED_KEY];
    callListeners();
  });

  browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
      [IS_ENABLED_KEY]: DEFAULT_VALUE
    });
  });

  return {
    toggle: function() {
      browser.storage.local.get([IS_ENABLED_KEY]).then((values) => {
        browser.storage.local.set({
          [IS_ENABLED_KEY]: !(values[IS_ENABLED_KEY] || DEFAULT_VALUE)
        });
      });
    },
    onChange: function(listener) {
      listeners.push(listener);
      callListener(listener);
    }
  };
});
