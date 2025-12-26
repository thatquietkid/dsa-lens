import React from "react";

const BinarySearchDescription = () => (
  <div>
    <p className="prob-text">
      Given an array of integers <code>nums</code> which is sorted in ascending
      order, and an integer <code>target</code>, write a function to search
      <code>target</code> in <code>nums</code>.
    </p>

    <p className="prob-text">
      If <code>target</code> exists, then return its index. Otherwise, return{" "}
      <code>-1</code>.
    </p>

    <p className="prob-text">
      You must write an algorithm with <strong>O(log n)</strong> runtime
      complexity.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [-1,0,3,5,9,12]</code>, <code>target = 9</code><br />
      <strong>Output:</strong> <code>4</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [-1,0,3,5,9,12]</code>, <code>target = 2</code><br />
      <strong>Output:</strong> <code>-1</code>
    </p>
  </div>
);

export default {
  id: "binary-search",
  title: "704. Binary Search",
  difficulty: "Easy",
  type: "array", // 🟢 Uses default adapter (Array works natively)
  description: <BinarySearchDescription />,
  
  // 🟢 CONTRACT DEFINITION
  entryFunction: "search",
  inputVariables: ["nums", "target"],

  // 🟢 STANDARD PYTHON SOLUTION
  defaultCode: `def search(nums, target):
    left, right = 0, len(nums) - 1

    while left <= right:
        mid = (left + right) // 2
        
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1`,

  // 🟢 CLEAN VISUAL DATA
  visualData: {
    nums: [-1, 0, 3, 5, 9, 12],
    target: 9
  },
  
  // 🟢 CLEAN TEST CASES (Pure JSON)
  testCases: [
    {
      nums: [-1, 0, 3, 5, 9, 12],
      target: 9,
      expected: 4
    },
    {
      nums: [-1, 0, 3, 5, 9, 12],
      target: 2,
      expected: -1
    },
    {
      nums: [5],
      target: 5,
      expected: 0
    }
  ]
};