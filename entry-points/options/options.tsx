import { h, render, VNode } from "preact";
import * as settingsService from "../common/observables/settings";
import { useState } from "preact/hooks";
import { JSXInternal } from "preact/src/jsx";
import TargetedEvent = JSXInternal.TargetedEvent;

function resetDomainSettings(): void {
  settingsService.DEFAULT.write({
    domainSettings: settingsService.DEFAULT_SETTINGS.domainSettings,
  });
}

const App = (props: { settings: settingsService.Settings }): VNode => {
  const { settings: currentSettings } = props;

  const [formState, setFormState] = useState(currentSettings);

  function handleSave(): void {
    settingsService.DEFAULT.write({
      host: formState.host,
      port: formState.port,
      user: formState.user,
      password: formState.password,
      onByDefault: formState.onByDefault,
    });
  }

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
          onChange={(e: TargetedEvent<HTMLInputElement>) => {
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
          onChange={(e: TargetedEvent<HTMLInputElement>) => {
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
          onChange={(e: TargetedEvent<HTMLInputElement>) => {
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
          onChange={(e: TargetedEvent<HTMLInputElement>) => {
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
          onChange={(e: TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              onByDefault: e.currentTarget.checked,
            }));
          }}
        />

        <div className="buttons">
          <button
            className="browser-style"
            type="button"
            id="reset-button"
            onClick={resetDomainSettings}
          >
            Reset domain-specific settings
          </button>
        </div>

        <div className="buttons">
          <button
            className="browser-style"
            type="button"
            id="save-button"
            onClick={handleSave}
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

settingsService.DEFAULT.subscribe(settings => {
  render(<App settings={settings} />, rootEl);
});
