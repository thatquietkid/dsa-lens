import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CornerDownRight } from 'lucide-react'; // Make sure to import icons

const VisualTrace = ({ currentState, nums, target, inputString }) => {
  if (!currentState) return null;

  // --- DETECT MODE ---
  const isStackMode = currentState.stack !== undefined;
  const isListMode = currentState.nodes !== undefined;

  // ============================================
  // MODE 1: LINKED LIST (Reverse List)
  // ============================================
  if (isListMode) {
    const { nodes, pointers, status } = currentState;
    const { prev, curr, nxt } = pointers || {};

    return (
      <div className="visual-stage-compact w-full max-w-[400px] mx-auto flex flex-col gap-8">
        
        {/* POINTER LEGEND */}
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

        {/* NODES CONTAINER */}
        <div className="relative flex flex-wrap justify-center gap-8 py-8">
            {nodes.map((node, idx) => {
                const isPrev = node.val === prev;
                const isCurr = node.val === curr;
                const isNext = node.val === nxt;

                // Determine arrow direction based on 'next' value
                // In this simplified view, we assume nodes are laid out 1,2,3,4,5
                // If 2 points to 1, it's a backward arrow.
                let arrowType = 'none';
                if (node.next !== null) {
                    if (node.next > node.val) arrowType = 'forward'; // 1 -> 2
                    else arrowType = 'backward'; // 2 -> 1
                }

                return (
                    <div key={node.id} className="relative flex flex-col items-center">
                        
                        {/* THE NODE */}
                        <motion.div 
                            className={`
                                w-12 h-12 rounded-full border-2 flex items-center justify-center 
                                text-lg font-bold bg-[#1e1e1e] z-10 transition-colors duration-300
                                ${isCurr ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-110' : 
                                  isPrev ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 
                                  isNext ? 'border-purple-500' : 'border-gray-700 text-gray-500'}
                            `}
                            animate={{ scale: isCurr ? 1.15 : 1 }}
                        >
                            {node.val}
                        </motion.div>

                        {/* POINTER LABELS */}
                        <div className="absolute -top-8 flex flex-col items-center gap-1">
                            {isPrev && <motion.span layoutId="p-lbl" className="text-[10px] text-emerald-500 font-bold">PREV</motion.span>}
                            {isCurr && <motion.span layoutId="c-lbl" className="text-[10px] text-cyan-400 font-bold">CURR</motion.span>}
                            {isNext && <motion.span layoutId="n-lbl" className="text-[10px] text-purple-500 font-bold">NXT</motion.span>}
                        </div>

                        {/* ARROWS */}
                        {/* Forward Arrow (Right) */}
                        {arrowType === 'forward' && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 w-8 h-[2px] bg-gray-600">
                                <div className="absolute right-0 -top-[3px] w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-gray-600 border-b-[4px] border-b-transparent"></div>
                            </div>
                        )}

                        {/* Backward Arrow (Curved Underneath) */}
                        {arrowType === 'backward' && (
                            <svg className="absolute top-10 right-1/2 w-20 h-10 pointer-events-none z-0" style={{ transform: 'translateX(50%)' }}>
                                <path d="M 5 0 Q 5 20 75 0" fill="none" stroke="#22c55e" strokeWidth="2" markerEnd="url(#arrowhead)" />
                                <defs>
                                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="#22c55e" />
                                    </marker>
                                </defs>
                            </svg>
                        )}
                        
                        {/* Null Pointer */}
                        {node.next === null && (
                            <div className="absolute -right-6 top-1/2 text-[10px] text-gray-600">NULL</div>
                        )}
                    </div>
                )
            })}
        </div>

        {/* STATUS CARD */}
        <div className="trace-group mt-4">
             <div className="calc-card-modern text-center">
                 <div className="text-xs text-gray-400 mb-1 uppercase tracking-widest">Current Action</div>
                 <div className="text-white font-mono text-sm">
                     {status === 'start' && "Initializing Pointers"}
                     {status === 'current' && "Identify next node (nxt)"}
                     {status === 'reverse' && <span className="text-emerald-400">Reversing Link (curr.next = prev)</span>}
                     {status === 'move' && "Shift Pointers (prev, curr)"}
                 </div>
             </div>
        </div>

      </div>
    );
  }

  // ============================================
  // MODE 2: TWO SUM (Array)
  // ============================================
  if (!isStackMode) {
    const { i, seen, complement, status, matchIndex } = currentState;
    return (
      <div className="visual-stage-compact w-full max-w-[320px] mx-auto flex flex-col gap-6">
        {/* 1. INPUT ARRAY */}
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

        {/* 2. CALCULATION CARD */}
        <div className="trace-group">
          <span className="group-label">Logic Step</span>
          <div className={`calc-card-modern ${status === 'found' ? 'border-green-500/50 bg-green-500/10' : ''}`}>
             {i === -1 ? <div className="text-gray-500 text-sm text-center italic">Starting Algorithm...</div> : (
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

        {/* 3. MEMORY */}
        <div className="trace-group">
          <span className="group-label">Hashmap</span>
          <div className="hashmap-mini-card">
            <table className="modern-table w-full">
              <thead><tr><th className="text-left p-2">Key</th><th className="text-right p-2">Index</th></tr></thead>
              <tbody>
                {Object.entries(seen || {}).map(([k, v]) => (
                  <tr key={k}><td className="p-2 text-sm text-white">{k}</td><td className="p-2 text-sm text-cyan-400 text-right">{v}</td></tr>
                ))}
                {Object.keys(seen || {}).length === 0 && <tr><td colSpan="2" className="p-4 text-center text-xs text-gray-600 italic">Empty</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // MODE 3: VALID PARENTHESES (Stack)
  // ============================================
  const { i, stack, char, status } = currentState;
  const inputArr = inputString ? inputString.split('') : [];

  return (
    <div className="visual-stage-compact w-full max-w-[320px] mx-auto flex flex-col gap-6">
      
      {/* 1. INPUT STRING */}
      <div className="trace-group">
        <span className="group-label">Input String</span>
        <div className="array-container">
          {inputArr.map((val, idx) => (
            <div key={idx} className={`array-box ${i === idx ? 'active' : ''}`} style={{ width: '40px', height: '40px' }}>
              <span className="index-label">{idx}</span>
              <span className="value text-sm">{val}</span>
              {i === idx && <motion.div layoutId="ptr-s" className="cursor-indicator" />}
            </div>
          ))}
        </div>
      </div>

      {/* 2. LOGIC STEP */}
      <div className="trace-group">
        <span className="group-label">Current Action</span>
        <div className={`calc-card-modern ${status === 'error' ? 'border-red-500/50' : status === 'match' ? 'border-green-500/50' : ''}`}>
           <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Processing Char</div>
              <div className="text-2xl font-bold text-white mb-2">{char || '-'}</div>
              <div className={`text-xs font-mono px-2 py-1 rounded ${
                  status === 'push' ? 'bg-blue-500/20 text-blue-300' :
                  status === 'pop' ? 'bg-amber-500/20 text-amber-300' :
                  status === 'match' ? 'bg-green-500/20 text-green-300' :
                  status === 'error' ? 'bg-red-500/20 text-red-300' : 'text-gray-500'
              }`}>
                  {status ? status.toUpperCase() : 'WAITING'}
              </div>
           </div>
        </div>
      </div>

      {/* 3. STACK VISUALIZATION */}
      <div className="trace-group">
        <span className="group-label">Stack (LIFO)</span>
        <div className="w-full flex flex-col-reverse items-center gap-2 bg-[#1e1e1e] border border-white/10 rounded-xl p-4 min-h-[150px]">
           <AnimatePresence>
             {stack.map((item, idx) => (
               <motion.div 
                 key={`${idx}-${item}`}
                 initial={{ opacity: 0, y: -20, scale: 0.8 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
                 className="w-full bg-slate-700 border border-slate-600 rounded-md p-2 text-center text-white font-mono font-bold shadow-lg"
               >
                 {item}
               </motion.div>
             ))}
           </AnimatePresence>
           {stack.length === 0 && <div className="text-gray-600 text-xs italic mt-10">Stack is Empty</div>}
        </div>
      </div>
    </div>
  );
};

export default VisualTrace;