import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  GitFork, 
  Repeat, 
  Database, 
  ShieldAlert, 
  Eye, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle 
} from 'lucide-react';

/**
 * ASTVisualizer - Translates AST diagnostic analysis into 4 high-level Pedagogical DSA Primitives:
 * 1. Traversers / Iterators (single scan, nested loops, two pointers, binary search)
 * 2. State Accumulators (running totals, frequency maps, prefix arrays)
 * 3. Condition Gates (comparisons, boundary checks, monotonic invariants)
 * 4. Memory Containers (LIFO stack, hash table, lookup sets)
 */
const ASTVisualizer = ({ astReport, code = '', onHighlightLine, onToggleXRay, xrayActive }) => {
  const [selectedPrimitive, setSelectedPrimitive] = useState(null);

  if (!astReport) {
    return (
      <div className="ast-viz-empty">
        <GitFork size={24} className="ast-viz-icon-muted" />
        <p>No AST diagnostic available yet.</p>
        <span>Run or submit your solution to analyze code structure.</span>
      </div>
    );
  }

  const {
    archetypeId = 'unknown',
    detectedComplexity = { time: 'O(?)', space: 'O(?)' },
    antiPatternsDetected = [],
    loopDepth = 0,
    hasAuxiliaryMemory = false,
    hasStackPattern = false,
    hasTwoPointer = false,
    hasBinarySearch = false,
    hasHashLookup = false,
    usesRecursion = false
  } = astReport;

  // Build the 4 Semantic Primitives
  const primitives = [
    {
      id: 'traverser',
      title: '1. Traverser / Iterator',
      icon: Repeat,
      active: loopDepth > 0 || usesRecursion,
      tag: hasBinarySearch 
        ? 'Binary Search (Logarithmic)' 
        : hasTwoPointer 
        ? 'Converging Two-Pointer' 
        : loopDepth > 1 
        ? `Nested Loops (Depth ${loopDepth})` 
        : loopDepth === 1 
        ? 'Single-Pass Iterator' 
        : usesRecursion 
        ? 'Recursive Call Stack' 
        : 'Sequential Execution',
      desc: loopDepth > 1 
        ? 'Quadratic or exponential scanning over the data window.' 
        : hasTwoPointer 
        ? 'Pointers converge from ends inwards based on condition checks.' 
        : hasBinarySearch 
        ? 'Window boundaries halve search space every step.' 
        : 'Iterates linearly across the input.'
    },
    {
      id: 'container',
      title: '2. Memory Container',
      icon: Database,
      active: hasAuxiliaryMemory || hasStackPattern,
      tag: hasStackPattern 
        ? 'LIFO Stack (.append / .pop)' 
        : hasHashLookup 
        ? 'Hash Map / Key-Value Set' 
        : hasAuxiliaryMemory 
        ? 'Auxiliary Structure' 
        : 'O(1) Constant Storage',
      desc: hasStackPattern 
        ? 'Maintains order to validate matching pairs or monotonic sequences.' 
        : hasHashLookup 
        ? 'Enables instant O(1) membership and complement queries.' 
        : 'No dynamic secondary memory container detected.'
    },
    {
      id: 'accumulator',
      title: '3. State Accumulator',
      icon: Layers,
      active: true,
      tag: hasAuxiliaryMemory ? 'Aggregated Frequency / Cache' : 'Scalar Pointers & Counters',
      desc: 'Holds values between iterations to reach the target return condition.'
    },
    {
      id: 'gate',
      title: '4. Condition Gate',
      icon: ShieldAlert,
      active: antiPatternsDetected.length > 0 || hasBinarySearch || hasTwoPointer,
      tag: antiPatternsDetected.length > 0 
        ? `${antiPatternsDetected.length} Anti-Pattern Warning(s)` 
        : 'Standard Guard Invariants',
      desc: antiPatternsDetected.length > 0 
        ? antiPatternsDetected.map(a => a.detail || a.type).join('; ') 
        : 'Controls loop termination and early-return conditions.'
    }
  ];

  return (
    <div className="ast-viz-container">
      {/* Top Bar with X-Ray Button & Complexity */}
      <div className="ast-viz-header">
        <div className="ast-viz-title">
          <GitFork size={15} />
          <span>Semantic AST Breakdown</span>
        </div>

        <button 
          type="button" 
          className={`btn-xray-toggle ${xrayActive ? 'is-active' : ''}`}
          onClick={onToggleXRay}
          title="Highlight loop structures and complexity hotspots in Monaco Editor"
        >
          <Eye size={12} />
          <span>{xrayActive ? 'X-Ray Active' : 'X-Ray View'}</span>
        </button>
      </div>

      {/* Complexity Pills */}
      <div className="ast-viz-stats">
        <div className="ast-stat-pill">
          <span className="stat-label">Estimated Time</span>
          <span className="stat-value time">{detectedComplexity.time}</span>
        </div>
        <div className="ast-stat-pill">
          <span className="stat-label">Estimated Space</span>
          <span className="stat-value space">{detectedComplexity.space}</span>
        </div>
        <div className="ast-stat-pill">
          <span className="stat-label">Loop Depth</span>
          <span className="stat-value depth">{loopDepth}</span>
        </div>
      </div>

      {/* Flowchart Representation of Semantic Primitives */}
      <div className="ast-primitives-flow">
        {primitives.map((prim, idx) => {
          const Icon = prim.icon;
          const isSelected = selectedPrimitive === prim.id;
          return (
            <React.Fragment key={prim.id}>
              <motion.div 
                className={`ast-primitive-card ${prim.active ? 'is-active' : 'is-idle'} ${isSelected ? 'is-selected' : ''}`}
                onClick={() => setSelectedPrimitive(isSelected ? null : prim.id)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="primitive-head">
                  <div className="primitive-icon">
                    <Icon size={14} />
                  </div>
                  <span className="primitive-title">{prim.title}</span>
                  {prim.active ? (
                    <CheckCircle2 size={13} className="status-icon active" />
                  ) : (
                    <AlertCircle size={13} className="status-icon idle" />
                  )}
                </div>

                <div className="primitive-body">
                  <div className="primitive-tag">{prim.tag}</div>
                  <p className="primitive-desc">{prim.desc}</p>
                </div>
              </motion.div>

              {idx < primitives.length - 1 && (
                <div className="ast-flow-connector">
                  <span className="flow-arrow">↓</span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Anti-Patterns List */}
      {antiPatternsDetected.length > 0 && (
        <div className="ast-antipattern-box">
          <div className="antipattern-head">
            <ShieldAlert size={14} />
            <span>AST Diagnostics: Anti-Patterns Found</span>
          </div>
          <div className="antipattern-list">
            {antiPatternsDetected.map((ap, i) => (
              <div 
                key={i} 
                className="antipattern-item"
                onClick={() => ap.line && onHighlightLine && onHighlightLine(ap.line)}
                style={{ cursor: ap.line ? 'pointer' : 'default' }}
                title={ap.line ? `Jump to line ${ap.line}` : ''}
              >
                <span className="line-tag">{ap.line ? `Line ${ap.line}` : 'Notice'}</span>
                <span className="detail-text">{ap.detail || ap.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ASTVisualizer;
