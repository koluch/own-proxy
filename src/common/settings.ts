import { createStore, Listener } from "./store.js";
import { DictOpt } from "./helpers";

export type DomainName = string;

export type UseProxyMode = "DEFAULT" | "ALWAYS" | "NEVER";
export type DomainSettings = {
  useProxy: UseProxyMode;
};

export const DEFAULT_DOMAIN_SETTINGS: DomainSettings = {
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

export function getSettings(): Settings {
  return store.getState();
}

export async function setSettings(newSettings: Settings): Promise<void> {
  await store.update(newSettings);
}

export async function listen(listener: Listener<Settings>): Promise<void> {
  await store.listen(listener);
}
