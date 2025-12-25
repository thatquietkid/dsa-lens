import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CornerDownRight } from 'lucide-react';

const VisualTrace = ({ currentState, nums, target, inputString }) => {
  if (!currentState) return null;

  // ============================================
  // 🔍 MODE DETECTION
  // ============================================
  const isStackMode = currentState.stack !== undefined;      // Valid Parentheses
  const isListMode = currentState.nodes !== undefined;       // Reverse Linked List
  const isBinarySearch = currentState.left !== undefined;    // Binary Search

  // ============================================
  // 🔗 MODE 1: LINKED LIST (e.g. Reverse List)
  // ============================================
  if (isListMode) {
    const { nodes, pointers, status } = currentState;
    const { prev, curr, nxt } = pointers || {};

    return (
      <div className="visual-stage-compact w-full max-w-[400px] mx-auto flex flex-col gap-8">
        
        {/* Pointer Legend */}
        <div className="flex justify-center gap-6 text-xs font-bold uppercase tracking-wider">
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div> PREV
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-400"></div> CURR
           </div>
           <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div> NEXT
           </div>
        </div>

        {/* Nodes Visualization */}
        <div className="relative flex flex-wrap justify-center gap-12 py-8 px-4">
            {nodes.map((node) => {
                const isPrev = node.val === prev;
                const isCurr = node.val === curr;
                const isNext = node.val === nxt;

                // Arrow Logic
                let arrowType = 'none';
                if (node.next !== null) {
                    // Simple heuristic: if next val > curr val, it's forward, else backward
                    if (node.next > node.val) arrowType = 'forward'; 
                    else arrowType = 'backward';
                }

                return (
                    <div key={node.id} className="relative flex flex-col items-center">
                        
                        {/* Node Circle */}
                        <motion.div 
                            className={`
                                w-14 h-14 rounded-full border-2 flex items-center justify-center 
                                text-lg font-bold bg-[#1e1e1e] z-10 transition-colors duration-300
                                ${isCurr ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110' : 
                                  isPrev ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                                  isNext ? 'border-purple-500' : 'border-gray-700 text-gray-500'}
                            `}
                            animate={{ scale: isCurr ? 1.15 : 1 }}
                        >
                            {node.val}
                        </motion.div>

                        {/* Labels */}
                        <div className="absolute -top-8 flex flex-col items-center gap-1 w-20">
                            {isPrev && <motion.span layoutId="p-lbl" className="text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-1 rounded">PREV</motion.span>}
                            {isCurr && <motion.span layoutId="c-lbl" className="text-[10px] text-cyan-400 font-bold bg-cyan-400/10 px-1 rounded">CURR</motion.span>}
                            {isNext && <motion.span layoutId="n-lbl" className="text-[10px] text-purple-500 font-bold bg-purple-500/10 px-1 rounded">NXT</motion.span>}
                        </div>

                        {/* Forward Arrow */}
                        {arrowType === 'forward' && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 w-12 h-[2px] bg-gray-600">
                                <div className="absolute right-0 -top-[3px] border-t-[4px] border-t-transparent border-l-[6px] border-l-gray-600 border-b-[4px] border-b-transparent"></div>
                            </div>
                        )}

                        {/* Backward Arrow (Curved) */}
                        {arrowType === 'backward' && (
                            <svg className="absolute top-12 left-1/2 w-full h-12 pointer-events-none z-0 overflow-visible">
                                <path d="M 0 0 Q -20 25 -50 5" fill="none" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                <defs>
                                    <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                                        <polygon points="0 0, 6 3, 0 6" fill="#22c55e" />
                                    </marker>
                                </defs>
                            </svg>
                        )}
                        
                        {node.next === null && (
                            <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[10px] text-gray-600">NULL</div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* Status */}
        <div className="trace-group mt-2">
             <div className="calc-card-modern text-center p-3">
                 <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Action</div>
                 <div className="text-white font-mono text-sm">
                     {status === 'start' && "Initializing..."}
                     {status === 'current' && "Save next node (nxt = curr.next)"}
                     {status === 'reverse' && <span className="text-emerald-400 font-bold">Reverse! (curr.next = prev)</span>}
                     {status === 'move' && "Move pointers forward"}
                 </div>
             </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 🔎 MODE 2: BINARY SEARCH (Sorted Array)
  // ============================================
  if (isBinarySearch) {
    const { left, right, mid, status, val } = currentState;
    
    return (
      <div className="visual-stage-compact w-full max-w-[350px] mx-auto flex flex-col gap-6">
        
        {/* Array Visualization */}
        <div className="trace-group">
          <span className="group-label">Sorted Array</span>
          <div className="array-container">
            {nums && nums.map((numVal, idx) => {
              // Dim elements outside current search range
              const isOutOfRange = idx < left || idx > right;
              const isMid = idx === mid;
              const isFound = status === 'found' && isMid;

              return (
                <motion.div 
                  key={idx} 
                  className={`
                    array-box relative 
                    ${isMid ? 'border-amber-400 bg-amber-500/10' : ''}
                    ${isFound ? '!border-green-500 !bg-green-500/20' : ''}
                  `}
                  style={{ 
                    opacity: isOutOfRange ? 0.2 : 1,
                    borderColor: isOutOfRange ? '#333' : undefined,
                    filter: isOutOfRange ? 'grayscale(100%)' : 'none'
                  }}
                  animate={{ scale: isMid ? 1.15 : 1 }}
                >
                  <span className="index-label">{idx}</span>
                  <span className="value">{numVal}</span>
                  
                  {/* Pointers L/R/M */}
                  <div className="absolute -bottom-7 flex flex-col items-center gap-0.5 w-full">
                    {idx === left && <motion.span layoutId="L" className="text-[10px] font-bold text-cyan-400 bg-cyan-900/30 px-1 rounded">L</motion.span>}
                    {idx === right && <motion.span layoutId="R" className="text-[10px] font-bold text-purple-400 bg-purple-900/30 px-1 rounded">R</motion.span>}
                    {idx === mid && status !== 'start' && <motion.span layoutId="M" className="absolute -top-16 text-[10px] font-bold text-amber-400 bg-amber-900/30 px-1 rounded">MID</motion.span>}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Logic Card */}
        <div className="trace-group">
          <span className="group-label">Search Logic</span>
          <div className={`calc-card-modern ${status === 'found' ? 'border-green-500/50' : ''}`}>
             <div className="flex justify-between items-center text-sm mb-3 border-b border-gray-700 pb-2">
                 <span className="text-gray-400">Target</span>
                 <span className="font-bold text-white text-lg">{target}</span>
             </div>
             
             {status === 'start' && <div className="text-center text-sm text-gray-500 italic">Initializing Pointers...</div>}
             
             {status !== 'start' && (
                 <>
                    <div className="flex justify-between items-center text-sm font-mono mb-2">
                        <span className="text-amber-400">nums[mid]</span>
                        <span className="text-white text-lg">{val}</span>
                    </div>
                    
                    <div className="bg-black/20 p-2 rounded text-center text-xs font-bold uppercase tracking-wider">
                        {status === 'calc_mid' && <span className="text-gray-300">Comparing...</span>}
                        {status === 'found' && <span className="text-green-400">Match Found! return {mid}</span>}
                        {status === 'go_right' && <span className="text-cyan-400">{val} &lt; {target} → Too Small<br/>Move Left = Mid + 1</span>}
                        {status === 'go_left' && <span className="text-purple-400">{val} &gt; {target} → Too Big<br/>Move Right = Mid - 1</span>}
                    </div>
                 </>
             )}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // 📚 MODE 3: STACK (Valid Parentheses)
  // ============================================
  if (isStackMode) {
     const { i, stack, char, status } = currentState;
     const inputArr = inputString ? inputString.split('') : [];

     return (
        <div className="visual-stage-compact w-full max-w-[320px] mx-auto flex flex-col gap-6">
           
           {/* Input String Traversal */}
           <div className="trace-group">
                <span className="group-label">Input String</span>
                <div className="array-container">
                    {inputArr.map((val, idx) => (
                        <div key={idx} className={`array-box ${i === idx ? 'active' : ''}`} style={{ width: '36px', height: '36px' }}>
                            <span className="value text-sm">{val}</span>
                            {i === idx && <motion.div layoutId="ptr-s" className="cursor-indicator" />}
                        </div>
                    ))}
                </div>
           </div>

           {/* Current Action */}
           <div className="trace-group">
                <div className={`calc-card-modern text-center ${status === 'error' ? 'border-red-500/50' : status === 'match' ? 'border-green-500/50' : ''}`}>
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Current Char</span>
                    <div className="text-2xl font-bold text-white my-1">{char || '-'}</div>
                    <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                        status === 'push' ? 'bg-blue-500/20 text-blue-300' :
                        status === 'pop' ? 'bg-amber-500/20 text-amber-300' :
                        status === 'match' ? 'bg-green-500/20 text-green-300' :
                        status === 'error' ? 'bg-red-500/20 text-red-300' : 'text-gray-500'
                    }`}>
                        {status ? status.toUpperCase() : 'WAITING'}
                    </div>
                </div>
           </div>

           {/* Vertical Stack Visualization */}
           <div className="trace-group">
               <span className="group-label">Stack (LIFO)</span>
               <div className="w-full flex flex-col-reverse items-center gap-2 bg-[#1e1e1e] border border-white/10 rounded-xl p-4 min-h-[160px] relative">
                    <AnimatePresence>
                        {stack.map((item, idx) => (
                            <motion.div 
                                key={`${idx}-${item}`}
                                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.15 } }}
                                className="w-full h-8 bg-slate-700 border border-slate-600 rounded-md flex items-center justify-center text-white font-mono font-bold shadow-md text-sm"
                            >
                                {item}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {stack.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-700 text-xs italic pointer-events-none">
                            Stack Empty
                        </div>
                    )}
               </div>
           </div>
        </div>
     );
  }

  // ============================================
  // 🔢 MODE 4: TWO SUM (Default Array)
  // ============================================
  const { i, seen, complement, status, matchIndex } = currentState;
  return (
    <div className="visual-stage-compact w-full max-w-[320px] mx-auto flex flex-col gap-6">
        
        {/* Input Array */}
        <div className="trace-group">
          <span className="group-label">Input Array</span>
          <div className="array-container">
            {nums && nums.map((val, idx) => {
              const isCurrent = i === idx;
              const isMatch = status === 'found' && (idx === i || idx === matchIndex);
              return (
                <motion.div 
                    key={idx} 
                    className={`array-box ${isCurrent ? 'active' : ''} ${isMatch ? 'found-success' : ''}`}
                    animate={{ scale: isCurrent ? 1.1 : 1, borderColor: isMatch ? '#4ade80' : isCurrent ? '#22d3ee' : 'rgba(255,255,255,0.1)' }}
                >
                  <span className="index-label">{idx}</span>
                  <span className="value">{val}</span>
                  {isCurrent && <motion.div layoutId="ptr" className="cursor-indicator" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Calculation Logic */}
        <div className="trace-group">
          <span className="group-label">Logic</span>
          <div className={`calc-card-modern ${status === 'found' ? 'border-green-500/50 bg-green-500/10' : ''}`}>
             {i === -1 ? <div className="text-gray-500 text-sm text-center italic">Starting...</div> : (
               <>
                 <div className="calc-row"><span className="calc-label text-gray-400">Target</span><span className="calc-val">{target}</span></div>
                 <div className="calc-divider text-gray-600 my-1 text-center">-</div>
                 <div className="calc-row"><span className="calc-label text-gray-400">Current</span><span className="calc-val text-cyan-400">{nums[i]}</span></div>
                 <div className="calc-divider-main bg-gray-700 h-px my-3"></div>
                 <div className="calc-row"><span className="calc-label text-gray-400">Need</span><span className="calc-val-highlight text-white">{complement}</span></div>
               </>
             )}
          </div>
        </div>

        {/* Hashmap Table */}
        <div className="trace-group">
          <span className="group-label">Hashmap</span>
          <div className="hashmap-mini-card">
            <table className="modern-table w-full">
              <thead><tr><th className="text-left p-2 text-gray-500 text-xs">Key</th><th className="text-right p-2 text-gray-500 text-xs">Index</th></tr></thead>
              <tbody>
                {Object.entries(seen || {}).map(([k, v]) => (
                  <tr key={k}><td className="p-2 text-sm text-white border-t border-white/5">{k}</td><td className="p-2 text-sm text-cyan-400 text-right border-t border-white/5">{v}</td></tr>
                ))}
                {Object.keys(seen || {}).length === 0 && <tr><td colSpan="2" className="p-4 text-center text-xs text-gray-600 italic">Empty</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default VisualTrace;