import * as settingsService from "./observables/settings";
import { m, Message, p } from "./uiMessages";
import StringDelta = browser.downloads.StringDelta;

export type Dict<K extends string, T> = { [P in K]: T };
export type DictOpt<K extends string, T> = { [P in K]?: T };

export function isProxyEnabledForDomain(
  settings: settingsService.Settings,
  domain: string | null,
): [boolean, Message<"isEnabled">] {
  if (domain == null) {
    return [
      false,
      m`Proxy is ${p(
        "isEnabled",
      )}, because this tab doesn't have domain in it's address`,
    ];
  }
  const domainSettings = settings.domainSettings[domain];
  if (domainSettings != null) {
    if (domainSettings.useProxy === "NEVER") {
      return [
        false,
        m`Proxy is ${p(
          "isEnabled",
        )}, because you chose to never use it for this domain`,
      ];
    }
    if (domainSettings.useProxy === "ALWAYS") {
      return [
        true,
        m`Proxy is ${p(
          "isEnabled",
        )}, because you chose to always use it for this domain`,
      ];
    }
  }
  return settings.onByDefault
    ? [true, m`Proxy is ${p("isEnabled")}, because it's enabled by default`]
    : [false, m`Proxy is ${p("isEnabled")}, because it's disabled by default`];
}

export function getUrlDomain(url: string): string | null {
  try {
    return new URL(url).host || null;
  } catch (e) {
    console.warn(`Unable to parse domain from current tab: ${e.message}`);
  }
  return null;
}

// Suppress, because this function work for any structure, it's impossible to define type for it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEqual<T>(value: any, other: any): boolean {
  if (value === other) {
    return true;
  }

  // Get the value type
  const type = Object.prototype.toString.call(value);

  // If the two objects are not the same type, return false
  if (type !== Object.prototype.toString.call(other)) return false;

  // If items are not an object or array, return false
  if (["[object Array]", "[object Object]"].indexOf(type) < 0) return false;

  // Compare the length of the length of the two items
  const valueLen =
    type === "[object Array]" ? value.length : Object.keys(value).length;
  const otherLen =
    type === "[object Array]" ? other.length : Object.keys(other).length;
  if (valueLen !== otherLen) return false;

  // Compare two items
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function compare(item1: any, item2: any): boolean {
    // Get the object type
    const itemType = Object.prototype.toString.call(item1);

    // If an object or array, compare recursively
    if (["[object Array]", "[object Object]"].indexOf(itemType) >= 0) {
      return isEqual(item1, item2);
    }

    // Otherwise, do a simple comparison

    // If the two items are not the same type, return false
    if (itemType !== Object.prototype.toString.call(item2)) return false;

    // Else if it's a function, convert to a string and compare
    if (itemType === "[object Function]") {
      return item1.toString() === item2.toString();
    }

    // Otherwise, just compare
    return item1 === item2;
  }

  // Compare properties
  if (type === "[object Array]") {
    for (let i = 0; i < valueLen; i++) {
      if (!compare(value[i], other[i])) return false;
    }
  } else {
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        if (!compare(value[key], other[key])) return false;
      }
    }
  }

  // If nothing failed, return true
  return true;
}

export async function downloadFile(
  data: string,
  fileName: string,
): Promise<void> {
  const blob = new Blob([data], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  try {
    const id = await browser.downloads.download({
      url: url,
      filename: fileName,
      saveAs: true,
    });
    await new Promise(resolve => {
      const listener = (delta: {
        id: number;
        url?: StringDelta;
        state?: StringDelta;
        filename?: StringDelta;
      }): void => {
        if (
          delta.id === id &&
          delta.state &&
          delta.state.previous === "in_progress" &&
          delta.state.current === "complete"
        ) {
          URL.revokeObjectURL(url);
          browser.downloads.onChanged.removeListener(listener);
          resolve();
        }
      };
      browser.downloads.onChanged.addListener(listener);
    });
  } catch (e) {
    console.log(`Error while downloading export file: ${e.message}`);
    URL.revokeObjectURL(url);
  }
}

export async function uploadFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = () => {
      try {
        if (typeof fileReader.result === "string") {
          resolve(fileReader.result);
        }
      } catch (err) {
        reject(err);
      }
    };
    fileReader.onerror = e => {
      reject(e);
    };
    fileReader.readAsText(file);
  });
}
