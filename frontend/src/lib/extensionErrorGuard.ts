// Web-only guard: neutralize errors thrown by browser wallet extensions
// (MetaMask etc.). These extensions inject scripts into every page and throw
// "Failed to connect to MetaMask" even on sites with zero web3 code (like ours).
// In Expo web dev, such stray errors hijack the LogBox error overlay.
// We suppress ONLY extension-originated errors; the app's own errors are untouched.
import { LogBox, Platform } from "react-native";

const NOISE =
  /metamask|ethereum|web3|failed to connect to metamask|chrome-extension:|moz-extension:/i;

function isNoise(...parts: any[]): boolean {
  return parts.some((p) => {
    if (!p) return false;
    const s =
      typeof p === "string"
        ? p
        : `${p.message || ""} ${p.stack || ""} ${p.filename || ""} ${p.sourceURL || ""}`;
    return NOISE.test(s);
  });
}

let listenersAttached = false;

export function installExtensionErrorGuard() {
  if (Platform.OS !== "web" || typeof window === "undefined") return;
  const w = window as any;

  // Wrap the property handlers LogBox installs (delegate real errors through).
  const prevOnError = w.onerror;
  w.onerror = function (message: any, source: any, lineno: any, colno: any, error: any) {
    if (isNoise(message, source, error)) return true; // handled -> suppress
    return typeof prevOnError === "function"
      ? prevOnError.call(this, message, source, lineno, colno, error)
      : false;
  };

  const prevOnRej = w.onunhandledrejection;
  w.onunhandledrejection = function (event: any) {
    const r = event && event.reason;
    if (isNoise(r, r && r.message, r && r.stack)) {
      if (event && event.preventDefault) event.preventDefault();
      return true;
    }
    return typeof prevOnRej === "function" ? prevOnRej.call(this, event) : undefined;
  };

  if (listenersAttached) return;
  listenersAttached = true;

  // Capture-phase listeners run before LogBox's and are not clobbered by import order.
  window.addEventListener(
    "error",
    (e: any) => {
      if (isNoise(e && e.message, e && e.filename, e && e.error)) {
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (e.preventDefault) e.preventDefault();
      }
    },
    true,
  );
  window.addEventListener(
    "unhandledrejection",
    (e: any) => {
      const r = e && e.reason;
      if (isNoise(r, r && r.message, r && r.stack)) {
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        if (e.preventDefault) e.preventDefault();
      }
    },
    true,
  );

  try {
    LogBox.ignoreLogs([
      /Failed to connect to MetaMask/i,
      /metamask/i,
      /chrome-extension:/i,
      /moz-extension:/i,
    ]);
  } catch {
    /* noop */
  }
}

// Run immediately on import (attaches ordering-proof capture listeners early).
installExtensionErrorGuard();
