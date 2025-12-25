import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react';
import VisualTrace from './VisualTrace';

// CHANGED: Accepts traceSteps directly from parent
const VisualizerRenderer = ({ traceSteps, visualData }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const timerRef = useRef(null);

  // Reset when new trace data arrives
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [traceSteps]);

  // Handle Playback Loop
  useEffect(() => {
    if (isPlaying && traceSteps && traceSteps.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < traceSteps.length - 1) return prev + 1;
          setIsPlaying(false);
          return prev;
        });
      }, 1500); 
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, traceSteps]);

  // Controls
  const handleNext = () => setCurrentStep(p => Math.min(p + 1, traceSteps.length - 1));
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 0));
  const handleReset = () => { setIsPlaying(false); setCurrentStep(0); };

  if (!traceSteps || traceSteps.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm italic">
        Run code to generate visualization
      </div>
    );
  }

  const currentState = traceSteps[currentStep];

    return (
    <div className="flex flex-col flex-1 min-h-0 bg-[#0f172a]">
        {/* SCROLLABLE CANVAS */}
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 relative">
        <VisualTrace 
          currentState={traceSteps[currentStep]} 
          nums={visualData.nums} 
          target={visualData.target}
          inputString={visualData.input} // <--- ADD THIS LINE
        />
        </div>

        {/* CONTROL BAR (ALWAYS VISIBLE) */}
        <div className="h-14 shrink-0 border-t border-white/10 bg-[#1e293b] flex items-center justify-between px-4">
        <div className="text-xs text-gray-400 font-mono">
            Step {currentStep + 1} / {traceSteps.length}
        </div>

        <div className="flex items-center gap-2">
            <button onClick={handleReset} className="p-2 hover:bg-white/10 rounded">
            <RotateCcw size={16} />
            </button>

            <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
            >
            <ChevronLeft size={20} />
            </button>

            <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPlaying ? 'bg-amber-500' : 'bg-green-500'
            }`}
            >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>

            <button
            onClick={handleNext}
            disabled={currentStep === traceSteps.length - 1}
            className="p-2 hover:bg-white/10 rounded disabled:opacity-30"
            >
            <ChevronRight size={20} />
            </button>
        </div>
        </div>
    </div>
    );
};

export default VisualizerRenderer;