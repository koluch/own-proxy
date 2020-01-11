import cn from "classnames";
import { Fragment, h, render, VNode } from "preact";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";
import { Tab } from "../common/browser";
import * as activeTabService from "../common/observables/activeTab";
import * as settingsService from "../common/observables/settings";
import { UseProxyMode } from "../common/observables/settings";
import { combineLatest } from "light-observable/observable";
import { UIMessage } from "../common/uiMessages";
import s from "./main_popup.postcss";

const OPTIONS: [string, { label: string }][] = [
  ["DEFAULT", { label: "Default behaviour" }],
  ["ALWAYS", { label: "Always proxy this site" }],
  ["NEVER", { label: "Never proxy this site" }],
];

// Create your app
function Warning(props: { onClick?: () => void; children: string }): VNode {
  return <div onClick={props.onClick}>{props.children}</div>;
}

function OptionList(props: {
  value: UseProxyMode | null;
  onChange: (value: string) => void;
  isDisabled: boolean;
  isProxyUsedByDefault: boolean;
}): VNode {
  const { onChange, isProxyUsedByDefault, isDisabled } = props;
  return (
    <ul className={s.optionsList}>
      {OPTIONS.map(([value, { label }]) => (
        <li className={s.option}>
          <input
            className={cn("browser-style", s.domain_setting)}
            name="domain_setting"
            value={value}
            type="radio"
            disabled={isDisabled}
            checked={props.value ? value === props.value : value === "DEFAULT"}
            onClick={() => onChange(value)}
          />
          <label className="browser-style" for="domain_proxy_default">
            {label}
            {value === "DEFAULT" && (
              <span id="default_behaviour">
                {" "}
                ({isProxyUsedByDefault ? "use proxy" : `don't use proxy`})
              </span>
            )}
          </label>
        </li>
      ))}
    </ul>
  );
}

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
      <section className={s.warnings}>
        {isConfigNotSet && (
          <Warning
            onClick={() => {
              browser.runtime.openOptionsPage();
            }}
          >
            You haven't configured extension yet, it will not work properly
            until you do. Click to open settings page.
          </Warning>
        )}
      </section>
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
