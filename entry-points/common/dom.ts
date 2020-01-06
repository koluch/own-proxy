// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $(selector: string): any {
  //todo: fix
  const result = document.querySelector(selector);
  if (result == null) {
    throw new Error(`Unable to find element by selector: "${selector}"`);
  }
  return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function $$(selector: string): any[] {
  return [...document.querySelectorAll(selector)];
}
