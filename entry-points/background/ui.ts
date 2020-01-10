import {
  Dict,
  DictOpt,
  getUrlDomain,
  isProxyEnabledForDomain,
} from "../common/helpers";
import { getTheme, Theme } from "../common/browser";
import { combineLatest } from "light-observable/observable";
import * as settingsService from "../common/observables/settings";
import * as activeTabService from "../common/observables/activeTab";
import {
  ICONS_PROXY_OFF_ICON_DARK,
  ICONS_PROXY_OFF_ICON_LIGHT,
  ICONS_PROXY_ON_ICON_DARK,
  ICONS_PROXY_ON_ICON_LIGHT,
} from "../common/assets";

const ICONS: Dict<Theme, DictOpt<string, string>> = {
  LIGHT: {
    true: ICONS_PROXY_ON_ICON_LIGHT,
    false: ICONS_PROXY_OFF_ICON_LIGHT,
  },
  DARK: {
    true: ICONS_PROXY_ON_ICON_DARK,
    false: ICONS_PROXY_OFF_ICON_DARK,
  },
};

combineLatest(activeTabService.DEFAULT, settingsService.DEFAULT).subscribe(
  ([activeTab, settings]) => {
    const theme = getTheme();
    const domain = activeTab.url != null ? getUrlDomain(activeTab.url) : null;
    const [isProxyEnabled] = isProxyEnabledForDomain(settings, domain);

    browser.browserAction.setIcon({ path: ICONS[theme][`${isProxyEnabled}`] });
    browser.browserAction.setTitle({
      title: isProxyEnabled ? "Proxy is used" : "Proxy is not used",
    });
  },
);
