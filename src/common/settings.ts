import { createStore } from "./store.js";
import { DictOpt } from "./helpers";

export type DomainName = string;

export type DomainSettings = {
  useProxy: "DEFAULT" | "ALWAYS" | "NEVER";
};

const DEFAULT_DOMAIN_SETTINGS: DomainSettings = {
  useProxy: "DEFAULT",
};

export interface Settings {
  host: string;
  port: number;
  user: string;
  password: string;
  onByDefault: boolean;
  domainSpecificSettings: DictOpt<DomainName, DomainSettings>;
}

const store = createStore<Settings>("SETTINGS", {
  host: "",
  port: 0,
  user: "",
  password: "",
  onByDefault: false,
  domainSpecificSettings: {},
});

export function setDomainSettings(domain: string, newSettings: any) {
  const state = store.getState();
  const domainSettingsTable = state.domainSpecificSettings;
  const domainSettings = domainSettingsTable[domain] || {};
  store.update({
    ...state,
    domainSpecificSettings: {
      ...domainSettings,
      ...newSettings,
    },
  });
}

export function getDomainSetting(domain: string) {
  const state = store.getState();
  return state.domainSpecificSettings[domain] || DEFAULT_DOMAIN_SETTINGS;
}

export default store;
