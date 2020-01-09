import { Fragment, h, JSX, render, VNode } from "preact";
import cn from "classnames";
import * as settingsService from "../common/observables/settings";
import {
  DomainSettingsDict,
  Settings,
  UseProxyMode,
  UseProxyModeValues,
} from "../common/observables/settings";
import { useEffect, useState } from "preact/hooks";
import { isEqual } from "../common/helpers";

const DomainSettings = (props: {
  domainSettingsDict: DomainSettingsDict;
  setDomainSettingsDict: (domainSettings: DomainSettingsDict) => void;
}): VNode => {
  const { domainSettingsDict, setDomainSettingsDict } = props;
  return (
    <div className={cn("domainSettings")}>
      {Object.entries(domainSettingsDict).map(([domain, domainSettings]) => {
        function handleUseProxyChange(
          e: JSX.TargetedEvent<HTMLSelectElement>,
        ): void {
          const value = e.currentTarget.value || "DEFAULT";
          setDomainSettingsDict({
            ...domainSettingsDict,
            [domain]: {
              ...domainSettings,
              useProxy: value as UseProxyMode,
            },
          });
        }

        function handleDeleteChange(): void {
          const newDict: DomainSettingsDict = {};
          for (const [nextDomain, nextSettings] of Object.entries(
            domainSettingsDict,
          )) {
            if (domain !== nextDomain) {
              newDict[nextDomain] = nextSettings;
            }
          }
          setDomainSettingsDict(newDict);
        }

        return (
          <div key={domain} className="domainSettingsRow">
            <div
              className={cn("domainSettingsItemDomain", "domainSettingsItem")}
            >
              <div>{domain}</div>
            </div>
            <div
              className={cn("domainSettingsItemUseProxy", "domainSettingsItem")}
            >
              <select
                value={domainSettings.useProxy}
                className={cn(
                  "browser-style",
                  "domainSettingsItemUseProxySelect",
                )}
                onInput={handleUseProxyChange}
              >
                {UseProxyModeValues.map(value => (
                  <option value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div
              className={cn("domainSettingsItemDelete", "domainSettingsItem")}
            >
              <button
                className={cn(
                  "browser-style",
                  "domainSettingsItemDeleteButton",
                )}
                onClick={handleDeleteChange}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const App = (props: {}): VNode | null => {
  const [formState, setFormState] = useState<Settings>(
    settingsService.DEFAULT_SETTINGS,
  );
  const [currentSettings, setCurrentSettings] = useState<Settings>(
    settingsService.DEFAULT_SETTINGS,
  );

  useEffect(() => {
    const subscription = settingsService.DEFAULT.subscribe(settings => {
      setFormState(settings);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    const subscription = settingsService.DEFAULT.subscribe(settings => {
      setCurrentSettings(settings);
    });
    return () => subscription.unsubscribe();
  });

  function handleRemoveDomainSettings(): void {
    setFormState({
      ...formState,
      domainSettings: {},
    });
  }

  function handleSave(): void {
    settingsService.DEFAULT.write(formState);
  }

  function handleCancel(): void {
    setFormState(currentSettings);
  }

  const isFormChanged = !isEqual(formState, currentSettings);

  return (
    <div>
      <section className="settings browser-style">
        <label for="host" className="title">
          Host:
        </label>
        <input
          className="param"
          id="host"
          name="host"
          type="text"
          value={formState.host}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              host: e.currentTarget.value,
            }));
          }}
        />
        <label for="port" className="title">
          Port:
        </label>
        <input
          className="param"
          id="port"
          name="port"
          type="number"
          value={formState.port}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              port: parseInt(e.currentTarget.value, 10) || 0,
            }));
          }}
        />

        <label for="user" className="title">
          User:
        </label>
        <input
          className="param"
          id="user"
          name="user"
          type="text"
          value={formState.user}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              user: e.currentTarget.value,
            }));
          }}
        />

        <label for="password" className="title">
          Password:
        </label>
        <input
          className="param"
          id="password"
          name="password"
          type="text"
          value={formState.password}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              password: e.currentTarget.value,
            }));
          }}
        />

        <label for="onByDefault" className="title">
          Use proxy by default:
        </label>
        <input
          className="param"
          id="onByDefault"
          name="onByDefault"
          type="checkbox"
          checked={formState.onByDefault}
          onChange={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              onByDefault: e.currentTarget.checked,
            }));
          }}
        />

        {Object.keys(formState.domainSettings).length > 0 && (
          <Fragment>
            <label className="title">Domain settings:</label>
            <DomainSettings
              domainSettingsDict={formState.domainSettings}
              setDomainSettingsDict={newDomainSettingsDict => {
                setFormState({
                  ...formState,
                  domainSettings: newDomainSettingsDict,
                });
              }}
            />
            <div className="buttons">
              <button
                className="browser-style"
                type="button"
                id="reset-button"
                onClick={handleRemoveDomainSettings}
              >
                Remove domain-specific settings
              </button>
            </div>
          </Fragment>
        )}

        <div className="buttons">
          <button
            className="browser-style"
            type="button"
            id="save-button"
            onClick={handleCancel}
            disabled={!isFormChanged}
          >
            Cancel
          </button>
          <button
            className="browser-style"
            type="button"
            id="save-button"
            onClick={handleSave}
            disabled={!isFormChanged}
          >
            Save
          </button>
        </div>
      </section>
    </div>
  );
};

const _rootEl = document.getElementById("app");
if (_rootEl == null) {
  throw new Error(`Unable to find monting point with id "app"`);
}
const rootEl = _rootEl;

render(<App />, rootEl);
