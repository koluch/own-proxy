import "../common/settings.js";
import settings from "../common/settings.js";
import { $ } from "../common/dom.js";

function storeSettings() {
  const currentSettings = settings.getState();
  settings.update({
    ...currentSettings,
    host: $("#host").value,
    port: parseInt($("#port").value) || 0,
    user: $("#user").value,
    password: $("#password").value,
    onByDefault: $("#onByDefault").checked,
  });
}

function resetDomainSpecificSettings() {
  const currentSettings = settings.getState();
  settings.update({
    ...currentSettings,
    domainSpecificSettings: {},
  });
}

function renderOptions() {
  const currentSettings = settings.getState();
  $("#host").value = currentSettings.host;
  $("#port").value = currentSettings.port;
  $("#user").value = currentSettings.user;
  $("#password").value = currentSettings.password;
  $("#onByDefault").checked = currentSettings.onByDefault;
}

settings.listen(renderOptions);

// todo: fix
function onError(e: any) {
  console.error(e);
}

// browser.storage.local.get().then(render, onError);

$("#save-button").addEventListener("click", () => {
  storeSettings();
});

$("#reset-button").addEventListener("click", () => {
  resetDomainSpecificSettings();
});
