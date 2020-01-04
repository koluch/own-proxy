import { DEFAULT_DOMAIN_SETTINGS, Settings } from "./settings.js";

export type Dict<K extends string, T> = { [P in K]: T };
export type DictOpt<K extends string, T> = { [P in K]?: T };

export function isProxyEnabledForDomain(
  settings: Settings,
  domain: string,
): boolean {
  const domainSettings =
    settings.domainSpecificSettings[domain] || DEFAULT_DOMAIN_SETTINGS;
  if (domainSettings.useProxy === "NEVER") {
    return false;
  }
  if (domainSettings.useProxy === "ALWAYS") {
    return true;
  }
  return settings.onByDefault;
}

export function getUrlDomain(url: string): string | null {
  try {
    return new URL(url).host;
  } catch (e) {
    console.warn(`Unable to parse domain from current tab: ${e.message}`);
  }
  return null;
}
