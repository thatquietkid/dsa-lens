// src/problems/twoSum.jsx
import React from "react";

const TwoSumDescription = () => (
  <div>
    <p className="prob-text">
      Given an array of integers <code>nums</code> and an integer <code>target</code>,
      return <strong>indices</strong> of the two numbers such that they add up to{" "}
      <code>target</code>.
    </p>
    <p className="prob-text">
      You may assume that each input would have <strong>exactly one solution</strong>,
      and you may not use the same element twice.
    </p>
    <p className="prob-text">
      You can return the answer in <strong>any order</strong>.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [2, 7, 11, 15]</code>,{" "}
      <code>target = 9</code>
      <br />
      <strong>Output:</strong> <code>[0, 1]</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [3, 2, 4]</code>,{" "}
      <code>target = 6</code>
      <br />
      <strong>Output:</strong> <code>[1, 2]</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>2 ≤ nums.length ≤ 10⁴</code></li>
      <li><code>-10⁹ ≤ nums[i] ≤ 10⁹</code></li>
      <li><code>-10⁹ ≤ target ≤ 10⁹</code></li>
    </ul>
  </div>
);

export default {
  id: "two-sum",
  title: "1. Two Sum",
  difficulty: "Easy",
  type: "array",          // Uses 'default' adapter in Workspace (no conversion needed)
  description: <TwoSumDescription />,
  
  // 🟢 CONTRACT definition
  entryFunction: "twoSum",
  inputVariables: ["nums", "target"],

  // 🟢 OPTIMAL SOLUTION (Shows off Map visualization)
  defaultCode: `def twoSum(nums, target):
    seen = {}  # Map value -> index
    
    for i, num in enumerate(nums):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    nums: [2, 7, 11, 15],
    target: 9
  },

  // 🟢 CLEAN DATA for Test Runner (No Python strings!)
  testCases: [
    { 
      nums: [2, 7, 11, 15],
      target: 9,
      expected: [0, 1] 
    },
    { 
      nums: [3, 2, 4],
      target: 6,
      expected: [1, 2] 
    },
    { 
      nums: [3, 3],
      target: 6,
      expected: [0, 1] 
    }
  ]
};