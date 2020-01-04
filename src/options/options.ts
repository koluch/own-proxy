import "../common/settings.js";
import * as settings from "../common/settings.js";
import { DEFAULT_SETTINGS } from "../common/settings.js";
import { $ } from "../common/dom.js";

function storeSettings(): void {
  settings.setSettings({
    ...settings.getSettings(),
    host: $("#host").value,
    port: parseInt($("#port").value) || 0,
    user: $("#user").value,
    password: $("#password").value,
    onByDefault: $("#onByDefault").checked,
  });
}

function resetDomainSettings(): void {
  settings.setSettings({
    ...settings.getSettings(),
    domainSettings: DEFAULT_SETTINGS.domainSettings,
  });
}

function render(): void {
  const currentSettings = settings.getSettings();
  $("#host").value = currentSettings.host;
  $("#port").value = currentSettings.port;
  $("#user").value = currentSettings.user;
  $("#password").value = currentSettings.password;
  $("#onByDefault").checked = currentSettings.onByDefault;
}

settings.listen(render);

$("#save-button").addEventListener("click", () => {
  storeSettings();
});

$("#reset-button").addEventListener("click", () => {
  resetDomainSettings();
});
