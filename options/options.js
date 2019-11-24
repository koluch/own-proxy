// const blockedHostsTextArea = document.querySelector("#blocked-hosts");
const inputs = document.querySelector(".param");

// Store the currently selected settings using browser.storage.local.
function storeSettings() {
  const settings = {};
  for (const input of inputs) {
    settings[input.name] = input.value;
  }
  browser.storage.local.set(settings);
}

// Update the options UI with the settings values retrieved from storage,
// or the default settings if the stored settings are empty.
function updateUI(restoredSettings) {
  for (const input of inputs) {
    input.value = restoredSettings[input.name] ||''
  }
}

function onError(e) {
  console.error(e);
}

// On opening the options page, fetch stored settings and update the UI with them.
browser.storage.local.get().then(updateUI, onError);

// Whenever the contents of the textarea changes, save the new values
blockedHostsTextArea.addEventListener("change", storeSettings);
