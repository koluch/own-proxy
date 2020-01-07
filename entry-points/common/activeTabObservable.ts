import BrowserTab = browser.tabs.Tab;
import { createSubject } from "light-observable/observable";

export type Tab = BrowserTab;

const [stream, sink] = createSubject<Tab>();

function update(): void {
  browser.tabs
    .query({ currentWindow: true, active: true })
    .then(tabs => {
      if (tabs.length > 0) {
        sink.next(tabs[0]);
      } else {
        sink.error("There are no tabs in current window");
      }
    })
    .catch(e => {
      sink.error(sink.error(e.message));
    });
}

browser.runtime.onInstalled.addListener(update);
browser.tabs.onActivated.addListener(update);
browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  if (tabInfo.active && changeInfo.url) {
    update();
  }
});

export default stream;
