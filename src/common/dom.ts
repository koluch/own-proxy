export function $(selector: string): any {
  //todo: fix
  const result = document.querySelector(selector);
  if (result == null) {
    throw new Error(`Unable to find element by selector: "${selector}"`);
  }
  return result;
}

export function $$(selector: string) {
  return [...document.querySelectorAll(selector)];
}
