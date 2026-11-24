// src/problems/functionalPipeline.jsx
import React from "react";

const FunctionalPipelineDescription = () => (
  <div>
    <p className="prob-text">
      You are given a list of integers <code>nums</code> and a sequence of
      processing steps <code>steps</code>. Apply the steps <strong>in the given
      order</strong>, each one working on the result of the previous step, and
      return the final result. Use <code>map</code>, <code>filter</code> and{" "}
      <code>functools.reduce</code> with <code>lambda</code> functions.
    </p>

    <p className="prob-text">
      Each step is a string such as <code>"MAP_ADD 3"</code> or{" "}
      <code>"FILTER_EVEN"</code>. <code>k</code> is an integer (it can be
      negative).
    </p>

    <br />
    <h4 className="section-subtitle">Steps:</h4>
    <ul className="prob-text">
      <li><code>MAP_ADD k</code> — add <code>k</code> to every element</li>
      <li><code>MAP_MUL k</code> — multiply every element by <code>k</code></li>
      <li><code>MAP_SQUARE</code> — replace every element by its square</li>
      <li>
        <code>FILTER_EVEN</code> / <code>FILTER_ODD</code> — keep only even /
        only odd elements (negative numbers included)
      </li>
      <li>
        <code>FILTER_GT k</code> / <code>FILTER_LT k</code> — keep only elements
        strictly greater / strictly smaller than <code>k</code>
      </li>
      <li>
        <code>REDUCE_SUM</code> — replace the list by the sum of its elements
        (empty list gives <code>0</code>)
      </li>
      <li>
        <code>REDUCE_PROD</code> — replace the list by the product of its
        elements (empty list gives <code>1</code>)
      </li>
      <li>
        <code>REDUCE_MAX</code> / <code>REDUCE_MIN</code> — replace the list by
        its largest / smallest element (empty list gives the string{" "}
        <code>"EMPTY"</code>)
      </li>
    </ul>

    <p className="prob-text">
      A <code>REDUCE_*</code> step, if present, is always the{" "}
      <strong>last</strong> step. If the last step is a reduce, return its
      single result (a number, or <code>"EMPTY"</code>). Otherwise return the
      final list (<code>[]</code> when it is empty).
    </p>

    <p className="prob-text">
      <strong>Design hint:</strong> write a higher-order function that receives
      the step name and <code>k</code> and <em>returns</em> the function that
      performs that step.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [1, 2, 3, 4, 5, 6]</code>,{" "}
      <code>{'steps = ["MAP_MUL 3", "FILTER_GT 6"]'}</code>
      <br />
      <strong>Output:</strong> <code>[9, 12, 15, 18]</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [4, 5, 6]</code>,{" "}
      <code>{'steps = ["MAP_ADD 1", "REDUCE_SUM"]'}</code>
      <br />
      <strong>Output:</strong> <code>18</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>0 ≤ nums.length</code> (the list may be empty)</li>
      <li><code>0 ≤ steps.length ≤ 20</code></li>
      <li>Values and results fit in Python integers (no overflow concerns)</li>
    </ul>
  </div>
);

export default {
  id: "functional-pipeline",
  title: "4. Functional Pipeline",
  difficulty: "Medium",
  type: "array",
  description: <FunctionalPipelineDescription />,

  // 🟢 CONTRACT definition
  entryFunction: "runPipeline",
  inputVariables: ["nums", "steps"],

  // 🟢 STARTER CODE (Students write their own solution)
  defaultCode: `def runPipeline(nums, steps):
    # Write your solution here
    pass`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    nums: [1, 2, 3, 4, 5, 6],
    steps: ["MAP_MUL 3", "FILTER_GT 6"]
  },

  // 🟢 CLEAN DATA for Test Runner
  testCases: [
    { nums: [1, 2, 3, 4, 5, 6], steps: ["MAP_MUL 3", "FILTER_GT 6"], expected: [9, 12, 15, 18] },
    { nums: [4, 5, 6], steps: ["MAP_ADD 1", "REDUCE_SUM"], expected: 18 },
    { nums: [], steps: ["REDUCE_MAX"], expected: "EMPTY" },
    { nums: [], steps: ["REDUCE_PROD"], expected: 1 },
    { nums: [], steps: ["REDUCE_SUM"], expected: 0 },
    { nums: [-3, -2, -1, 0, 1, 2, 3], steps: ["FILTER_ODD", "MAP_SQUARE"], expected: [9, 1, 1, 9] },
    { nums: [-3, -2, -1, 0, 1, 2, 3], steps: ["FILTER_EVEN", "REDUCE_MIN"], expected: -2 },
    { nums: [5, 1, 4], steps: ["FILTER_LT -1", "REDUCE_MIN"], expected: "EMPTY" },
    { nums: [2, 3, 4], steps: ["MAP_ADD -2", "REDUCE_PROD"], expected: 0 },
    { nums: [1, 2, 3], steps: [], expected: [1, 2, 3] },
    { nums: [7, 8, 9, 10], steps: ["FILTER_GT 8", "MAP_MUL -1", "REDUCE_MAX"], expected: -9 }
  ]
};