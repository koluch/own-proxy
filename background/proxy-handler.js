// Initialize the list of blocked hosts
// let blockedHosts = ["example.com", "example.org"];

const keys = ["host", "port", "user", "password"];

let isEnabled = false;
let settings = keys.reduce((acc, x) => ({...acc, [x]: ''}), {});

const ICONS = {
  true: "icons/proxy-on-icon.svg",
  false: "icons/proxy-off-icon.svg"
};

function readState() {
  return browser.storage.local.get(data => {
    isEnabled = data.isEnabled || false;
    for (const key of keys) {
      settings[key] = data[key] || '';
    }
  });
}

function render() {
  browser.browserAction.setIcon({ path: ICONS[isEnabled] });
}

browser.browserAction.onClicked.addListener(() => {
  let newValue = !isEnabled;
  browser.storage.local.set({
    isEnabled: newValue
  });
});

// Set the default list on installation.
browser.runtime.onInstalled.addListener(details => {
  browser.storage.local.set({
    isEnabled: false
  });
});

readState();
render();

// Listen for changes in the blocked list
browser.storage.onChanged.addListener(changeData => {
  isEnabled = changeData.isEnabled.newValue;
  render();
});

// Listen for a request to open a webpage
browser.proxy.onRequest.addListener(handleProxyRequest, {
  urls: ["<all_urls>"]
});

// On the request to open a webpage
function handleProxyRequest(requestInfo) {
  if (isEnabled) {
    return {
      type: "socks",
      host: settings['host'],
      port: settings['port'],
      username: settings['username'],
      password: settings['password'],
    };
  }
  return { type: "direct" };
}

// Log any errors from the proxy script
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});
