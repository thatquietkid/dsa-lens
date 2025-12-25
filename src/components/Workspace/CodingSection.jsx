import React from 'react';
import Editor from '@monaco-editor/react';

const CodingSpace = ({ code, onChange, onRun, loading }) => {
  
  const handleEditorChange = (value) => {
    // Call the parent's onChange handler (setCode)
    onChange(value || "");
  };

  return (
    <section className="editor-container" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div className="section-header editor-toolbar">
        <span className="lang-label">Python 3</span>
        
        <button 
          className="run-action-btn" 
          onClick={onRun} 
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? (
             // Simple Loading State
             <span>...</span>
          ) : (
             // Original Play Icon State
             <>
               <span className="play-icon">▶</span> Run
             </>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="editor-wrapper" style={{ flex: 1, position: 'relative' }}>
        <Editor 
          height="100%" 
          theme="vs-dark" 
          defaultLanguage="python" 
          value={code} 
          onChange={handleEditorChange}
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
    </section>
  );
};

export default CodingSpace;