import cn from "classnames";
import { h, render, VNode } from "preact";
import * as settings from "../common/settings";
import { getSettings, Settings, UseProxyMode } from "../common/settings";
import * as selectors from "../common/helpers";
import { getUrlDomain } from "../common/helpers";
import { getActiveTab, Tab } from "../common/browser";

const OPTIONS: [UseProxyMode, { label: string }][] = [
  ["DEFAULT", { label: "Default behaviour" }],
  ["NEVER", { label: "Never proxy this site" }],
  ["ALWAYS", { label: "Always proxy this site" }],
];

// Create your app
const Warning = (props: { onClick?: () => void; children: string }): VNode => {
  return <div onClick={props.onClick}>{props.children}</div>;
};

const App = (props: { settings: Settings; activeTab: Tab }): VNode => {
  const { settings: currentSettings, activeTab } = props;

  const isConfigNotSet = currentSettings.host === "";

  const domain = activeTab.url ? getUrlDomain(activeTab.url) : null;
  const domainSettingsDict = currentSettings.domainSettings;
  const domainSettings = domain ? domainSettingsDict[domain] : null;

  const isEnabledByDefault = currentSettings.onByDefault;
  const isEnabled =
    domain != null &&
    selectors.isProxyEnabledForDomain(currentSettings, domain);

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
                  domainSettings ? domainSettings.useProxy === value : false
                }
                onClick={() => {
                  if (domain != null) {
                    settings.setSettings({
                      ...currentSettings,
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

async function rerender(): Promise<void> {
  const activeTab = await getActiveTab();
  render(<App settings={getSettings()} activeTab={activeTab} />, rootEl);
}

settings.listen(rerender);
rerender();
