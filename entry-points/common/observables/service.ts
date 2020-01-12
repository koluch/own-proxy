import { Subscribable } from "light-observable";

export interface WriteableObservable<T extends {}> extends Subscribable<T> {
  write: (changes: Partial<T> | ((oldState: T) => T)) => void;
}
