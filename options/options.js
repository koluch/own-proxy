import "../common/settings.js";
import settings, {
  DOMAIN_SPECIFIC_SETTINGS,
  HOST,
  ON_BY_DEFAULT,
  PASSWORD,
  PORT,
  USER
} from "../common/settings.js";
import { $ } from "../common/dom.js";

function storeSettings() {
  let currentSettings = settings.getState();
  settings.update({
    ...currentSettings,
    [HOST]: $("#host").value,
    [PORT]: $("#port").value,
    [USER]: $("#user").value,
    [PASSWORD]: $("#password").value,
    [ON_BY_DEFAULT]: $("#onByDefault").checked
  });
}

function resetDomainSpecificSettings() {
  let currentSettings = settings.getState();
  settings.update({
    ...currentSettings,
    [DOMAIN_SPECIFIC_SETTINGS]: []
  });
}

function renderOptions() {
  let currentSettings = settings.getState();
  $("#host").value = currentSettings[HOST];
  $("#port").value = currentSettings[PORT];
  $("#user").value = currentSettings[USER];
  $("#password").value = currentSettings[PASSWORD];
  $("#onByDefault").checked = currentSettings[ON_BY_DEFAULT];
}

settings.listen(renderOptions);

function onError(e) {
  console.error(e);
}

// browser.storage.local.get().then(render, onError);

$("#save-button").addEventListener("click", () => {
  storeSettings();
});

$("#reset-button").addEventListener("click", () => {
  resetDomainSpecificSettings();
});
