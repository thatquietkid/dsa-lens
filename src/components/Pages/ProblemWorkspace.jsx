import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { PROBLEM_MAPPING } from '../../problems'; 
import VisualizerRenderer from '../Workspace/VisualizerRenderer'; 
import ExecutionConsole from '../Workspace/ExecutionConsole'; 
import { usePyodide } from '../../hooks/usePyodide'; 

const ProblemWorkspace = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const { runCode, loading: engineLoading } = usePyodide();
  const [output, setOutput] = useState(null);

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
        } catch (err) {
          console.error("Failed to load problem:", err);
        }
      } else {
        console.error(`No problem found for ID: ${problemId}`);
      }
      setLoading(false);
    };
    loadProblem();
  }, [problemId]);

  const handleRun = async () => {
    if (!problem || !problem.testCases) {
      alert("Test cases missing!");
      return;
    }
    setOutput({ status: "running" });
    const { results, error } = await runCode(code, problem.testCases);
    
    if (error) {
      setOutput({ status: "error", message: error });
    } else {
      setOutput({ status: "success", cases: results });
    }
  };

  const handleReset = () => {
    if (problem) {
      setCode(problem.defaultCode);
      setOutput(null);
    }
  };

  if (loading) return <div style={{ padding: '80px', color: 'white' }}>Loading Workspace...</div>;
  if (!problem) return <div style={{ padding: '80px', color: 'white' }}>Problem not found.</div>;

  return (
    <div style={{ 
      display: 'flex', 
      marginTop: '80px', 
      height: 'calc(100vh - 60px)', 
      width: '100%',
      backgroundColor: '#0a0a0f', 
      color: 'white',
      overflow: 'hidden'
    }}>
      {/* Left Panel - Problem Description */}
      <aside style={{ 
        width: '350px', 
        borderRight: '1px solid #1f2937',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #1f2937' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>
            {problem.title}
          </h1>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: problem.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.1)' : 
                             problem.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: problem.difficulty === 'Easy' ? '#4ade80' :
                   problem.difficulty === 'Medium' ? '#facc15' : '#f87171',
            border: `1px solid ${problem.difficulty === 'Easy' ? 'rgba(34, 197, 94, 0.2)' : 
                                 problem.difficulty === 'Medium' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
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

      {/* Middle Panel - Code Editor + Console */}
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: '1px solid #1f2937',
        backgroundColor: '#1e1e1e'
      }}>
        {/* Editor Section */}
        {/* CHANGED flex: 3 -> flex: 2 to give Console more space */}
        <div style={{ 
          flex: 2, 
          display: 'flex', 
          flexDirection: 'column',
          borderBottom: '1px solid #1f2937',
          overflow: 'hidden'
        }}>
          {/* Toolbar */}
          <div style={{ 
            height: '50px',
            padding: '0 16px',
            backgroundColor: '#1e1e1e',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#60a5fa', boxShadow: '0 0 8px rgba(96,165,250,0.6)' }}></span>
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#d1d5db', letterSpacing: '0.05em' }}>PYTHON 3</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleReset}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                  border: '1px solid #374151',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                Reset
              </button>
              
              <button
                onClick={handleRun}
                disabled={engineLoading}
                style={{
                  padding: '6px 16px',
                  fontSize: '12px',
                  backgroundColor: engineLoading ? '#374151' : 'rgba(34, 197, 94, 0.1)',
                  color: engineLoading ? '#6b7280' : '#4ade80',
                  border: `1px solid ${engineLoading ? 'transparent' : 'rgba(34, 197, 94, 0.5)'}`,
                  borderRadius: '4px',
                  cursor: engineLoading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  textTransform: 'uppercase'
                }}
              >
                {engineLoading ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                    Running...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Run
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
            <Editor 
              height="100%" 
              width="100%"
              theme="vs-dark" 
              defaultLanguage="python" 
              value={code} 
              onChange={(value) => setCode(value || "")}
              options={{ 
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 16 }
              }}
            />
          </div>
        </div>

        {/* Console Section */}
        {/* Kept flex: 1, so ratio is now 2:1 instead of 3:1 */}
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#0a0a0f',
          overflow: 'hidden'
        }}>
          <div style={{ 
            padding: '8px 16px',
            backgroundColor: '#111827',
            borderBottom: '1px solid #1f2937',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" style={{ marginRight: '8px' }}><path d="m9 18 6-6-6-6"/></svg>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase' }}>
              Output Console
            </span>
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ExecutionConsole output={output} />
          </div>
        </div>
      </div>

      {/* Right Panel - Visualization */}
      <section style={{ 
        width: '350px', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ 
          padding: '12px 16px',
          backgroundColor: '#111827',
          borderBottom: '1px solid #1f2937',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#9ca3af' }}>
            Live Memory View
          </span>
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <VisualizerRenderer 
            problemId={problemId} 
            visualData={problem.visualData} 
          />
        </div>
      </section>
    </div>
  );
};

export default ProblemWorkspace;