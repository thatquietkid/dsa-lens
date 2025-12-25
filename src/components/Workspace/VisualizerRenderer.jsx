// src/components/Workspace/VisualizerRenderer.jsx
import React from 'react';

// 1. Import your existing component (The "Two Sum" specific one)
import VisualTrace from './VisualTrace';

// 2. Define/Import other visualizers for other problems
const BinarySearchVisualizer = ({ nums, currentState }) => {
  const { left, right, mid } = currentState;
  return (
    <div className="visual-stage-compact text-white">
      {/* Binary Search specific UI */}
      <div>Looking for target in range [{left}, {right}]</div>
      <div>Midpoint: Index {mid} (Value: {nums[mid]})</div>
    </div>
  );
};

const StackVisualizer = ({ currentState }) => (
    <div className="text-white">Stack Size: {currentState.stack.length}</div>
);

// 3. The Manager Component
const VisualizerRenderer = ({ problemId, visualData }) => {
  
  // Decide which component to render based on the ID
  switch (problemId) {
    case 'two-sum':
      // Use your EXISTING VisualTrace component here
      return (
        <VisualTrace 
          nums={visualData.nums} 
          currentState={visualData.currentState} 
        />
      );

    case 'binary-search':
      return (
        <BinarySearchVisualizer 
          nums={visualData.nums} 
          currentState={visualData.currentState} 
        />
      );

    case 'valid-parentheses':
      return <StackVisualizer currentState={visualData.currentState} />;

    default:
      return <div className="text-gray-500">No visualization available</div>;
  }
};

export default VisualizerRenderer;