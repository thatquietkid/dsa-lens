import { useState, useEffect } from 'react';

export const usePyodide = () => {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPyodide = async () => {
      if (window.pyodideInstance) {
        setPyodide(window.pyodideInstance);
        setLoading(false);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          const pyodideInstance = await window.loadPyodide({
            stdout: (text) => console.log("🐍 Output:", text),
            stderr: (text) => console.error("🐍 Error:", text),
          });
          window.pyodideInstance = pyodideInstance;
          setPyodide(pyodideInstance);
          setLoading(false);
        };
      } catch (err) {
        console.error("Failed to load Pyodide", err);
        setLoading(false);
      }
    };

    loadPyodide();
  }, []);
  
  // 1. GENERIC RUN CODE
  const runCode = async (userCode, testCases, entryFunction, inputVars) => {
    if (!pyodide) return { error: "Engine loading..." };
    const results = [];

    try {
      await pyodide.runPythonAsync(userCode);

      for (const [index, test] of testCases.entries()) {
        
        // 🟢 FIX: Don't trim individual lines! 
        // We must preserve the relative indentation (e.g. inside classes)
        const indentedInput = test.input
            .split('\n')
            .map(line => `        ${line}`) // Just add 8 spaces padding
            .join('\n');
        
        // Construct dynamic function call
        const callArgs = inputVars.join(", ");

        const harness = `
import json
def run_test():
    try:
${indentedInput}
        # Dynamic Call
        result = ${entryFunction}(${callArgs})
        
        # Compare
        expected = ${test.expected}
        passed = str(result) == str(expected) # String comparison for safety
        
        # Return result
        # Note: We use str(result) to handle objects like LinkedLists safely in JSON
        return json.dumps({ "passed": passed, "output": str(result), "expected": str(expected) })
    except Exception as e:
        return json.dumps({ "passed": False, "error": str(e) })
run_test()
`;
        const rawResult = await pyodide.runPythonAsync(harness);
        results.push({ ...JSON.parse(rawResult), input: test.input });
      }
      return { results };
    } catch (err) {
      return { error: err.message };
    }
  };

  // 2. GENERIC TRACE GENERATOR
  const generateTrace = async (traceScript) => {
    if (!pyodide || !traceScript) return [];

    try {
      const rawTrace = await pyodide.runPythonAsync(traceScript);
      return JSON.parse(rawTrace);
    } catch (err) {
      console.error("Trace Generation Failed:", err);
      return [];
    }
  };

  return { runCode, generateTrace, loading };
};