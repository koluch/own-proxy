import { h, JSX, render, VNode } from "preact";
import cn from "classnames";
import { useEffect, useRef, useState } from "preact/hooks";
import * as settingsService from "../common/observables/settings";
import { Settings } from "../common/observables/settings";
import { downloadFile, isEqual, uploadFile } from "../common/helpers";
import DomainSettings from "./DomainSettings";
import s from "./options.postcss";

const EXPORT_FILENAME = "own-proxy-settings.json";

function App(props: {}): VNode | null {
  const importFileInput = useRef<HTMLInputElement | null>(null);

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

  const handleExport = async (): Promise<void> => {
    await downloadFile(JSON.stringify(formState, null, 2), EXPORT_FILENAME);
  };

  const handleImport = async (
    e: JSX.TargetedEvent<HTMLInputElement>,
  ): Promise<void> => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files.item(0);
      if (file != null && file.type === "application/json") {
        const fileText = await uploadFile(file);
        const fileJSON = JSON.parse(fileText);
        setFormState(fileJSON as Settings); // todo: validate
      }
    }
  };

  const isFormChanged = !isEqual(formState, currentSettings);

  return (
    <div>
      <section className={cn(s.settings, "browser-style")}>
        <label for="host" className="title">
          Host:
        </label>
        <input
          className="param"
          id="host"
          name="host"
          type="text"
          value={formState.host}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
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
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              port: parseInt(e.currentTarget.value, 10) || 0,
            }));
          }}
        />

        <label for="user">User:</label>
        <input
          className="param"
          id="user"
          name="user"
          type="text"
          value={formState.user}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
            setFormState(oldState => ({
              ...oldState,
              user: e.currentTarget.value,
            }));
          }}
        />

        <label for="password">Password:</label>
        <input
          className="param"
          id="password"
          name="password"
          type="text"
          value={formState.password}
          onInput={(e: JSX.TargetedEvent<HTMLInputElement>) => {
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
        {Object.keys(formState.domainSettings).length > 0 && (
          <div className={s.buttons}>
            <button
              className="browser-style"
              type="button"
              id="reset-button"
              onClick={handleRemoveDomainSettings}
            >
              Remove domain-specific settings
            </button>
          </div>
        )}

        <div className={s.buttons}>
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
          <button
            className="browser-style"
            type="button"
            onClick={handleExport}
          >
            Export
          </button>
          <button
            className="browser-style"
            type="button"
            onClick={() => {
              if (importFileInput.current) {
                importFileInput.current.click();
              }
            }}
          >
            Import
          </button>
          <input
            ref={importFileInput}
            style={{ display: "none" }}
            className="browser-style"
            type="file"
            onChange={handleImport}
          />
        </div>
      </section>
    </div>
  );
}

const _rootEl = document.getElementById("app");
if (_rootEl == null) {
  throw new Error(`Unable to find monting point with id "app"`);
}
const rootEl = _rootEl;

render(<App />, rootEl);
