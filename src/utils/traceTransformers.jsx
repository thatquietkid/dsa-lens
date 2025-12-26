import { analyzeResult } from './resultAnalyzer';

// ==========================================
// 1. SHARED HELPERS
// ==========================================

const unwrap = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj.type === 'list') return obj.values.map(v => unwrap(v));
  if (obj.type === 'object' && obj.data && obj.data.val !== undefined) return obj.data.val;
  return obj;
};

// 🟢 HELPER: FORMAT VALUE FOR HUMANS
// Converts complex objects (like ListNode) into readable strings
const formatValue = (val) => {
    if (val === null || val === undefined) return 'None';
    
    // Check for ListNode structure from Python
    // (AST parser returns { type: 'object', class: 'ListNode', data: { val: 1, next: ... } })
    if (val && (val.class === 'ListNode' || (val.type === 'object' && val.data && val.data.val !== undefined))) {
        const data = val.data || val;
        return `Node(${data.val})`; // Returns "Node(1)" instead of huge JSON
    }
    
    if (Array.isArray(val)) return `[List]`;
    if (typeof val === 'object') return `{Object}`;
    
    return JSON.stringify(val);
};

const generateStatusMessage = (type, target, val) => {
    const safeVal = formatValue(val);
    
    if (type === 'ASSIGN') return `Set ${target} to ${safeVal}`;
    if (type === 'MUTATE') return `Updated ${target} to ${safeVal}`;
    if (type === 'RETURN') return `Returned: ${safeVal}`; 
    return `Executing...`;
};

// ==========================================
// 2. NEW: AST EVENT TRANSFORMER (Strict Filter)
// ==========================================
export const transformEventTrace = (eventStream) => {
  if (!eventStream) return [];

  let currentMemory = {}; 
  const history = [];

  // 🟢 STRICT IGNORE LIST
  // These variables are used by the test runner/wrapper and should NOT be shown to the user.
  const IGNORE_LIST = [
      // Python Internals
      'self', 'enumerate',
      
      // Linked List Construction Helpers
      'nodes', 'dummy', 'unknown_structure', 'h', 'i', 
      
      // Wrapper / Adapter Internals (The "plumbing")
      'adapted_args', 'args', 'kwargs', 'raw_input', 
      'input_adapter', 'output_adapter', 'test_runner_wrapper'
  ];

  eventStream.forEach((event) => {
    // 1. FILTER: Skip internal/wrapper variables
    if (IGNORE_LIST.includes(event.target)) return;
    
    // 2. ERROR HANDLING
    if (event.event === 'ERROR') {
        history.push({ status: `Error: ${event.message}`, isError: true, line: 0, memory: {} });
        return;
    }

    const { event: type, target, value, line } = event;

    // 3. UPDATE MEMORY
    if (type === 'ASSIGN' || type === 'MUTATE') {
        currentMemory = { ...currentMemory, [target]: value };
    }

    // 4. ANALYZE RETURN
    const isReturn = type === 'RETURN';
    const analysis = isReturn ? analyzeResult(value) : null;

    history.push({
        line,
        event: type,
        activeTarget: target,
        activeValue: value,
        memory: { ...currentMemory },
        
        isReturn,
        returnValue: isReturn ? value : null,
        
        // Smart Analysis Props
        resultMood: analysis ? analysis.mood : null,
        resultLabel: analysis ? analysis.label : null,
        resultColor: analysis ? analysis.color : null,
        
        // Status Message (using cleaner formatter)
        status: isReturn 
            ? `🏁 Done: ${analysis.label}` 
            : generateStatusMessage(type, target, value)
    });
  });

  return history;
};

// ==========================================
// 3. OLD: SNAPSHOT TRANSFORMER (Legacy Support)
// ==========================================
export const transformDynamicTrace = (rawTrace, problemType) => {
  if (!rawTrace) return [];
  
  return rawTrace.map((step) => {
    const { locals, line, event } = step;
    
    // Basic unwrapping for legacy support
    const currVal = unwrap(locals.num ?? locals.n ?? locals.val);
    const target = unwrap(locals.target ?? locals.t);
    const complement = unwrap(locals.complement ?? locals.diff);
    
    let seen = {};
    if (locals.seen) {
        const rawMap = locals.seen.data || locals.seen;
        if (typeof rawMap === 'object' && !Array.isArray(rawMap)) {
            Object.entries(rawMap).forEach(([k, v]) => { seen[k] = unwrap(v); });
        }
    }

    return {
      line,
      currVal,
      target,
      complement,
      seen,
      status: `Line ${line}: ${event}`,
      pointers: locals,
      isLegacy: true 
    };
  });
};

// Wrapper for Linked List compatibility
export const transformLinkedListTrace = (rawTrace) => transformDynamicTrace(rawTrace, 'linked-list');