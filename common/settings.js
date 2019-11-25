const SETTINGS_KEY_HOST = "host";
const SETTINGS_KEY_PORT = "port";
const SETTINGS_KEY_USER = "user";
const SETTINGS_KEY_PASSWORD = "password";

window.initModule("settings", () => {
  const keys = [
    SETTINGS_KEY_HOST,
    SETTINGS_KEY_PORT,
    SETTINGS_KEY_USER,
    SETTINGS_KEY_PASSWORD
  ];

  let settings = {};

  const listeners = [];

  function callListener(listener) {
    listener(settings);
  }

  function callListeners() {
    for (const listener of listeners) {
      callListener(listener);
    }
  }

  browser.storage.onChanged.addListener(changeData => {
    const newSettings = { ...settings };
    for (const { key, value } of Object.entries(changeData)) {
      newSettings[key] = value;
    }
    callListeners();
  });

  browser.storage.local.get(keys).then(newSettings => {
    settings = { ...newSettings };
    callListeners();
  });

  return {
    onChange: function(listener) {
      listeners.push(listener);
      callListener(listener);
    }
  };
});
