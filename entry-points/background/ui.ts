import { asSubscribable as settingsObservable } from "../common/settings";
import {
  Dict,
  DictOpt,
  getUrlDomain,
  isProxyEnabledForDomain,
} from "../common/helpers";
import { getTheme, Theme } from "../common/browser";
import { combineLatest } from "light-observable/observable";
import activeTabObservable from "../common/activeTabObservable";

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

combineLatest(activeTabObservable, settingsObservable).subscribe(
  ([activeTab, currentSettings]) => {
    const theme = getTheme();
    const domain = activeTab.url != null ? getUrlDomain(activeTab.url) : null;
    const isProxyEnabled: boolean =
      domain != null && isProxyEnabledForDomain(currentSettings, domain);

    browser.browserAction.setIcon({ path: ICONS[theme][`${isProxyEnabled}`] });
    browser.browserAction.setTitle({
      title: isProxyEnabled ? "Proxy is used" : "Proxy is not used",
    });
  },
);
