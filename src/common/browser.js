export function getDomain() {
  return browser.tabs
    .query({ currentWindow: true, active: true })
    .then(tabs => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        const url = new URL(tab.url);
        return url.host;
      } else {
        throw new Error("There are no tabs in current window");
      }
    });
}
