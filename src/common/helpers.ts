import settings, { getDomainSetting } from "./settings.js";

export type Dict<K extends string, T> = { [P in K]: T };
export type DictOpt<K extends string, T> = { [P in K]?: T };

export function isProxyEnabledForDomain(domain: string): boolean {
  const currentSettings = settings.getState();

  const domainSettings = getDomainSetting(domain);
  if (domainSettings.useProxy === "NEVER") {
    return false;
  }
  if (domainSettings.useProxy === "ALWAYS") {
    return true;
  }
  return currentSettings.onByDefault;
}
