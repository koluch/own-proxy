import { WriteableObservable } from "./service";
import { createStore, Store, Updater } from "../store";
import StorageObject = browser.storage.StorageObject;
import StorageValue = browser.storage.StorageValue;

export interface Log {
  messages: ErrorMessage[];
}

export interface ErrorMessage {
  id: string;
  text: string;
  time: number;
}

const INITIAL: Log = {
  messages: [],
};

export function create(store: Store<Log>): WriteableObservable<Log> {
  return {
    write: (newLog: Updater<Log>): void => {
      store.setState(newLog);
    },
    subscribe: (...args) => store.subscribe(...args),
  };
}

export const DEFAULT: WriteableObservable<Log> = create(
  createStore<Log>(
    "DEFAULT_LOG",
    INITIAL,
    (settings: Log): StorageObject => {
      const result: StorageObject = {};
      for (const [key, value] of Object.entries(settings)) {
        result[key] = value;
      }
      return result;
    },
    (value: StorageValue): Log => {
      if (value == null) {
        return INITIAL;
      }
      if (typeof value != "object") {
        throw new Error(`Unable to deserialize from non-object value`);
      }
      const obj = value as StorageObject;
      return {
        ...INITIAL,
        messages: (obj["messages"] || INITIAL.messages) as ErrorMessage[],
      };
    },
    "LOCAL",
  ),
);
