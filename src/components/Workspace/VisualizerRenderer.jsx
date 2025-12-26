import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import VisualTrace from './VisualTrace';

const VisualizerRenderer = ({ traceSteps = [], onStepChange }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

  // Auto-play logic
  useEffect(() => {
    let timer;
    if (isPlaying && currentStepIdx < traceSteps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStepIdx((prev) => prev + 1);
      }, speed);
    } else {
      setIsPlaying(false);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIdx, traceSteps.length, speed]);

  // Sync step changes to the editor highlight
  useEffect(() => {
    if (traceSteps[currentStepIdx] && onStepChange) {
      onStepChange(traceSteps[currentStepIdx].line);
    }
  }, [currentStepIdx, traceSteps, onStepChange]);

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const progress = traceSteps.length > 0 
    ? ((currentStepIdx + 1) / traceSteps.length) * 100 
    : 0;

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: '#0f172a' 
    }}>
      
      {/* 1. VISUALIZATION CANVAS */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {traceSteps.length > 0 ? (
          <VisualTrace currentState={traceSteps[currentStepIdx]} />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            color: '#475569',
            fontSize: '13px',
            textAlign: 'center',
            padding: '40px'
          }}>
            Run the engine to generate <br/> the memory trace.
          </div>
        )}
      </div>

      {/* 2. CONTROL BAR (Modern Player UI) */}
      <div style={{ 
        padding: '20px', 
        background: '#111827', 
        borderTop: '1px solid #1f2937',
        boxShadow: '0 -10px 20px rgba(0,0,0,0.2)'
      }}>
        
        {/* Progress Bar */}
        <div style={{ 
          height: '4px', 
          width: '100%', 
          background: '#1e293b', 
          borderRadius: '2px', 
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            width: `${progress}%`, 
            height: '100%', 
            background: '#22d3ee', 
            boxShadow: '0 0 10px #22d3ee',
            transition: 'width 0.3s ease' 
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Step Counter */}
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', fontFamily: 'monospace' }}>
            STEP <span style={{ color: '#fff' }}>{currentStepIdx + 1}</span> / {traceSteps.length || 0}
          </div>

          {/* Player Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
              disabled={currentStepIdx === 0}
              style={controlButtonStyle}
            >
              <ChevronLeft size={18} />
            </button>

            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              style={{ 
                ...controlButtonStyle, 
                background: '#22d3ee', 
                color: '#000', 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%',
                boxShadow: isPlaying ? '0 0 20px rgba(34,211,238,0.4)' : 'none'
              }}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
            </button>

            <button 
              onClick={() => setCurrentStepIdx(prev => Math.min(traceSteps.length - 1, prev + 1))}
              disabled={currentStepIdx === traceSteps.length - 1}
              style={controlButtonStyle}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Extra Actions */}
          <button 
            onClick={handleReset}
            style={{ ...controlButtonStyle, padding: '5px' }}
            title="Reset Trace"
          >
            <RotateCcw size={16} />
          </button>
        </div>

        {/* Speed Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
            {[1200, 800, 300].map((s, idx) => (
                <button 
                    key={s}
                    onClick={() => setSpeed(s)}
                    style={{
                        fontSize: '9px',
                        fontWeight: 'bold',
                        color: speed === s ? '#22d3ee' : '#475569',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        letterSpacing: '1px'
                    }}
                >
                    {idx === 0 ? 'SLOW' : idx === 1 ? 'NORMAL' : 'FAST'}
                </button>
            ))}
        </div>
      </div>
    </div>
  );
};

// Common style for control buttons
const controlButtonStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: 'none',
  color: '#fff',
  borderRadius: '8px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  padding: '8px'
};

export default VisualizerRenderer;