// src/utils/resultAnalyzer.js

/**
 * Analyzes the return value of a user's function to determine
 * the appropriate label, color, and mood for the UI.
 * * @param {any} val - The return value from the Python execution
 * @returns {object} - { mood, label, color }
 */
export const analyzeResult = (val) => {
  // 1. Booleans (True/False)
  if (val === true) return { mood: 'success', label: 'True', color: '#22c55e' }; // Green
  if (val === false) return { mood: 'failure', label: 'False', color: '#ef4444' }; // Red
  
  // 2. Lists (Empty vs Non-Empty)
  if (Array.isArray(val)) {
      if (val.length === 0) return { mood: 'neutral', label: 'Empty List', color: '#64748b' }; // Gray
      return { mood: 'neutral', label: `List [${val.length} items]`, color: '#3b82f6' }; // Blue
  }
  
  // 3. Numbers (Specific Logic for Search Problems)
  if (typeof val === 'number') {
      // Standard convention: -1 often means "Not Found"
      if (val === -1) return { mood: 'failure', label: 'Not Found (-1)', color: '#ef4444' }; // Red
      return { mood: 'success', label: `Index Found: ${val}`, color: '#22c55e' }; // Green
  }

  // 4. Null/None
  if (val === null) return { mood: 'neutral', label: 'None', color: '#64748b' };

  // 5. Default Fallback
  return { mood: 'neutral', label: 'Result Generated', color: '#3b82f6' };
};