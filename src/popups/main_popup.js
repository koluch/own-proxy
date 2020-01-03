import state from "../common/state.js";
import settings, {
  getDomainSetting,
  HOST,
  ON_BY_DEFAULT,
  setDomainSettings
} from "../common/settings.js";
import * as selectors from "../common/helpers.js";
import { $ } from "../common/dom.js";
import { getDomain } from "../common/browser.js";

const radioButtons = {
  default: $(".domain_setting[value=default]"),
  always: $(".domain_setting[value=always]"),
  never: $(".domain_setting[value=never]")
};

for (const [proxyValue, input] of Object.entries(radioButtons)) {
  input.addEventListener("click", e => {
    e.preventDefault();
    getDomain().then(domain => {
      if (domain != null) {
        setDomainSettings(domain, { proxy: proxyValue });
      }
    });
  });
}

function render() {
  // Show or hide warning about missing settings
  const currentSettings = settings.getState();
  const $el = $("#warnings_no_config");
  if (currentSettings[HOST] === "") {
    $el.classList.add("isClickable");
    $el.classList.add("isShown");
    $el.addEventListener("click", () => {
      browser.runtime.openOptionsPage();
    });
  } else {
    $el.classList.remove("isShown");
  }

  getDomain().then(domain => {
    const isEnabled =
      domain != null && selectors.isProxyEnabledForDomain(domain);
    $("#current_domain").innerText = domain || "(no domain)";
    $("#default_behaviour").innerText = currentSettings[ON_BY_DEFAULT]
      ? "use proxy"
      : `don't use proxy`;
    $("#current_state > span").innerText = isEnabled ? "used" : `not used`;
    $("#top").classList.toggle("isEnabled", isEnabled);

    if (domain != null) {
      const domainSettings = getDomainSetting(domain);
      for (const [proxyValue, input] of Object.entries(radioButtons)) {
        input.checked = proxyValue === domainSettings.proxy;
      }
    }
  });
}

state.listen(render);
settings.listen(render);
render();
