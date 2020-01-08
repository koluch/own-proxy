import { Subscribable } from "light-observable";

export interface WriteableObservable<T extends {}> extends Subscribable<T> {
  write: (changes: Partial<T>) => void;
}
