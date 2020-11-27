import StorageValue = browser.storage.StorageValue;
import { Subscribable, Subscription } from "light-observable";
import { createSubject } from "light-observable/observable";

export type Updater<T> = Partial<T> | ((oldState: T) => T);

export interface Store<T> extends Subscribable<T> {
  setState: (updater: Updater<T>) => void;
  getState: () => T;
}

export function createStore<T>(
  storageKey: string,
  initial: T,
  serialize: (value: T) => StorageValue,
  deserialize: (object: StorageValue) => T,
  type: "SYNC" | "LOCAL",
): Store<T> {
  const [stream, sink] = createSubject<T>({ initial });

  const storage =
    type === "SYNC" ? browser.storage.sync : browser.storage.local;

  storage.get([storageKey]).then(data => {
    const item: StorageValue = data[storageKey];
    sink.next(item != null ? deserialize(item) : initial);
  });

  // browser.runtime.onInstalled.addListener(details => {
  //   storage.set({
  //     [storageKey]: serialize(initial),
  //   });
  // });

  browser.storage.onChanged.addListener(changeData => {
    if (storageKey in changeData) {
      sink.next(changeData[storageKey].newValue);
    }
  });

  let currentValue = initial;
  stream.subscribe(next => {
    currentValue = next;
  });

  return {
    subscribe(...args): Subscription {
      return stream.subscribe(...args);
    },
    setState: (updater: Partial<T> | ((oldState: T) => T)) => {
      const newState =
        updater instanceof Function
          ? updater(currentValue)
          : { ...currentValue, ...updater };
      storage
        .set({
          [storageKey]: serialize(newState),
        })
        .then(() => {
          sink.next(newState);
        })
        .catch(e => {
          sink.error(e.message);
        });
    },
    getState: () => currentValue,
  };
}
