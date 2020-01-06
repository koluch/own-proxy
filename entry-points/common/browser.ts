import BrowserTab = browser.tabs.Tab;

export type Tab = BrowserTab;

export async function getActiveTab(): Promise<Tab> {
  const tabs = await browser.tabs.query({ currentWindow: true, active: true });
  if (tabs.length > 0) {
    return tabs[0];
  } else {
    throw new Error("There are no tabs in current window");
  }
}

export type Theme = "LIGHT" | "DARK";
export function getTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "DARK"
    : "LIGHT";
}
