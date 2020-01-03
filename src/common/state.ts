import { createStore } from "./store.js";

const IS_ENABLED = "isEnabled";

export default createStore("SETTINGS", {
  [IS_ENABLED]: false,
});
