// src/components/Workspace/CodingSpace.jsx
import React from 'react';
import Editor from '@monaco-editor/react';

const CodingSpace = ({ code, onChange }) => {
  
  const handleEditorChange = (value) => {
    // Call the parent's onChange handler (setCode)
    onChange(value);
  };

  return (
    <section className="editor-container">
      {/* Toolbar */}
      <div className="section-header editor-toolbar">
        <span className="lang-label">Python 3</span>
        <button className="run-action-btn">
          <span className="play-icon">▶</span> Run
        </button>
      </div>

      {/* Editor Area */}
      <div className="editor-wrapper">
        <Editor 
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