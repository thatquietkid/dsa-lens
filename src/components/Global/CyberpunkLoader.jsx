import React, { useEffect, useState } from 'react';

const CyberpunkLoader = () => {
  const [progress, setProgress] = useState(0);
  const [logIndex, setLogIndex] = useState(0);

  const logs = [
    "INITIALIZING KERNEL...",
    "LOADING NEURAL ENGINE...",
    "ALLOCATING WASM HEAP...",
    "CONNECTING TO MATRIX...",
    "SYSTEM READY."
  ];

  // Simulate progress bar and logs
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(timer);
          return 100;
        }
        // Random jumps for "hacking" feel
        return Math.min(old + Math.random() * 15, 100);
      });
    }, 200);

    const logTimer = setInterval(() => {
        setLogIndex(prev => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 800);

    return () => {
        clearInterval(timer);
        clearInterval(logTimer);
    };
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: '#030305', zIndex: 9999,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Courier New", Courier, monospace', color: '#00f3ff'
    }}>
      
      {/* 1. THE GLITCH LOGO FILL EFFECT */}
      <div style={{ position: 'relative', marginBottom: '40px' }}>
        {/* Background Layer (Dim) */}
        <h1 style={{ 
            fontSize: '60px', fontWeight: '900', letterSpacing: '8px', 
            color: '#1e293b', margin: 0, position: 'relative' 
        }}>
          DSA LENS
        </h1>

        {/* Foreground Layer (Neon Fill) - Clipped to width based on progress */}
        <h1 style={{ 
            fontSize: '60px', fontWeight: '900', letterSpacing: '8px', 
            color: '#00f3ff', margin: 0, 
            position: 'absolute', top: 0, left: 0,
            width: `${progress}%`, overflow: 'hidden', whiteSpace: 'nowrap',
            textShadow: '0 0 20px rgba(0, 243, 255, 0.8)',
            transition: 'width 0.2s ease-out'
        }}>
          DSA LENS
        </h1>
        
        {/* Scanner Line Animation */}
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
            background: 'rgba(255, 255, 255, 0.5)',
            boxShadow: '0 0 10px white',
            animation: 'scan 2s linear infinite'
        }} />
      </div>

      {/* 2. PROGRESS BAR */}
      <div style={{ 
          width: '300px', height: '4px', background: '#1e293b', 
          borderRadius: '2px', overflow: 'hidden', marginBottom: '15px',
          boxShadow: '0 0 10px rgba(0, 243, 255, 0.2)'
      }}>
        <div style={{ 
            height: '100%', width: `${progress}%`, 
            background: '#00f3ff', 
            transition: 'width 0.2s ease-out',
            boxShadow: '0 0 15px #00f3ff'
        }} />
      </div>

      {/* 3. SYSTEM LOGS */}
      <div style={{ 
          height: '20px', fontSize: '12px', letterSpacing: '2px', 
          opacity: 0.8, textTransform: 'uppercase' 
      }}>
        {`> ${logs[logIndex]}`} <span style={{ animation: 'blink 1s infinite' }}>_</span>
      </div>

      {/* GLOBAL STYLES FOR ANIMATION */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CyberpunkLoader;