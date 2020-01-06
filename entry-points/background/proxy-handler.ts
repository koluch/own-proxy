// Initialize the list of blocked hosts

import * as settings from "../common/settings";
import {
  Dict,
  DictOpt,
  getUrlDomain,
  isProxyEnabledForDomain,
} from "../common/helpers";
import { getActiveTab, getTheme, Theme } from "../common/browser";

const ICONS: Dict<Theme, DictOpt<string, string>> = {
  LIGHT: {
    true: "/assets/icons/proxy-on-icon.svg",
    false: "/assets/icons/proxy-off-icon-light.svg",
  },
  DARK: {
    true: "/assets/icons/proxy-on-icon.svg",
    false: "/assets/icons/proxy-off-icon-dark.svg",
  },
};

async function handleChanges(): Promise<void> {
  const currentSettings: settings.Settings = settings.getSettings();
  const theme = getTheme();
  const activeTab = await getActiveTab();
  const domain = activeTab.url != null ? getUrlDomain(activeTab.url) : null;
  const isProxyEnabled: boolean =
    domain != null && isProxyEnabledForDomain(currentSettings, domain);

  browser.browserAction.setIcon({ path: ICONS[theme][`${isProxyEnabled}`] });
  browser.browserAction.setTitle({
    title: isProxyEnabled ? "Proxy is used" : "Proxy is not used",
  });
}

browser.runtime.onInstalled.addListener(handleChanges);

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
  // todo fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (requestInfo: any) => {
    const currentSettings = settings.getSettings();
    const domain = getUrlDomain(requestInfo.url);
    if (domain && isProxyEnabledForDomain(currentSettings, domain)) {
      return {
        type: "socks",
        host: currentSettings.host,
        port: currentSettings.port,
        username: currentSettings.user,
        password: currentSettings.password,
      };
    }
    return { type: "direct" };
  },
  {
    urls: ["<all_urls>"],
  },
);

// Log any errors from the proxy script
// todo: fix
// @ts-ignore
browser.proxy.onError.addListener(error => {
  console.error(`Proxy error: ${error.message}`);
});
