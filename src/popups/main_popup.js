import state from "../common/state.js";
import settings, {
  getDomainSetting,
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
      setDomainSettings(domain, { proxy: proxyValue });
    });
  });
}

function render() {
  getDomain().then(domain => {
    const isEnabled = selectors.isProxyEnabledForDomain(domain);
    const currentSettings = settings.getState();
    $("#current_domain").innerText = domain;
    $("#default_behaviour").innerText = currentSettings[ON_BY_DEFAULT]
      ? "use proxy"
      : `don't use proxy`;
    $("#current_state > span").innerText = isEnabled ? "used" : `not used`;
    $("#top").classList.toggle("isEnabled", isEnabled);

    const domainSettings = getDomainSetting(domain);
    for (const [proxyValue, input] of Object.entries(radioButtons)) {
      input.checked = proxyValue === domainSettings.proxy;
    }
  });
}

state.listen(render);
settings.listen(render);
render();