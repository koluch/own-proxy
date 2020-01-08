import { Subscribable } from "light-observable";
import { Tab } from "../browser";
import { createSubject } from "light-observable/observable";

export function create(): Subscribable<Tab> {
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

  browser.tabs.onActivated.addListener(update);
  browser.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (tabInfo.active && changeInfo.url) {
      update();
    }
  });
  update();

  return stream;
}

export const DEFAULT: Subscribable<Tab> = create();
