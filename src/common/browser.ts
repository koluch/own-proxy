export function getDomain(): Promise<string | null> {
  return browser.tabs
    .query({ currentWindow: true, active: true })
    .then(tabs => {
      if (tabs.length > 0) {
        const tab = tabs[0];
        if (tab.url != null) {
          try {
            return new URL(tab.url).host;
          } catch (e) {
            console.warn(
              `Unable to parse domain from current tab: ${e.message}`,
            );
          }
        }
        return null;
      } else {
        throw new Error("There are no tabs in current window");
      }
    });
}

export type Theme = "LIGHT" | "DARK";
export function getTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "DARK"
    : "LIGHT";
}
