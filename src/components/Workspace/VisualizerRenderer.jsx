import React, { useEffect, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  ScanLine,
} from 'lucide-react';
import VisualTrace from './VisualTrace';

const SPEEDS = [
  { label: 'Slow', value: 1200 },
  { label: 'Normal', value: 800 },
  { label: 'Fast', value: 300 },
];

const VisualizerRenderer = ({ traceSteps = [], onStepChange }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(800);

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

  useEffect(() => {
    if (traceSteps[currentStepIdx] && onStepChange) {
      onStepChange(traceSteps[currentStepIdx].line, traceSteps[currentStepIdx]);
    }
  }, [currentStepIdx, traceSteps, onStepChange]);

  useEffect(() => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  }, [traceSteps]);

  const handleReset = () => {
    setCurrentStepIdx(0);
    setIsPlaying(false);
  };

  const progress =
    traceSteps.length > 0 ? ((currentStepIdx + 1) / traceSteps.length) * 100 : 0;
  const atStart = currentStepIdx === 0;
  const atEnd = currentStepIdx >= traceSteps.length - 1;

  return (
    <div className="visualizer">
      <div className="visualizer-canvas">
        {traceSteps.length > 0 ? (
          <VisualTrace currentState={traceSteps[currentStepIdx]} />
        ) : (
          <div className="visualizer-empty">
            <span className="visualizer-empty-icon">
              <ScanLine size={18} />
            </span>
            <p>No trace yet</p>
            <span>
              Run your code and the variables, stacks and pointers will appear here
              step by step.
            </span>
          </div>
        )}
      </div>

      <div className="visualizer-controls">
        <div className="visualizer-track">
          <div className="visualizer-progress" style={{ width: `${progress}%` }} />
        </div>

        <div className="visualizer-row">
          <div className="step-counter">
            Step <strong>{traceSteps.length === 0 ? 0 : currentStepIdx + 1}</strong>
            <span> / {traceSteps.length || 0}</span>
          </div>

          <div className="player">
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => setCurrentStepIdx((prev) => Math.max(0, prev - 1))}
              disabled={atStart}
              aria-label="Previous step"
            >
              <ChevronLeft size={17} />
            </button>

            <button
              type="button"
              className={`play-btn ${isPlaying ? 'is-playing' : ''}`}
              onClick={() => setIsPlaying((prev) => !prev)}
              disabled={traceSteps.length === 0}
              aria-label={isPlaying ? 'Pause trace' : 'Play trace'}
            >
              {isPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>

            <button
              type="button"
              className="ctrl-btn"
              onClick={() => setCurrentStepIdx((prev) => Math.min(traceSteps.length - 1, prev + 1))}
              disabled={atEnd}
              aria-label="Next step"
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className="player-side">
            <button
              type="button"
              className="ctrl-btn"
              onClick={handleReset}
              title="Restart trace"
              aria-label="Restart trace"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        </div>

        <div className="speed-row" role="group" aria-label="Playback speed">
          {SPEEDS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`speed-btn ${speed === option.value ? 'is-active' : ''}`}
              onClick={() => setSpeed(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VisualizerRenderer;
