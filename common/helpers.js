import settings, { getDomainSetting, ON_BY_DEFAULT } from "./settings.js";

export function isProxyEnabledForDomain(domain) {
  const currentSettings = settings.getState();

  const domainSettings = getDomainSetting(domain);
  if (domainSettings.proxy === "never") {
    return false;
  }
  if (domainSettings.proxy === "always") {
    return true;
  }
  return currentSettings[ON_BY_DEFAULT];
}
