import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { RotateCcw, Play, Settings } from 'lucide-react'; 
import { PROBLEM_MAPPING } from '../../problems'; 
import VisualizerRenderer from '../Workspace/VisualizerRenderer'; 
import ExecutionConsole from '../Workspace/ExecutionConsole'; 
import { usePyodide } from '../../hooks/usePyodide'; 
import { useView } from '../../context/ViewContext'; // Import View Context

const ProblemWorkspace = () => {
  const { problemId } = useParams();
  const { activeTab } = useView(); // Get active tab from Header
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Custom Visualization State
  const [showVisualInput, setShowVisualInput] = useState(false);
  const [customVisualData, setCustomVisualData] = useState(""); 

  // Engine Hooks
  const { runCode, generateTrace, loading: engineLoading } = usePyodide();
  
  const [output, setOutput] = useState(null);
  const [traceData, setTraceData] = useState([]);

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
          setTraceData([]);
          
          if (data.visualData) {
            setCustomVisualData(JSON.stringify(data.visualData, null, 2));
          }
        } catch (err) {
          console.error("Failed to load problem:", err);
        }
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemId]);

  // Update Document Title based on current problem
  useEffect(() => {
    if (problem) {
      document.title = `DSA Lens - ${problem.title}`;
    }
    
    // Cleanup: Reset title when component unmounts
    return () => {
      document.title = "DSA Lens";
    };
  }, [problem]);

  // 1. RUN CODE
  const handleRun = async () => {
    if (!problem || !problem.testCases) { alert("Test cases missing!"); return; }
    setOutput({ status: "running" });

    const { results, error } = await runCode(
        code, 
        problem.testCases, 
        problem.entryFunction, 
        problem.inputVariables
    );

    if (error) {
      setOutput({ status: "error", message: error });
    } else {
      setOutput({ status: "success", cases: results });
      // Only visualize if the panel is actually visible/supported
      if (!problem.hideLiveTrace) {
          handleVisualize(JSON.parse(customVisualData)); 
      }
    }
  };

  // 2. GENERATE TRACE
  const handleVisualize = async (dataToVisualize) => {
      if (problem.getTraceScript) {
        try {
            const script = problem.getTraceScript(dataToVisualize);
            const steps = await generateTrace(script);
            setTraceData(steps);
            setProblem(prev => ({ ...prev, visualData: dataToVisualize }));
        } catch (traceErr) {
            console.error("Trace generation failed", traceErr);
        }
      }
  };

  // 3. HANDLE CUSTOM INPUT SUBMIT
  const handleCustomSubmit = () => {
      try {
          const parsedData = JSON.parse(customVisualData);
          handleVisualize(parsedData);
          setShowVisualInput(false);
      } catch (e) {
          alert("Invalid JSON format.");
      }
  };

  const handleReset = () => {
    if (problem) {
      setCode(problem.defaultCode);
      setOutput(null);
      setTraceData([]);
    }
  };

  if (loading) return <div style={{ padding: '80px', color: 'white' }}>Loading Workspace...</div>;
  if (!problem) return <div style={{ padding: '80px', color: 'white' }}>Problem not found.</div>;

  // VIEW LOGIC
  if (activeTab === 'visualizer') {
      return (
        <div style={{ marginTop: '70px', height: 'calc(100vh - 70px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h1 className="text-3xl font-bold mb-4">Dedicated Visualizer</h1>
          <p className="text-gray-400">Complex visualization for {problem.title} will appear here.</p>
        </div>
      );
  }

  if (activeTab === 'learn') {
      return (
        <div style={{ marginTop: '70px', height: 'calc(100vh - 70px)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <h1 className="text-2xl">Learning Material for {problem.title}</h1>
        </div>
      );
  }

  // 🟢 DETERMINE IF RIGHT PANEL SHOULD SHOW
  const showRightPanel = !problem.hideLiveTrace;

  return (
    <div style={{ display: 'flex', marginTop: '75px', height: 'calc(100vh - 60px)', width: '100%', backgroundColor: '#0a0a0f', color: 'white', overflow: 'hidden' }}>
      
      {/* LEFT PANEL (Description) */}
      <aside style={{ width: '350px', borderRight: '1px solid #1f2937', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0f172a' }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1f2937' }}>
            <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>{problem.title}</h1>
            <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600',
                backgroundColor: problem.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                color: problem.difficulty === 'Easy' ? '#4ade80' : '#facc15', 
                border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)'}`
            }}>
                {problem.difficulty}
            </span>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
          <div style={{ color: '#d1d5db', lineHeight: '1.75', fontSize: '14px' }}>
            {problem.description}
          </div>
        </div>
      </aside>

      {/* MIDDLE PANEL (Editor + Console) */}
      <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'hidden', 
          // 🟢 Only show border if right panel exists
          borderRight: showRightPanel ? '1px solid #1f2937' : 'none', 
          backgroundColor: '#1e1e1e' 
      }}>
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', borderBottom: '1px solid #1f2937', overflow: 'hidden' }}>
          <div style={{ height: '50px', padding: '0 16px', backgroundColor: '#1e1e1e', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)' }}></span>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db' }}>PYTHON 3</span>
             </div>
             <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={handleReset} style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', color: '#9ca3af', border: '1px solid #374151', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                <button onClick={handleRun} disabled={engineLoading} style={{ 
                    padding: '6px 16px', fontSize: '12px', background: engineLoading ? '#374151' : 'rgba(34, 197, 94, 0.1)', 
                    color: engineLoading ? '#6b7280' : '#4ade80', border: `1px solid ${engineLoading ? 'transparent' : 'rgba(34, 197, 94, 0.5)'}`,
                    borderRadius: '4px', cursor: engineLoading ? 'not-allowed' : 'pointer', fontWeight: '600', textTransform: 'uppercase'
                }}>
                    {engineLoading ? 'Running...' : 'Run'}
                </button>
             </div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
             <Editor height="100%" width="100%" theme="vs-dark" defaultLanguage="python" value={code} onChange={(v) => setCode(v || "")} options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, padding: { top: 16 } }} />
          </div>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a0f', overflow: 'hidden' }}>
           <div style={{ padding: '8px 16px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', display: 'flex', alignItems: 'center' }}>
             <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>Output Console</span>
           </div>
           <div style={{ flex: 1, overflow: 'auto' }}>
             <ExecutionConsole output={output} />
           </div>
        </div>
      </div>

      {/* RIGHT PANEL - LIVE VISUALIZATION (Conditionally Rendered) */}
      {showRightPanel && (
          <section style={{ width: '350px', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0f172a' }}>
            <div style={{ padding: '0 16px', backgroundColor: '#111827', borderBottom: '1px solid #1f2937', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af' }}>Live Memory View</span>
              
              {/* CUSTOM INPUT TRIGGER */}
              <button 
                 onClick={() => setShowVisualInput(!showVisualInput)}
                 className={`p-1.5 rounded transition-colors ${showVisualInput ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-700 text-gray-400'}`}
                 title="Edit Inputs"
              >
                 <Settings size={16} />
              </button>
            </div>
            
            {/* CUSTOM INPUT FORM */}
            {showVisualInput && (
                <div className="p-4 bg-[#1e293b] border-b border-gray-700 flex flex-col gap-2 animate-in slide-in-from-top duration-200">
                    <label className="text-xs text-gray-400 font-bold uppercase">Custom Input (JSON)</label>
                    <textarea 
                        value={customVisualData}
                        onChange={(e) => setCustomVisualData(e.target.value)}
                        className="w-full h-24 bg-[#0f172a] border border-gray-600 rounded p-2 text-xs font-mono text-green-400 focus:outline-none focus:border-blue-500 resize-none"
                        spellCheck="false"
                    />
                    <button 
                        onClick={handleCustomSubmit}
                        className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors"
                    >
                        Visualize This Data
                    </button>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
              <VisualizerRenderer 
                traceSteps={traceData} 
                visualData={problem.visualData} 
              />
            </div>
          </section>
      )}
    </div>
  );
};

export default ProblemWorkspace;