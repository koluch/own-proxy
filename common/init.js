window.modules = window.modules || {};
window.initModule = function(name, initF) {
  if (!window.modules[name]) {
    window.modules[name] = initF()
  } else {
    console.warn(`Module "${name}" loaded multiple times`)
  }
}
