import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

// --- HELPER: FORMAT FINAL OUTPUT ---
const formatReturnValue = (val) => {
  if (val === null || val === undefined) return 'None';
  if (
    val &&
    (val.class === 'ListNode' ||
      (val.type === 'object' && val.data && val.data.val !== undefined))
  ) {
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
    if (limit === 0) result.push('...');
    return `[${result.join(', ')}]`;
  }
  if (Array.isArray(val)) return `[${val.join(', ')}]`;
  return String(val);
};

// --- SMART CONTEXT RESOLVER ---
// Scans memory to explain WHY the result is correct.
const getSmartContext = (returnValue, memory) => {
  if (typeof returnValue !== 'number' || returnValue < 0) return null;

  const targetVar = Object.entries(memory).find(
    ([key]) => key === 'target' || key === 'key' || key === 'val'
  );
  const targetVal = targetVar ? targetVar[1] : null;

  const listVar = Object.entries(memory).find(
    ([key, val]) => Array.isArray(val) && key !== 'adapted_args'
  );

  if (listVar) {
    const [listName, listVal] = listVar;
    const valAtIndex = listVal[returnValue];

    if (targetVal !== null && valAtIndex === targetVal) {
      return {
        type: 'success',
        msg: `Verified: ${listName}[${returnValue}] == ${targetVal}`,
      };
    }

    return {
      type: 'neutral',
      msg: `Value at ${listName}[${returnValue}]: ${valAtIndex}`,
    };
  }
  return null;
};

// --- RENDERERS ---
const RenderStack = ({ name, data, isActive }) => (
  <div className={`stack ${isActive ? 'is-active' : ''}`}>
    <span className="stack-name">{name}</span>
    {data.length === 0 && <span className="stack-empty">empty</span>}
    <AnimatePresence>
      {data.map((val, idx) => (
        <motion.div
          key={idx}
          className="stack-item"
          initial={{ opacity: 0, y: -12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        >
          {String(val)}
          {idx === data.length - 1 && <span className="stack-top">← top</span>}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const RenderLinkedListNode = ({ name, data, isActive }) => {
  const value = data && data.val !== undefined ? data.val : data !== null ? data : 'null';
  return (
    <motion.div
      layout
      className={`node ${isActive ? 'is-active' : ''}`}
      animate={{ scale: isActive ? 1.06 : 1 }}
    >
      <span className="node-name">{name}</span>
      <span className="node-circle">{String(value)}</span>
      {value !== 'null' && <span className="node-link">→</span>}
    </motion.div>
  );
};

const RenderList = ({ name, data, isActive }) => (
  <div className={`structure-card ${isActive ? 'is-active' : ''}`}>
    <span className="structure-name">{name}</span>
    <div className="list-chips">
      {data.map((val, idx) => (
        <span key={idx} className="value-chip">
          {String(val)}
        </span>
      ))}
    </div>
  </div>
);

const RenderMap = ({ name, data, isActive }) => (
  <div className={`structure-card ${isActive ? 'is-active' : ''}`}>
    <span className="structure-name">{name}</span>
    <div className="map-rows">
      {Object.entries(data).map(([key, val]) => (
        <div key={key} className="map-row">
          <span className="map-key">{JSON.stringify(key)}:</span>
          <span className="map-value">{JSON.stringify(val)}</span>
        </div>
      ))}
    </div>
  </div>
);

const RenderPrimitive = ({ name, value, isActive, resultColor }) => (
  <motion.div
    layout
    className={`primitive-card ${isActive ? 'is-active' : ''}`}
    style={
      resultColor
        ? { borderColor: resultColor, background: `${resultColor}14` }
        : undefined
    }
  >
    <span className="primitive-name">{name}</span>
    <span
      className="primitive-value"
      style={resultColor ? { color: resultColor } : undefined}
    >
      {String(value)}
    </span>
  </motion.div>
);

// --- MAIN COMPONENT ---
const VisualTrace = ({ currentState }) => {
  if (!currentState) {
    return <div className="trace-empty">Initializing trace…</div>;
  }

  const {
    memory,
    activeTarget,
    isError,
    line,
    isReturn,
    returnValue,
    resultColor,
    resultLabel,
    status,
  } = currentState;

  if (isError) {
    return (
      <div className="trace-error">
        <AlertTriangle size={16} />
        <span>{status}</span>
      </div>
    );
  }

  const primitives = [];
  const nodes = [];
  const structures = [];
  const stacks = [];

  Object.entries(memory || {}).forEach(([name, val]) => {
    if (name.startsWith('__') || name === 'result') return;

    if (name.toLowerCase().includes('stack') && Array.isArray(val)) {
      stacks.push({ name, val });
      return;
    }

    const isNode =
      (val && val.class === 'ListNode') ||
      (val && val.type === 'object' && val.data && val.data.val !== undefined);

    if (isNode) nodes.push({ name, val: val.data || val });
    else if (Array.isArray(val)) structures.push({ name, val, isList: true });
    else if (typeof val === 'object' && val !== null)
      structures.push({ name, val, isList: false });
    else primitives.push({ name, val });
  });

  const returnType = Array.isArray(returnValue)
    ? 'LIST'
    : typeof returnValue === 'object'
    ? 'OBJECT'
    : typeof returnValue === 'number'
    ? 'NUMBER'
    : 'VALUE';

  const contextHint = isReturn ? getSmartContext(returnValue, memory) : null;

  return (
    <div className="trace">
      <div
        className={`trace-status ${isReturn ? 'is-return' : ''}`}
        style={
          isReturn && resultColor
            ? { borderColor: resultColor, background: `${resultColor}12` }
            : undefined
        }
      >
        <span className="trace-status-main">
          <span
            className="trace-status-dot"
            style={isReturn && resultColor ? { background: resultColor } : undefined}
          />
          <span
            className="trace-status-text"
            style={isReturn && resultColor ? { color: resultColor } : undefined}
          >
            {isReturn ? resultLabel : status}
          </span>
        </span>
        <span className="trace-line">line {line}</span>
      </div>

      {isReturn && (
        <motion.div
          className="trace-result"
          style={{ '--result-color': resultColor || '#8b5cf6' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="trace-result-type">{returnType}</span>
          <span className="trace-result-label">Final result</span>
          <div className="trace-result-value">{formatReturnValue(returnValue)}</div>

          {contextHint && (
            <motion.div
              className={`trace-result-hint ${
                contextHint.type === 'success' ? 'is-success' : ''
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {contextHint.msg}
            </motion.div>
          )}
        </motion.div>
      )}

      <div className={`trace-memory ${isReturn ? 'is-muted' : ''}`}>
        {stacks.length > 0 && (
          <div className="trace-stacks">
            {stacks.map((stack) => (
              <RenderStack
                key={stack.name}
                name={stack.name}
                data={stack.val}
                isActive={stack.name === activeTarget}
              />
            ))}
          </div>
        )}

        {nodes.length > 0 && (
          <div className="trace-nodes">
            {nodes.map((node) => (
              <RenderLinkedListNode
                key={node.name}
                name={node.name}
                data={node.val}
                isActive={node.name === activeTarget}
              />
            ))}
          </div>
        )}

        {primitives.length > 0 && (
          <div className="trace-primitives">
            {primitives.map((primitive) => (
              <RenderPrimitive
                key={primitive.name}
                name={primitive.name}
                value={primitive.val}
                isActive={primitive.name === activeTarget}
                resultColor={isReturn ? resultColor : null}
              />
            ))}
          </div>
        )}

        {structures.length > 0 && (
          <div className="trace-structures">
            {structures.map((structure) =>
              structure.isList ? (
                <RenderList
                  key={structure.name}
                  name={structure.name}
                  data={structure.val}
                  isActive={structure.name === activeTarget}
                />
              ) : (
                <RenderMap
                  key={structure.name}
                  name={structure.name}
                  data={structure.val}
                  isActive={structure.name === activeTarget}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTrace;
