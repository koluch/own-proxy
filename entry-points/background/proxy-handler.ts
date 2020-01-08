import * as settingsService from "../common/observables/settings";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";

let settings = settingsService.DEFAULT_SETTINGS;
settingsService.DEFAULT.subscribe(next => {
  settings = next;
});

// todo: fix
// @ts-ignore
browser.proxy.onRequest.addListener(
  // todo fix
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (requestInfo: any) => {
    const domain = getUrlDomain(requestInfo.url);
    if (domain && isProxyEnabledForDomain(settings, domain)) {
      return {
        type: "socks",
        host: settings.host,
        port: settings.port,
        username: settings.user,
        password: settings.password,
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
