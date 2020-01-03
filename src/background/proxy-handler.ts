// Initialize the list of blocked hosts

import state from "../common/state.js";
import settings from "../common/settings.js";
import { Dict, DictOpt, isProxyEnabledForDomain } from "../common/helpers.js";
import { getDomain, getTheme, Theme } from "../common/browser.js";

const ICONS: Dict<Theme, DictOpt<string, string>> = {
  LIGHT: {
    true: "../icons/proxy-on-icon.svg",
    false: "../icons/proxy-off-icon-light.svg"
  },
  DARK: {
    true: "../icons/proxy-on-icon.svg",
    false: "../icons/proxy-off-icon-dark.svg"
  }
};

function handleChanges() {
  const theme = getTheme();
  getDomain().then(domain => {
    const isProxyEnabled: boolean =
      domain != null && isProxyEnabledForDomain(domain);

    browser.browserAction.setIcon({ path: ICONS[theme][`${isProxyEnabled}`] });
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

// todo: fix
// @ts-ignore
browser.proxy.onRequest.addListener(
  (requestInfo: any) => { // todo fix
    const domain = new URL(requestInfo.url).host;
    if (isProxyEnabledForDomain(domain)) {
      const currentSettings = settings.getState();
      return {
        type: "socks",
        host: currentSettings.host,
        port: currentSettings.port,
        username: currentSettings.user,
        password: currentSettings.password
      };
    }
    return { type: "direct" };
  },
  {
    urls: ["<all_urls>"]
  }
);

// Log any errors from the proxy script
// todo: fix
// @ts-ignore
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});
