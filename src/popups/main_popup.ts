import * as settings from "../common/settings.js";
import { DEFAULT_DOMAIN_SETTINGS, UseProxyMode } from "../common/settings.js";
import * as selectors from "../common/helpers.js";
import { Dict, getUrlDomain } from "../common/helpers.js";
import { $ } from "../common/dom.js";
import { getActiveTab } from "../common/browser.js";

const radioButtons: Dict<UseProxyMode, HTMLInputElement> = {
  DEFAULT: $(".domain_setting[value=default]"),
  ALWAYS: $(".domain_setting[value=always]"),
  NEVER: $(".domain_setting[value=never]"),
};

for (const [proxyValue, input] of Object.entries(radioButtons)) {
  input.addEventListener("click", async e => {
    e.preventDefault();
    const activeTab = await getActiveTab();
    if (activeTab.url) {
      const domain = getUrlDomain(activeTab.url);
      if (domain != null) {
        const currentSettings = settings.getSettings();
        const domainSettingsDict = currentSettings.domainSettings;
        const domainSettings =
          domainSettingsDict[domain] || DEFAULT_DOMAIN_SETTINGS;
        settings.setSettings({
          ...currentSettings,
          domainSettings: {
            ...domainSettingsDict,
            [domain]: {
              ...domainSettings,
              useProxy: proxyValue as UseProxyMode,
            },
          },
        });
      }
    }
  });
}

async function render(): Promise<void> {
  // Show or hide warning about missing settings
  const currentSettings = settings.getSettings();
  const $el = $("#warnings_no_config");
  if (currentSettings.host === "") {
    $el.classList.add("isClickable");
    $el.classList.add("isShown");
    $el.addEventListener("click", () => {
      browser.runtime.openOptionsPage();
    });
  } else {
    $el.classList.remove("isShown");
  }

  const activeTab = await getActiveTab();
  if (activeTab.url) {
    const domain = getUrlDomain(activeTab.url);
    const isEnabled =
      domain != null &&
      selectors.isProxyEnabledForDomain(currentSettings, domain);
    $("#current_domain").innerText = domain || "(no domain)";
    $("#default_behaviour").innerText = currentSettings.onByDefault
      ? "use proxy"
      : `don't use proxy`;
    $("#current_state > span").innerText = isEnabled ? "used" : `not used`;
    $("#top").classList.toggle("isEnabled", isEnabled);

    const domainSettings =
      (domain && currentSettings.domainSettings[domain]) ||
      DEFAULT_DOMAIN_SETTINGS;
    for (const [proxyValue, input] of Object.entries(radioButtons)) {
      input.checked = domain != null && proxyValue === domainSettings.useProxy;
      input.disabled = domain == null;
    }
  }
}

settings.listen(render);
render();
