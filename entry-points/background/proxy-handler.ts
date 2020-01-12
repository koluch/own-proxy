import * as settingsService from "../common/observables/settings";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";
import * as errorLogService from "../common/observables/errorLog";

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
    const [isEnabled] = isProxyEnabledForDomain(settings, domain);
    if (isEnabled) {
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
let counter = 0;
// todo: fix
// @ts-ignore
browser.proxy.onError.addListener(error => {
  console.warn(`Proxy error: ${error.message}`);
  errorLogService.DEFAULT.write(log => ({
    ...log,
    messages: [
      ...log.messages,
      {
        id: `${counter++}`,
        time: new Date().getTime(),
        text: error.message,
      },
    ],
  }));
});
