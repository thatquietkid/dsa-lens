// src/components/Workspace/VisualTrace.jsx
import React from 'react';
import { motion } from 'framer-motion';

const VisualTrace = ({ currentState, nums }) => {
  if (!currentState) return <div className="p-4 text-gray-500">Initializing...</div>;

  const { i, seen, complement } = currentState;

  // CHANGED: Removed <section> and <div className="section-header"> wrapper.
  // This now returns ONLY the inner content.
  return (
      <div className="visual-stage-compact">
        {/* 1. Array Section */}
        <div className="trace-group">
          <span className="group-label">Input Array</span>
          <div className="array-container">
            {nums.map((val, idx) => (
              <motion.div 
                key={idx} 
                className={`array-box ${i === idx ? 'active' : ''}`}
                animate={{ scale: i === idx ? 1.05 : 1 }}
              >
                <span className="index-label">{idx}</span>
                <span className="value">{val}</span>
                {i === idx && <motion.div layoutId="ptr" className="cursor-indicator" />}
              </motion.div>
            ))}
          </div>
        </div>

        {/* 2. Calculation Section */}
        <div className="trace-group">
          <div className="calc-card-modern">
            <div className="calc-row">
              <span className="calc-label">Target</span>
              <span className="calc-val">9</span>
            </div>
            <div className="calc-divider">−</div>
            <div className="calc-row">
              <span className="calc-label">Nums[{i}]</span>
              <span className="calc-val">{nums[i]}</span>
            </div>
            <div className="calc-divider-main"></div>
            <div className="calc-row">
              <span className="calc-label">Need</span>
              <span className="calc-val-highlight">{complement}</span>
            </div>
          </div>
        </div>

        {/* 3. Memory Section */}
        <div className="trace-group">
          <span className="group-label">Memory</span>
          <div className="hashmap-mini-card">
            <table className="modern-table">
              <thead><tr><th>Key</th><th>Idx</th></tr></thead>
              <tbody>
                {Object.entries(seen || {}).map(([k, v]) => (
                  <tr key={k}><td>{k}</td><td>{v}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default VisualTrace;