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
  description: <BinarySearchDescription />,
  
  // 1. EXECUTION CONFIG
  entryFunction: "search",
  inputVariables: ["nums", "target"],

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

  // 2. VISUALIZATION DATA
  visualData: {
    nums: [-1, 0, 3, 5, 9, 12],
    target: 9
  },
  
  // 3. TRACE SCRIPT
  getTraceScript: (visualData) => {
    const nums = JSON.stringify(visualData.nums);
    const target = visualData.target;
    return `
import json
def trace_binary_search(nums, target):
    steps = []
    left, right = 0, len(nums) - 1
    
    # Initial State
    steps.append({
        "left": left, "right": right, "mid": -1, 
        "val": None, "status": "start"
    })

    while left <= right:
        mid = (left + right) // 2
        
        # Step: Calculate Mid
        steps.append({
            "left": left, "right": right, "mid": mid, 
            "val": nums[mid], "status": "calc_mid"
        })

        if nums[mid] == target:
            # Step: Found
            steps.append({
                "left": left, "right": right, "mid": mid, 
                "val": nums[mid], "status": "found"
            })
            break
        elif nums[mid] < target:
            # Step: Move Right
            left = mid + 1
            steps.append({
                "left": left, "right": right, "mid": mid, 
                "val": nums[mid], "status": "go_right"
            })
        else:
            # Step: Move Left
            right = mid - 1
            steps.append({
                "left": left, "right": right, "mid": mid, 
                "val": nums[mid], "status": "go_left"
            })

    return json.dumps(steps)

trace_binary_search(${nums}, ${target})
`;
  },

  // 4. TEST CASES
  testCases: [
    {
      input: "nums = [-1,0,3,5,9,12]\ntarget = 9",
      expected: "4"
    },
    {
      input: "nums = [-1,0,3,5,9,12]\ntarget = 2",
      expected: "-1"
    },
    {
      input: "nums = [5]\ntarget = 5",
      expected: "0"
    }
  ]
};