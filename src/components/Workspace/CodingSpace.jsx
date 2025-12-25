import React from 'react';
import Editor from '@monaco-editor/react';

const CodingSpace = ({ code, onChange, onRun, loading }) => {
  
  // 1. DEBUG: Check if props exist when component loads
  // If this doesn't print, the component isn't even rendering!
  if (!window.hasLoggedCodingSpace) {
      console.log("🛠 CodingSpace Rendered");
      console.log("   - onRun prop type:", typeof onRun);
      console.log("   - loading prop:", loading);
      window.hasLoggedCodingSpace = true;
  }

  const handleEditorChange = (value) => {
    onChange(value || "");
  };

  const handleButtonClick = (e) => {
    // 2. DEBUG: Check if the click event is captured
    console.log("🖱️ Button Clicked!");
    
    if (loading) {
        console.warn("⚠️ Button is disabled because loading=true");
        return;
    }

    if (typeof onRun === 'function') {
        console.log("✅ Calling parent onRun function...");
        onRun();
    } else {
        console.error("❌ onRun prop is missing or not a function!");
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e] relative">
      
      {/* 3. FIX: Added z-index-20 relative to ensure button sits ABOVE everything */}
      <div className="h-10 flex-shrink-0 flex items-center justify-between px-4 border-b border-[#333] bg-[#1e1e1e] relative z-20">
        
        {/* Left: Language Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]"></span>
          <span className="text-xs font-medium text-gray-300 tracking-wide">PYTHON 3</span>
        </div>

        {/* Right: Run Button */}
        <button 
          onClick={handleButtonClick}
          // We removed 'disabled={loading}' from the DOM element temporarily 
          // to allow the click handler to fire and tell us WHY it's not running.
          className={`
            group relative flex items-center gap-2 px-4 py-1.5 
            border rounded-md transition-all duration-200 
            text-xs font-semibold uppercase tracking-wider
            z-30 cursor-pointer
            ${loading 
                ? 'bg-gray-700/50 border-gray-600 text-gray-400' 
                : 'bg-emerald-600/10 hover:bg-emerald-600/20 border-emerald-600/50 hover:border-emerald-500 text-emerald-400 hover:text-emerald-300'}
          `}
        >
          {loading ? (
             <span className="animate-pulse">Engine Loading...</span>
          ) : (
            <>
             <span className="text-lg leading-none">▶</span>
             <span>Run Code</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-0 z-10">
        <Editor 
          height="100%" 
          width="100%"
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
    </div>
  );
};

export default CodingSpace;