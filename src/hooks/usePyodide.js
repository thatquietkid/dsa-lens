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
        console.log("Loading Pyodide script...");
        const script = document.createElement('script');
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = async () => {
          console.log("Initializing Pyodide...");
          
          // 🟢 DEBUG FIX 1: Capture stdout/stderr
          // This allows Python print() statements to show in Chrome Console
          const pyodideInstance = await window.loadPyodide({
            stdout: (text) => console.log("🐍 Python Output:", text),
            stderr: (text) => console.error("🐍 Python Error:", text),
          });
          
          window.pyodideInstance = pyodideInstance;
          setPyodide(pyodideInstance);
          setLoading(false);
          console.log("Pyodide Ready!");
        };
      } catch (err) {
        console.error("Failed to load Pyodide", err);
        setLoading(false);
      }
    };

    loadPyodide();
  }, []);
  
  const runCode = async (userCode, testCases) => {
    if (!pyodide) return { error: "Engine loading..." };

    const results = [];

    try {
      // 1. Load User Code Globally
      console.log("--- Loading User Code ---");
      console.log(userCode);
      await pyodide.runPythonAsync(userCode);

      // 2. Run Test Cases
      for (const [index, test] of testCases.entries()) {
        
        const indentedInput = test.input
            .trim()
            .split('\n')
            .map(line => `        ${line.trim()}`) 
            .join('\n');

        const harness = `
import json

def run_test():
    try:
# --- INJECTED INPUTS START ---
${indentedInput}
# --- INJECTED INPUTS END ---
        
        # Run Function
        result = twoSum(nums, target)
        
        # Check Result
        expected = ${test.expected}
        passed = result == expected
        
        return json.dumps({
            "passed": passed,
            "output": result,
            "expected": expected
        })
    except Exception as e:
        return json.dumps({
            "passed": False,
            "error": str(e)
        })

run_test()
`;

        // 🟢 DEBUG FIX 2: Log the constructed Python script
        // This lets you see exactly what is being sent to the engine
        console.groupCollapsed(`Test Case ${index + 1} Execution`);
        console.log("Generated Harness Code:\n", harness);

        // Run the harness
        const rawResult = await pyodide.runPythonAsync(harness);
        
        console.log("Raw JSON Result from Python:", rawResult);
        console.groupEnd();
        
        // Parse Result Safely
        try {
            const resultJson = JSON.parse(rawResult);
            results.push({ ...resultJson, input: test.input });
        } catch (jsonErr) {
            console.error("JSON Parse Error:", jsonErr);
            results.push({ 
                passed: false, 
                input: test.input,
                error: "System Error: Invalid JSON output. " + rawResult
            });
        }
      }

      return { results };

    } catch (err) {
      console.error("Execution Critical Error:", err);
      return { error: err.message };
    }
  };

  return { runCode, loading };
};