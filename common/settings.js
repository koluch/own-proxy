import { createStore } from "./store.js";

export const HOST = "host";
export const PORT = "port";
export const USER = "user";
export const PASSWORD = "password";
export const ON_BY_DEFAULT = "onByDefault";
export const DOMAIN_SPECIFIC_SETTINGS = "domainSpecificSettings";

const DEFAULT_DOMAIN_SETTINGS = {
  proxy: "default"
};

const store = createStore("SETTINGS", {
  [HOST]: "",
  [PORT]: "",
  [USER]: "",
  [PASSWORD]: "",
  [ON_BY_DEFAULT]: false,
  [DOMAIN_SPECIFIC_SETTINGS]: []
});

export function setDomainSettings(domain, newSettings) {
  console.log("domain", domain);
  console.log("newSettings", newSettings);
  const state = store.getState();
  console.log("state", state);
  const domainSettingsTable = state[DOMAIN_SPECIFIC_SETTINGS];
  const domainSettings = domainSettingsTable.find(x => x.domain === domain) || {
    ...DEFAULT_DOMAIN_SETTINGS,
    domain
  };
  const newVar = [
    ...domainSettingsTable.filter(x => x.domain !== domain),
    { ...domainSettings, ...newSettings }
  ];
  store.update({
    ...state,
    [DOMAIN_SPECIFIC_SETTINGS]: newVar
  });
}

export function getDomainSetting(domain) {
  const state = store.getState();
  return (
    state[DOMAIN_SPECIFIC_SETTINGS].find(x => x.domain === domain) || {
      ...DEFAULT_DOMAIN_SETTINGS,
      domain
    }
  );
}

export default store;
