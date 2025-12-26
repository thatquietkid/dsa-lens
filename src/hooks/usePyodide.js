import { useState, useEffect } from 'react';

// 🟢 GLOBAL CACHE (Singleton Pattern)
// Lives outside the hook so it persists across page navigations
let pyodideGlobalPromise = null;

// 🟢 SAFE AST INSTRUMENTER
const AST_INSTRUMENTER_SCRIPT = `
import ast, json, sys

TRACE_LOG = []

def serialize(val):
    try:
        if val is None: return None
        if isinstance(val, (bool, int, float, str)): return val
        if isinstance(val, list): return [serialize(x) for x in val]
        if isinstance(val, dict): return {str(k): serialize(v) for k, v in val.items()}
        if hasattr(val, '__dict__'):
            return {
                'type': 'object',
                'class': type(val).__name__,
                'id': id(val),
                'data': {k: serialize(v) for k, v in val.__dict__.items()}
            }
        return str(val)
    except:
        return "<unserializable>"

def record_event(ev, tgt, val, line):
    try:
        safe_val = serialize(val)
        TRACE_LOG.append({
            "event": ev, 
            "target": tgt, 
            "value": safe_val, 
            "type": type(val).__name__, 
            "line": line
        })
    except:
        pass
    return val

class Instrumenter(ast.NodeTransformer):
    def visit_FunctionDef(self, node):
        injected_logs = []
        for arg in node.args.args:
            arg_name = arg.arg
            if arg_name == 'self': continue
            log_call = ast.Expr(
                value=ast.Call(
                    func=ast.Name(id='record_event', ctx=ast.Load()), 
                    args=[ast.Constant(value='ASSIGN'), ast.Constant(value=arg_name), ast.Name(id=arg_name, ctx=ast.Load()), ast.Constant(value=node.lineno)], 
                    keywords=[]
                )
            )
            injected_logs.append(log_call)
        node.body = injected_logs + node.body
        self.generic_visit(node)
        return node

    def visit_Assign(self, node):
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            tgt = node.targets[0].id
            new_node = ast.Assign(
                targets=node.targets, 
                value=ast.Call(
                    func=ast.Name(id='record_event', ctx=ast.Load()), 
                    args=[ast.Constant(value='ASSIGN'), ast.Constant(value=tgt), node.value, ast.Constant(value=node.lineno)], 
                    keywords=[]
                )
            )
            ast.copy_location(new_node, node)
            return new_node
        return node

    def visit_Expr(self, node):
        if isinstance(node.value, ast.Call) and isinstance(node.value.func, ast.Attribute):
            func_name = node.value.func.attr
            if func_name in ['append', 'pop', 'remove', 'insert', 'add', 'sort', 'reverse']:
                if isinstance(node.value.func.value, ast.Name):
                    target_id = node.value.func.value.id
                    log_call = ast.Expr(
                        value=ast.Call(
                            func=ast.Name(id='record_event', ctx=ast.Load()), 
                            args=[ast.Constant(value='MUTATE'), ast.Constant(value=target_id), ast.Name(id=target_id, ctx=ast.Load()), ast.Constant(value=node.lineno)], 
                            keywords=[]
                        )
                    )
                    return [node, log_call]
        return node

    def visit_For(self, node):
        target_names = []
        if isinstance(node.target, ast.Name): target_names.append(node.target.id)
        elif isinstance(node.target, ast.Tuple):
            for t in node.target.elts:
                if isinstance(t, ast.Name): target_names.append(t.id)
        injected_logs = []
        for name in target_names:
            log_call = ast.Expr(
                value=ast.Call(
                    func=ast.Name(id='record_event', ctx=ast.Load()), 
                    args=[ast.Constant(value='ASSIGN'), ast.Constant(value=name), ast.Name(id=name, ctx=ast.Load()), ast.Constant(value=node.lineno)], 
                    keywords=[]
                )
            )
            injected_logs.append(log_call)
        node.body = injected_logs + node.body
        self.generic_visit(node)
        return node
    
    def visit_Return(self, node):
        if node.value:
            node.value = ast.Call(
                func=ast.Name(id='record_event', ctx=ast.Load()), 
                args=[ast.Constant(value='RETURN'), ast.Constant(value='result'), node.value, ast.Constant(value=node.lineno)], 
                keywords=[]
            )
        return node

def run_instrumented(code, entry, args):
    global TRACE_LOG
    TRACE_LOG = []
    try:
        tree = ast.parse(code)
        modified = Instrumenter().visit(tree)
        ast.fix_missing_locations(modified)
        exec(compile(modified, "<string>", "exec"), globals())
        if entry in globals(): 
            globals()[entry](*args)
        return json.dumps(TRACE_LOG)
    except Exception as e:
        return json.dumps([{"event": "ERROR", "message": str(e)}])
`;

// 🟢 HELPER: Initialize Pyodide Only Once
const loadPyodideOnce = () => {
    if (pyodideGlobalPromise) return pyodideGlobalPromise;

    pyodideGlobalPromise = (async () => {
        try {
            if (!window.loadPyodide) {
                throw new Error("Pyodide script not detected in index.html");
            }
            console.log("🐍 Booting Pyodide...");
            // Ensure version matches your CDN link
            const pyInstance = await window.loadPyodide({
                indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/" 
            });
            await pyInstance.loadPackage("micropip");
            console.log("✅ Pyodide Ready!");
            return pyInstance;
        } catch (err) {
            console.error("Pyodide Load Failed:", err);
            pyodideGlobalPromise = null; // Reset so we can try again
            throw err;
        }
    })();

    return pyodideGlobalPromise;
};

// 🟢 THE HOOK
export const usePyodide = () => {
  const [pyodide, setPyodide] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
        try {
            const py = await loadPyodideOnce();
            if (mounted) {
                setPyodide(py);
                setLoading(false);
            }
        } catch (e) {
            if (mounted) setLoading(false);
        }
    };

    init();

    return () => { mounted = false; };
  }, []);

  const runCode = async (code, testCases, entryFunction, inputVariables) => {
    if (!pyodide) return { results: [], error: "Engine not ready" };
    
    const wrapper = `
import json
def run_tests(entry_func, test_cases):
    results = []
    for case in test_cases:
        try:
            if 'args' in case:
                args = case['args']
            else:
                args = [case.get(v) for v in ${JSON.stringify(inputVariables)}]

            expected = case.get('expected')
            actual = entry_func(*args)
            passed = str(actual) == str(expected)
            results.append({"input": case, "expected": expected, "actual": actual, "passed": passed})
        except Exception as e:
            results.append({"input": case, "error": str(e), "passed": False})
    return json.dumps(results)
`;

    try {
      await pyodide.runPythonAsync(code);
      await pyodide.runPythonAsync(wrapper);
      
      pyodide.globals.set("py_test_cases", JSON.stringify(testCases));
      const resultJson = await pyodide.runPythonAsync(`run_tests(${entryFunction}, json.loads(py_test_cases))`);
      
      return { results: JSON.parse(resultJson), error: null };
    } catch (err) {
      return { results: [], error: String(err) };
    }
  };

  const generateDynamicTrace = async (userCode, entryFunction, inputData) => {
    if (!pyodide) return [];
    try {
      await pyodide.runPythonAsync(AST_INSTRUMENTER_SCRIPT);
      
      pyodide.globals.set("py_user_code", userCode);
      pyodide.globals.set("py_entry_func", entryFunction);
      pyodide.globals.set("py_input_args_str", JSON.stringify(inputData));

      const rawResult = await pyodide.runPythonAsync(`
        import json
        args = json.loads(py_input_args_str)
        run_instrumented(py_user_code, py_entry_func, args)
      `);
      
      return JSON.parse(rawResult);
    } catch (err) {
      console.error("Trace Generation Failed:", err);
      return [{ event: "ERROR", message: String(err) }];
    }
  };

  return { 
    loading, 
    runCode, 
    generateDynamicTrace 
  };
};