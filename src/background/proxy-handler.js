// Initialize the list of blocked hosts

import state from "../common/state.js";
import settings, { HOST, PASSWORD, PORT, USER } from "../common/settings.js";
import { isProxyEnabledForDomain } from "../common/helpers.js";
import { getDomain } from "../common/browser.js";

const ICONS = {
  light: {
    true: "../icons/proxy-on-icon.svg",
    false: "../icons/proxy-off-icon-light.svg"
  },
  dark: {
    true: "../icons/proxy-on-icon.svg",
    false: "../icons/proxy-off-icon-dark.svg"
  }
};

function handleChanges() {
  const theme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
  getDomain().then(domain => {
    const isProxyEnabled = domain != null && isProxyEnabledForDomain(domain);

    browser.browserAction.setIcon({ path: ICONS[theme][isProxyEnabled] });
    browser.browserAction.setTitle({
      title: isProxyEnabled ? "Proxy is used" : "Proxy is not used"
    });
  });
}

browser.runtime.onInstalled.addListener(handleChanges);

state.listen(handleChanges);
settings.listen(handleChanges);
browser.tabs.onActivated.addListener(handleChanges);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (tabInfo.active && changeInfo.url) {
    handleChanges();
  }
});

browser.proxy.onRequest.addListener(
  requestInfo => {
    const domain = new URL(requestInfo.url).host;
    if (isProxyEnabledForDomain(domain)) {
      const currentSettings = settings.getState();
      return {
        type: "socks",
        host: currentSettings[HOST],
        port: currentSettings[PORT],
        username: currentSettings[USER],
        password: currentSettings[PASSWORD]
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
