import { createStore, Store } from "../store";
import { Dict } from "../helpers";
import { WriteableObservable } from "./service";
import StorageObject = browser.storage.StorageObject;
import StorageValue = browser.storage.StorageValue;

export type DomainName = string;

export const UseProxyModeValues = ["DEFAULT", "ALWAYS", "NEVER"] as const;
export type UseProxyMode = typeof UseProxyModeValues[number];

export type DomainSettings = {
  useProxy: UseProxyMode;
};

export type DomainSettingsDict = Dict<DomainName, DomainSettings>;

export interface Settings {
  host: string;
  port: number;
  user: string;
  password: string;
  onByDefault: boolean;
  domainSettings: DomainSettingsDict;
}

export const DEFAULT_DOMAIN_SETTINGS: DomainSettings = {
  useProxy: "DEFAULT",
};

export const DEFAULT_SETTINGS: Settings = {
  host: "",
  port: 1080,
  user: "",
  password: "",
  onByDefault: false,
  domainSettings: {
    "fuck.ru": { useProxy: "ALWAYS" },
    "google.com": { useProxy: "NEVER" },
  },
};

export function create(store: Store<Settings>): WriteableObservable<Settings> {
  return {
    write: (newSettings: Partial<Settings>): void => {
      store.next({
        ...store.getState(),
        ...newSettings,
      });
    },
    subscribe: (...args) => store.subscribe(...args),
  };
}

export const DEFAULT: WriteableObservable<Settings> = create(
  createStore<Settings>(
    "SETTINGS",
    DEFAULT_SETTINGS,
    (settings: Settings): StorageObject => {
      const result: StorageObject = {};
      for (const [key, value] of Object.entries(settings)) {
        result[key] = value;
      }
      return result;
    },
    (value: StorageValue): Settings => {
      if (value == null) {
        return DEFAULT_SETTINGS;
      }
      if (typeof value != "object") {
        throw new Error(`Unable to deserialize settings from non-object value`);
      }
      const obj = value as StorageObject;
      return {
        ...DEFAULT_SETTINGS,
        host: (obj["host"] || DEFAULT_SETTINGS.host) as string,
        port: (obj["port"] || DEFAULT_SETTINGS.port) as number,
        user: (obj["user"] || DEFAULT_SETTINGS.user) as string,
        password: (obj["password"] || DEFAULT_SETTINGS.password) as string,
        onByDefault: (obj["onByDefault"] ||
          DEFAULT_SETTINGS.onByDefault) as boolean,
        domainSettings: (obj["domainSettings"] ||
          DEFAULT_SETTINGS.domainSettings) as DomainSettingsDict,
      };
    },
  ),
);
