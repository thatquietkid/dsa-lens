import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Settings } from 'lucide-react'; 
import { PROBLEM_MAPPING } from '../../problems'; 
import VisualizerRenderer from '../Workspace/VisualizerRenderer'; 
import ExecutionConsole from '../Workspace/ExecutionConsole'; 
import { usePyodide } from '../../hooks/usePyodide'; 
import { useView } from '../../context/ViewContext';
import { transformEventTrace, transformDynamicTrace } from '../../utils/traceTransformers';

// 🟢 LINKED LIST HELPER
const LIST_NODE_HELPER = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return str(self.val)

def create_list(arr):
    if not arr: return None
    nodes = [ListNode(x) for x in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i+1]
    return nodes[0]
`;

const ProblemWorkspace = () => {
  const { problemId } = useParams();
  
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState(null);
  const [showVisualInput, setShowVisualInput] = useState(false);
  const [customVisualData, setCustomVisualData] = useState(""); 
  const [output, setOutput] = useState(null);
  const [traceData, setTraceData] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);

  const editorRef = useRef(null);
  const decorationsRef = useRef([]);

  const { runCode, generateDynamicTrace, loading: engineLoading } = usePyodide();

  // 1. Load Problem
  useEffect(() => {
    const loadProblem = async () => {
      setLoading(true);
      const importFn = PROBLEM_MAPPING[problemId];
      if (importFn) {
        try {
          const module = await importFn();
          const data = module.default;
          setProblem(data);
          setCode(data.defaultCode);
          if (data.visualData) setCustomVisualData(JSON.stringify(data.visualData, null, 2));
        } catch (err) { console.error(err); }
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemId]);

  // 2. Window Title
  useEffect(() => {
    if (problem) document.title = `DSA Lens - ${problem.title}`;
    return () => { document.title = "DSA Lens"; };
  }, [problem]);

  const handleEditorDidMount = (editor) => { editorRef.current = editor; };

  // 3. Highlight Line
  useEffect(() => {
    if (editorRef.current && currentLine && window.monaco) {
      const editor = editorRef.current;
      const newDecorations = [{
        range: new window.monaco.Range(currentLine, 1, currentLine, 1),
        options: { isWholeLine: true, className: 'active-line-highlight' },
      }];
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
    }
  }, [currentLine]);

  // 🟢 HELPER: Universal Argument Extractor (THE FIX)
  // Extracts ["s"] or ["nums", "target"] dynamically from the data object
  const getArgs = (sourceData, variables) => {
      if (!variables || !Array.isArray(variables)) return [];
      
      return variables.map(varName => {
          // 1. Direct Match
          if (sourceData[varName] !== undefined) return sourceData[varName];

          // 2. Fallback: If expecting 1 arg but source is raw value
          if (variables.length === 1 && typeof sourceData !== 'object') return sourceData;

          // 3. Common Aliases
          if (sourceData.input !== undefined) return sourceData.input;
          if (varName === 'head' && sourceData.values) return sourceData.values;
          
          return null; 
      });
  };

  // 🟢 4. HANDLE RUN (Updated)
  const handleRun = async () => {
    if (!problem) return;
    setOutput({ status: "running" });

    let entryFunc = problem.entryFunction;
    const functionMatch = code.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
    if (functionMatch && functionMatch[1]) entryFunc = functionMatch[1];

    let codeToRun = code;
    let entryToRun = entryFunc;

    // Detect Linked List Mode
    const isList = problem.type === 'linked-list';

    if (isList) {
        const LIST_WRAPPERS = `
${LIST_NODE_HELPER}

def list_to_array(head):
    arr = []
    curr = head
    while curr:
        arr.append(curr.val)
        curr = curr.next
    return arr

def test_wrapper(arr):
    if arr is None: arr = []
    if not isinstance(arr, list): arr = [] 
    head = create_list(arr)
    result_head = ${entryFunc}(head)
    return list_to_array(result_head)
`;
        codeToRun = `${code}\n\n${LIST_WRAPPERS}`;
        entryToRun = "test_wrapper";
    }

    // 🟢 Prepare Test Cases (Dynamic)
    const testCasesToRun = problem.testCases.map(tc => {
        let args = [];
        if (isList) {
            // Special handling for lists (single arg wrapper)
            args = [tc.head || tc.values || tc.input || tc.arr || []];
        } else {
            // Universal handling for everything else (stack, array, etc.)
            args = getArgs(tc, problem.inputVariables);
        }
        return { ...tc, args };
    });

    console.log(`🚀 Running ${problem.title}`, testCasesToRun[0].args);

    const { results, error } = await runCode(codeToRun, testCasesToRun, entryToRun, problem.inputVariables);
    
    if (error) {
        setOutput({ status: "error", message: error });
    } else {
        setOutput({ status: "success", cases: results });
        // Auto-visualize first case on success
        let inputData = problem.visualData;
        try { inputData = JSON.parse(customVisualData); } catch(e) {}
        handleVisualize(inputData);
    }
  };

  // 🟢 5. HANDLE VISUALIZE (Updated)
  const handleVisualize = async (dataToVisualize) => {
    setIsVisualizing(true);
    setTraceData([]);
    setCurrentLine(0);

    try {
      const isList = problem.type === 'linked-list';
      
      // A. Function Detection
      let entryFunc = problem.entryFunction;
      const functionMatch = code.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
      if (functionMatch && functionMatch[1]) entryFunc = functionMatch[1];

      // B. Prepare Wrapper
      let fullCode = code;
      if (isList) {
          fullCode = `${LIST_NODE_HELPER}\n${code}\n\ndef dynamic_entry(arr):\n    h = create_list(arr)\n    ${entryFunc}(h)`;
          entryFunc = "dynamic_entry";
      }

      // 🟢 C. Prepare Args (THE FIX)
      let inputArgs = [];
      if (isList) {
          inputArgs = [dataToVisualize.values || dataToVisualize.nums || dataToVisualize.head || []];
      } else {
    // 🟢 UNIVERSAL LOGIC: This allows { "s": "..." } to work!
    // It maps the keys defined in your problem config (["s"]) to the data you pasted
    inputArgs = problem.inputVariables.map(variableName => {
        // 1. Check if the key exists directly (e.g. dataToVisualize.s)
        if (dataToVisualize[variableName] !== undefined) {
            return dataToVisualize[variableName];
        }
        // 2. Fallback for "Two Sum" legacy style (e.g. dataToVisualize.nums)
        if (variableName === 'nums') return dataToVisualize.nums || [];
        if (variableName === 'target') return dataToVisualize.target || 0;
        
        return null;
    });
}
      
      console.log("🚀 Visualizing Args:", inputArgs);

      // D. Execute
      const raw = await generateDynamicTrace(fullCode, entryFunc, inputArgs);
      
      // E. Transform
      const isEventStream = raw[0] && (raw[0].event !== undefined);
      let steps = [];
      
      if (isEventStream) {
          steps = transformEventTrace(raw);
      } else {
          steps = transformDynamicTrace(raw, problem.type);
      }

      if (steps && steps.length > 0) {
        setTraceData(steps);
        if (steps[0]) setCurrentLine(steps[0].line);
      }

    } catch (error) {
      console.error("Visualizer Error:", error);
    } finally {
      setIsVisualizing(false);
    }
  };

  if (loading) return <div style={{ padding: '80px', color: 'white' }}>Loading...</div>;
  if (!problem) return <div style={{ padding: '80px', color: 'white' }}>Not found.</div>;

  const showRightPanel = !problem.hideLiveTrace;

  return (
    <div style={{ display: 'flex', marginTop: '75px', height: 'calc(100vh - 60px)', width: '100%', backgroundColor: '#0a0a0f', color: 'white', overflow: 'hidden' }}>
      
      {/* LEFT PANEL */}
      <aside style={{ width: '350px', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0f172a' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1f2937' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{problem.title}</h1>
            <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.2)' }}>{problem.difficulty}</span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px', color: '#d1d5db', fontSize: '14px' }}>{problem.description}</div>
      </aside>

      {/* MIDDLE PANEL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: showRightPanel ? '1px solid #1f2937' : 'none', backgroundColor: '#1e1e1e' }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: showRightPanel ? '1px solid #1f2937' : 'none', backgroundColor: '#1e1e1e' }}>
          <div style={{ height: '50px', padding: '0 16px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <span style={{ fontSize: '12px', color: '#9ca3af' }}>PYTHON 3</span>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleRun} disabled={engineLoading} style={{ padding: '6px 16px', fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.5)', borderRadius: '4px', cursor: 'pointer' }}>
                    {engineLoading ? 'RUNNING...' : 'RUN'}
                </button>
             </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
             <Editor height="100%" theme="vs-dark" defaultLanguage="python" value={code} onMount={handleEditorDidMount} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 14 }} />
          </div>
        </div>
        <div style={{ flex: 1, backgroundColor: '#0a0a0f', overflow: 'hidden' }}>
           <ExecutionConsole output={output} />
        </div>
      </div>

      {/* RIGHT PANEL */}
      {showRightPanel && (
        <section style={{ width: '450px', display: 'flex', flexDirection: 'column', backgroundColor: '#0f172a', flexShrink: 0 }}>
            <div style={{ padding: '0 16px', height: '50px', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '14px', color: '#9ca3af' }}>Live Memory View</span>
              <Settings size={16} onClick={() => setShowVisualInput(!showVisualInput)} style={{ cursor: 'pointer' }} />
            </div>
            {showVisualInput && (
              <div style={{ padding: '16px', borderBottom: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea value={customVisualData} onChange={(e) => setCustomVisualData(e.target.value)} style={{ width: '100%', height: '80px', backgroundColor: '#0a0a0f', color: '#4ade80', fontSize: '12px', padding: '8px' }} />
                <button onClick={() => handleVisualize(JSON.parse(customVisualData))} style={{ backgroundColor: '#2563eb', color: 'white', padding: '6px', fontSize: '12px' }}>Update Data</button>
              </div>
            )}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
              <VisualizerRenderer traceSteps={traceData} visualData={problem.visualData} onStepChange={(line) => setCurrentLine(line)} />
            </div>
        </section>
      )}
    </div>
  );
};

export default ProblemWorkspace;