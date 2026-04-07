/**
 * Defers the Three.js bundle until after window `load` + idle time so LCP and
 * main-thread work for critical content finish first. Skips WebGL when users
 * opt out of motion or enable data-saver.
 */
function shouldSkipWebGL(): boolean {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return true;
  }
  const conn = (
    navigator as Navigator & { connection?: { saveData?: boolean } }
  ).connection;
  if (conn?.saveData) {
    return true;
  }
  return false;
}

function loadThree(): void {
  const run = (): void => {
    void import("./three");
  };
  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 4000 });
  } else {
    setTimeout(run, 1);
  }
}

function start(): void {
  if (shouldSkipWebGL()) {
    return;
  }
  loadThree();
}

if (document.readyState === "complete") {
  start();
} else {
  window.addEventListener("load", start, { once: true });
}
