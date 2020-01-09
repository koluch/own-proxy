import StorageValue = browser.storage.StorageValue;
import {
  PartialObserver,
  Subscribable,
  Subscription,
  SubscriptionObserver,
} from "light-observable";
import { createSubject } from "light-observable/observable";

export interface Store<T> extends SubscriptionObserver<T>, Subscribable<T> {
  getState: () => T;
}

export function createStore<T>(
  storageKey: string,
  initial: T,
  serialize: (value: T) => StorageValue,
  deserialize: (object: StorageValue) => T,
): Store<T> {
  const [stream, sink] = createSubject<T>({ initial });

  browser.storage.local.get([storageKey]).then(data => {
    const item: StorageValue = data[storageKey];
    const deserialize1 = deserialize(item);
    sink.next(item != null ? deserialize1 : initial);
  });

  browser.runtime.onInstalled.addListener(details => {
    browser.storage.local.set({
      [storageKey]: serialize(initial),
    });
  });

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
    subscribe(
      next?: PartialObserver<T> | (<T>(value: T) => void),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      error?: (reason: any) => void,
      complete?: () => void,
    ): Subscription {
      return stream.subscribe(next, error, complete);
    },
    next: (newState: T) => {
      browser.storage.local
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
    error: reason => sink.error(reason),
    complete: () => sink.complete(),
    getState: () => currentValue,
  };
}
