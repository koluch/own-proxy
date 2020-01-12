import cn from "classnames";
import { Fragment, h, render, VNode } from "preact";
import { getUrlDomain, isProxyEnabledForDomain } from "../common/helpers";
import { Tab } from "../common/browser";
import * as activeTabService from "../common/observables/activeTab";
import * as settingsService from "../common/observables/settings";
import * as errorLogService from "../common/observables/errorLog";
import { combineLatest } from "light-observable/observable";
import { UIMessage } from "../common/uiMessages";
import s from "./main_popup.postcss";
import OptionList from "./OptionList";
import Warnings from "./Warnings";
import Errors from "./Errors";
import { useState } from "preact/hooks";

function App(props: {
  settings: settingsService.Settings;
  activeTab: Tab;
  errorLog: errorLogService.Log;
}): VNode {
  const { settings, activeTab, errorLog } = props;

  const isConfigNotSet = settings.host === "";

  const domain = activeTab.url ? getUrlDomain(activeTab.url) : null;
  const domainSettingsDict = settings.domainSettings;
  const domainSettings = domain ? domainSettingsDict[domain] : null;

  const isEnabledByDefault = settings.onByDefault;
  const [isEnabled, reason] = isProxyEnabledForDomain(settings, domain);

  const [showErrorsLog, setShowErrorsLog] = useState(false);

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
          <div>
            {(errorLog.messages.length > 0 || showErrorsLog) && (
              <Fragment>
                <div
                  className={s.showErrorsLink}
                  onClick={() => {
                    setShowErrorsLog(!showErrorsLog);
                  }}
                >
                  {showErrorsLog ? "Hide" : "Show"} errors (
                  {errorLog.messages.length})
                </div>
                <div
                  className={s.clearErrorsLink}
                  onClick={() => {
                    errorLogService.DEFAULT.write(log => ({
                      ...log,
                      messages: [],
                    }));
                    setShowErrorsLog(false);
                  }}
                >
                  Clear errors
                </div>
              </Fragment>
            )}
          </div>
          <div>
            <div
              className={s.optionsPageLink}
              onClick={() => {
                browser.runtime.openOptionsPage();
              }}
            >
              Settings
            </div>
          </div>
        </section>
      </div>
      {showErrorsLog && <Errors errors={errorLog.messages} />}
    </Fragment>
  );
}

const _rootEl = document.getElementById("app");
if (_rootEl == null) {
  throw new Error(`Unable to find monting point with id "app"`);
}
const rootEl = _rootEl;

combineLatest(
  activeTabService.DEFAULT,
  settingsService.DEFAULT,
  errorLogService.DEFAULT,
).subscribe(([activeTab, settings, errorLog]) => {
  render(
    <App settings={settings} activeTab={activeTab} errorLog={errorLog} />,
    rootEl,
  );
});
