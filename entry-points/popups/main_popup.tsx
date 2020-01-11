import cn from "classnames";
import { Fragment, h, render, VNode } from "preact";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";
import { Tab } from "../common/browser";
import * as activeTabService from "../common/observables/activeTab";
import * as settingsService from "../common/observables/settings";
import { combineLatest } from "light-observable/observable";
import { UIMessage } from "../common/uiMessages";
import s from "./main_popup.postcss";
import OptionList from "./OptionList";
import Warnings from "./Warnings";

function App(props: {
  settings: settingsService.Settings;
  activeTab: Tab;
}): VNode {
  const { settings, activeTab } = props;

  const isConfigNotSet = settings.host === "";

  const domain = activeTab.url ? getUrlDomain(activeTab.url) : null;
  const domainSettingsDict = settings.domainSettings;
  const domainSettings = domain ? domainSettingsDict[domain] : null;

  const isEnabledByDefault = settings.onByDefault;
  const [isEnabled, reason] = isProxyEnabledForDomain(settings, domain);

  const handleChangeUseProxy = (value: string): void => {
    if (domain != null) {
      if (value === "DEFAULT") {
        const { [domain]: _, ...newDomainSettingsDict } = {
          ...domainSettingsDict,
        };
        settingsService.DEFAULT.write({
          domainSettings: newDomainSettingsDict,
        });
      } else if (value === "NEVER" || value === "ALWAYS") {
        settingsService.DEFAULT.write({
          domainSettings: {
            ...domainSettingsDict,
            [domain]: {
              ...domainSettings,
              useProxy: value,
            },
          },
        });
      }
    }
  };

  return (
    <Fragment>
      <Warnings
        warnings={[
          isConfigNotSet && {
            text: `You haven't configured extension yet, it will not work properly
            until you do. Click to open settings page.`,
            onClick: () => {
              browser.runtime.openOptionsPage();
            },
          },
        ]}
      />
      <div className={cn(s.content, isEnabled && s.isEnabled)}>
        <section className={cn(s.section, s.top)}>
          <div className={s.currentDomain}>{domain || "(no domain)"}</div>
        </section>
        <section className={cn(s.section, s.top)}>
          <div className={s.currentState}>
            <UIMessage
              params={{ isEnabled: <b>{isEnabled ? "used" : "not used"}</b> }}
            >
              {reason}
            </UIMessage>
          </div>
        </section>
        <section className={cn(s.section, s.middle)}>
          <OptionList
            value={domainSettings ? domainSettings.useProxy : null}
            isDisabled={domain == null}
            isProxyUsedByDefault={isEnabledByDefault}
            onChange={handleChangeUseProxy}
          />
        </section>
        <section className={cn(s.section, s.footer)}>
          <div className={s.optionsPageLink}>
            <a
              href="#"
              onClick={() => {
                browser.runtime.openOptionsPage();
              }}
            >
              Settings
            </a>
          </div>
        </section>
      </div>
    </Fragment>
  );
}

const _rootEl = document.getElementById("app");
if (_rootEl == null) {
  throw new Error(`Unable to find monting point with id "app"`);
}
const rootEl = _rootEl;

combineLatest(activeTabService.DEFAULT, settingsService.DEFAULT).subscribe(
  ([activeTab, settings]) => {
    render(<App settings={settings} activeTab={activeTab} />, rootEl);
  },
);
