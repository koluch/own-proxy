import cn from "classnames";
import { h, render, VNode } from "preact";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";
import { Tab } from "../common/browser";
import * as activeTabService from "../common/observables/activeTab";
import * as settingsService from "../common/observables/settings";
import { combineLatest } from "light-observable/observable";

const OPTIONS: [settingsService.UseProxyMode, { label: string }][] = [
  ["DEFAULT", { label: "Default behaviour" }],
  ["NEVER", { label: "Never proxy this site" }],
  ["ALWAYS", { label: "Always proxy this site" }],
];

// Create your app
const Warning = (props: { onClick?: () => void; children: string }): VNode => {
  return <div onClick={props.onClick}>{props.children}</div>;
};

const App = (props: {
  settings: settingsService.Settings;
  activeTab: Tab;
}): VNode => {
  const { settings, activeTab } = props;

  const isConfigNotSet = settings.host === "";

  const domain = activeTab.url ? getUrlDomain(activeTab.url) : null;
  const domainSettingsDict = settings.domainSettings;
  const domainSettings = domain ? domainSettingsDict[domain] : null;

  const isEnabledByDefault = settings.onByDefault;
  const isEnabled = domain != null && isProxyEnabledForDomain(settings, domain);

  return (
    <div>
      <section className="warnings">
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
      <section id="top" className={cn("top", isEnabled && "isEnabled")}>
        <div className="currentDomain">{domain || "(no domain)"}</div>
        <div className="currentState">
          Proxy is <b>{isEnabled ? "used" : `not used`}</b> for this site
        </div>
      </section>
      <section className="bottom">
        <ul className="optionsList">
          {OPTIONS.map(([value, { label }]) => (
            <li className="option">
              <input
                className={cn("browser-style", "domain_setting")}
                name="domain_setting"
                value={value}
                type="radio"
                disabled={domain == null}
                checked={
                  domainSettings
                    ? domainSettings.useProxy === value
                    : value === "DEFAULT"
                }
                onClick={() => {
                  if (domain != null) {
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
                }}
              />
              <label className="browser-style" for="domain_proxy_default">
                {label}
                {value === "DEFAULT" && (
                  <span id="default_behaviour">
                    {" "}
                    ({isEnabledByDefault ? "use proxy" : `don't use proxy`})
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

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
