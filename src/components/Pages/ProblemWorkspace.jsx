// src/components/Pages/ProblemWorkspace.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PROBLEM_MAPPING } from '../../problems'; 

// Import your modular components
import VisualizerRenderer from '../Workspace/VisualizerRenderer'; 
import CodingSpace from '../Workspace/CodingSection';

const ProblemWorkspace = () => {
  const { problemId } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10 text-white">Loading Workspace...</div>;
  if (!problem) return <div className="p-10 text-white">Problem not found.</div>;

  return (
    <div className="workspace-container">
      {/* Col 1: Description */}
      <aside className="problem-info">
        <div className="section-header">Description</div>
        <div className="info-content">
          <h2 className="prob-title">{problem.title}</h2>
          <div className="badge-row">
            <span className={`badge ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
          {problem.description}
        </div>
      </aside>

      {/* Col 2: Coding Space (Clean & Modular) */}
      <CodingSpace 
        code={code} 
        onChange={setCode} 
      />

      {/* Col 3: Visualization */}
      <section className="canvas-section">
        <div className="section-header">
           <span>Live Memory View</span>
        </div>
        <div className="renderer-wrapper">
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