// src/utils/pyodideManager.js

let pyodideInstance = null;
let initializationPromise = null;

export const getPyodide = async () => {
  // 1. If already ready, return immediately (Instant Cache)
  if (pyodideInstance) {
    return pyodideInstance;
  }

  // 2. If currently loading, return the existing promise (Prevent double-loading)
  if (initializationPromise) {
    return initializationPromise;
  }

  // 3. Start loading fresh
  initializationPromise = (async () => {
    try {
      console.log("🐍 Booting Pyodide Singleton...");
      
      if (!window.loadPyodide) {
          throw new Error("Pyodide script not found in index.html");
      }

      const py = await window.loadPyodide({
        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
      });
      
      await py.loadPackage("micropip");
      
      console.log("✅ Pyodide Ready & Cached!");
      pyodideInstance = py;
      return py;
    } catch (err) {
      console.error("❌ Pyodide Failed:", err);
      initializationPromise = null; // Reset so we can try again
      throw err;
    }
  })();

  return initializationPromise;
};