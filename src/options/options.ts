import "../common/settings.js";
import * as settings from "../common/settings.js";
import { $ } from "../common/dom.js";

function storeSettings() {
  settings.setSettings({
    ...settings.getSettings(),
    host: $("#host").value,
    port: parseInt($("#port").value) || 0,
    user: $("#user").value,
    password: $("#password").value,
    onByDefault: $("#onByDefault").checked,
  });
}

function resetDomainSpecificSettings() {
  settings.setSettings({
    ...settings.getSettings(),
    domainSpecificSettings: {},
  });
}

function render() {
  const currentSettings = settings.getSettings();
  $("#host").value = currentSettings.host;
  $("#port").value = currentSettings.port;
  $("#user").value = currentSettings.user;
  $("#password").value = currentSettings.password;
  $("#onByDefault").checked = currentSettings.onByDefault;
}

settings.listen(render);

// todo: fix
function onError(e: any) {
  console.error(e);
}

$("#save-button").addEventListener("click", () => {
  storeSettings();
});

$("#reset-button").addEventListener("click", () => {
  resetDomainSpecificSettings();
});
