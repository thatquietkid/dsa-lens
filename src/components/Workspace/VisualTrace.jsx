import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- HELPER: FORMAT FINAL OUTPUT ---
const formatReturnValue = (val) => {
  if (val === null || val === undefined) return "None";
  if (val && (val.class === 'ListNode' || (val.type === 'object' && val.data && val.data.val !== undefined))) {
      const result = [];
      let curr = val.data || val; 
      let limit = 20; 
      while (curr && limit > 0) {
          result.push(curr.val);
          if (curr.next && curr.next.data) curr = curr.next.data;
          else if (curr.next) curr = curr.next;
          else curr = null;
          limit--;
      }
      if (limit === 0) result.push("...");
      return `[${result.join(', ')}]`;
  }
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  return String(val);
};

// 🟢 SMART CONTEXT RESOLVER (The "Brain")
// Scans memory to explain WHY the result is correct
const getSmartContext = (returnValue, memory) => {
    // 1. Only applies if we returned an Index (Integer >= 0)
    if (typeof returnValue !== 'number' || returnValue < 0) return null;

    // 2. Find the 'Target' if it exists (e.g. 9)
    const targetVar = Object.entries(memory).find(([key]) => key === 'target' || key === 'key' || key === 'val');
    const targetVal = targetVar ? targetVar[1] : null;

    // 3. Find the 'Array' (e.g. nums)
    const listVar = Object.entries(memory).find(([key, val]) => Array.isArray(val) && key !== 'adapted_args');
    
    if (listVar) {
        const [listName, listVal] = listVar;
        const valAtIndex = listVal[returnValue];

        // 4. GOLD MATCH: Does nums[index] == target?
        if (targetVal !== null && valAtIndex === targetVal) {
             return { 
                 type: 'success', 
                 msg: `Verified: ${listName}[${returnValue}] == ${targetVal}`
             };
        }
        
        // 5. SILVER MATCH: Just show the value at that index
        // "Index 4 points to value 9"
        return {
            type: 'neutral',
            msg: `Value at ${listName}[${returnValue}]: ${valAtIndex}`
        };
    }
    return null;
};

// --- RENDERERS (Standard) ---
const RenderStack = ({ name, data, isActive }) => {
  return (
    <div style={{ border: `2px solid ${isActive ? '#22d3ee' : '#334155'}`, background: '#0f172a', borderRadius: '0 0 8px 8px', borderTop: 'none', padding: '20px 10px 10px 10px', minHeight: '150px', minWidth: '80px', display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: '5px', position: 'relative' }}>
      <div style={{ position: 'absolute', bottom: '-25px', fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>{name}</div>
      {data.length === 0 && <div style={{ color: '#334155', fontSize: '10px', marginTop: '20px' }}>EMPTY</div>}
      <AnimatePresence>
        {data.map((val, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: -20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.5 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} style={{ width: '60px', height: '30px', background: '#1e293b', border: '1px solid #475569', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold', position: 'relative' }}>
            {String(val)}
            {idx === data.length - 1 && <div style={{ position: 'absolute', right: '-40px', color: '#22d3ee', fontSize: '10px', display: 'flex', alignItems: 'center' }}>← TOP</div>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const RenderLinkedListNode = ({ name, data, isActive }) => {
  const value = data && data.val !== undefined ? data.val : (data !== null ? data : "null");
  return (
    <motion.div layout animate={{ scale: isActive ? 1.1 : 1, borderColor: isActive ? '#22d3ee' : '#334155' }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '10px', position: 'relative' }}>
      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{name}</div>
      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#0f172a', border: '2px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>{String(value)}</div>
      {value !== "null" && <div style={{ position: 'absolute', right: '-20px', top: '35px', color: '#475569' }}>➜</div>}
    </motion.div>
  );
};

const RenderList = ({ name, data, isActive }) => (
  <div style={{ border: `1px solid ${isActive ? '#22d3ee' : '#334155'}`, padding: '12px', borderRadius: '8px' }}>
    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>{name}</div>
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {data.map((val, idx) => (
        <div key={idx} style={{ padding: '4px 8px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '4px', fontSize: '13px' }}>{String(val)}</div>
      ))}
    </div>
  </div>
);

const RenderMap = ({ name, data, isActive }) => (
  <div style={{ border: `1px solid ${isActive ? '#22d3ee' : '#334155'}`, padding: '12px', borderRadius: '8px' }}>
    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>{name}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {Object.entries(data).map(([key, val]) => (
        <div key={key} style={{ display: 'flex', fontSize: '13px', fontFamily: 'monospace' }}>
          <span style={{ color: '#94a3b8', marginRight: '8px' }}>{JSON.stringify(key)}:</span>
          <span style={{ color: '#fff' }}>{JSON.stringify(val)}</span>
        </div>
      ))}
    </div>
  </div>
);

const RenderPrimitive = ({ name, value, isActive, theme }) => (
  <motion.div animate={{ backgroundColor: theme ? theme.bg : '#1e1e1e', borderColor: theme ? theme.border : (isActive ? '#22d3ee' : '#334155') }} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', border: '1px solid' }}>
    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{name}</span>
    <span style={{ color: theme ? theme.color : '#fff', fontWeight: 'bold' }}>{String(value)}</span>
  </motion.div>
);

// --- MAIN COMPONENT ---
const VisualTrace = ({ currentState }) => {
  if (!currentState) return <div style={{ color: '#64748b', padding: '20px' }}>Initializing...</div>;

  const { memory, activeTarget, isError, line, isReturn, returnValue, resultColor, resultLabel, status } = currentState;

  if (isError) return <div style={{ padding: '20px', color: '#ef4444' }}>Error: {status}</div>;

  const primitives = [];
  const nodes = [];
  const structures = []; 
  const stacks = [];

  Object.entries(memory || {}).forEach(([name, val]) => {
    if (name.startsWith('__') || name === 'result') return; 
    
    // HEURISTIC: Stack detection
    if (name.toLowerCase().includes('stack') && Array.isArray(val)) {
        stacks.push({ name, val });
        return;
    }

    const isNode = (val && val.class === 'ListNode') || (val && val.type === 'object' && val.data && val.data.val !== undefined);
    
    if (isNode) nodes.push({ name, val: val.data || val });
    else if (Array.isArray(val)) structures.push({ name, val, isList: true });
    else if (typeof val === 'object' && val !== null) structures.push({ name, val, isList: false });
    else primitives.push({ name, val });
  });

  const returnType = Array.isArray(returnValue) ? 'LIST' : (typeof returnValue === 'object' ? 'OBJECT' : typeof returnValue === 'number' ? 'NUMBER' : 'VALUE');
  
  // 🟢 CALCULATE SMART CONTEXT
  const contextHint = isReturn ? getSmartContext(returnValue, memory) : null;

  return (
    <div style={{ padding: '15px', display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'Inter, sans-serif' }}>
      
      {/* STATUS BAR */}
      <div style={{ background: isReturn ? `${resultColor}1A` : '#111827', border: `1px solid ${isReturn ? resultColor : '#1f2937'}`, borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: isReturn ? resultColor : '#22d3ee', fontSize: '13px', fontWeight: 'bold' }}>{isReturn ? `🏁 ${resultLabel}` : status}</span>
        <span style={{ color: '#64748b', fontSize: '10px' }}>LINE {line}</span>
      </div>

      {/* FINAL RESULT CARD */}
      {isReturn && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: `${resultColor}1A`, border: `1px solid ${resultColor}`, borderRadius: '12px', padding: '20px', textAlign: 'center', position: 'relative' }}>
          
          {/* Badge */}
          <div style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '9px', background: resultColor, color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
             {returnType}
          </div>
          
          <div style={{ fontSize: '10px', color: resultColor, marginBottom: '8px' }}>FINAL OUTPUT</div>
          
          {/* Main Result */}
          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{formatReturnValue(returnValue)}</div>
          
          {/* 🟢 SMART CONTEXT MESSAGE */}
          {contextHint && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                style={{ 
                    marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)',
                    fontSize: '11px', color: contextHint.type === 'success' ? '#4ade80' : '#94a3b8',
                    fontFamily: 'monospace'
                }}>
                  {contextHint.msg}
              </motion.div>
          )}
        </motion.div>
      )}

      <div style={{ opacity: isReturn ? 0.6 : 1 }}>
        {stacks.length > 0 && <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>{stacks.map(s => <RenderStack key={s.name} name={s.name} data={s.val} isActive={s.name === activeTarget} />)}</div>}
        {nodes.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{nodes.map(n => <RenderLinkedListNode key={n.name} name={n.name} data={n.val} isActive={n.name === activeTarget} />)}</div>}
        {primitives.length > 0 && <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>{primitives.map(p => <RenderPrimitive key={p.name} name={p.name} value={p.val} isActive={p.name === activeTarget} theme={isReturn ? { color: resultColor, bg: `${resultColor}1A`, border: resultColor } : null} />)}</div>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>{structures.map(s => (s.isList ? <RenderList key={s.name} name={s.name} data={s.val} isActive={s.name === activeTarget} /> : <RenderMap key={s.name} name={s.name} data={s.val} isActive={s.name === activeTarget} />))}</div>
      </div>
    </div>
  );
};

export default VisualTrace;