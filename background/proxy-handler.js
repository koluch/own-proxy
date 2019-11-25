// Initialize the list of blocked hosts
// let blockedHosts = ["example.com", "example.org"];

let isEnabled = false;
let settings = {};

const ICONS = {
  true: "icons/proxy-on-icon.svg",
  false: "icons/proxy-off-icon.svg"
};

function render() {
  browser.browserAction.setIcon({ path: ICONS[isEnabled] });
  browser.browserAction.setTitle({
    title: isEnabled ? "Turn proxy off" : "Turn proxy on"
  });
}
render();

window.modules.settings.onChange(newSettings => {
  settings = newSettings;
  render();
});

window.modules.isEnabled.onChange(newIsEnabled => {
  isEnabled = newIsEnabled;
  render();
});

browser.browserAction.onClicked.addListener(() => {
  window.modules.isEnabled.toggle();
});

browser.proxy.onRequest.addListener(
  requestInfo => {
    if (isEnabled) {
      return {
        type: "socks",
        host: settings[SETTINGS_KEY_HOST],
        port: settings[SETTINGS_KEY_PORT],
        username: settings[SETTINGS_KEY_USER],
        password: settings[SETTINGS_KEY_PASSWORD]
      };
    }
    return { type: "direct" };
  },
  {
    urls: ["<all_urls>"]
  }
);

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});
