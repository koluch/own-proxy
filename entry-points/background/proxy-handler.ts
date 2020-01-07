import {
  asSubscribable as settingsObservable,
  DEFAULT_SETTINGS,
} from "../common/settings";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";

let currentSettings = DEFAULT_SETTINGS;
settingsObservable.subscribe(next => {
  currentSettings = DEFAULT_SETTINGS;
});

// todo: fix
// @ts-ignore
browser.proxy.onRequest.addListener(
  // todo fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (requestInfo: any) => {
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
