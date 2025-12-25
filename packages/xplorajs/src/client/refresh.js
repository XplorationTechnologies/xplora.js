import * as RefreshRuntime from "https://esm.sh/react-refresh@0.17.0/runtime";

if (window.process?.env?.NODE_ENV === "development") {
  console.log("Fast refresh runtime loaded in development mode");
}

RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (t) => t;
