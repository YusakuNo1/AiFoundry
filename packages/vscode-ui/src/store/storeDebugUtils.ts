export function setupDebugger(store: any) {
    // Patch for non-debug mode, create the missing globalThis.process.env
    globalThis.process = globalThis.process || {};
    globalThis.process.env = globalThis.process.env || {};
    // Check for debugging mode
    if (process.env.REACT_APP_AIF_DEBUG === "true") {
        (globalThis as any).__aifoundry__ = (globalThis as any).__aifoundry__ || {};
        (globalThis as any).__aifoundry__.store = store;
    }
}
