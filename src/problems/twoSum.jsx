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
      <br />
      <strong>Explanation:</strong> Because <code>nums[0] + nums[1] == 9</code>,
      we return <code>[0, 1]</code>.
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

    <h4 className="section-subtitle">Example 3:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>nums = [3, 3]</code>,{" "}
      <code>target = 6</code>
      <br />
      <strong>Output:</strong> <code>[0, 1]</code>
    </p>

    <br />

    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li>
        <code>2 ≤ nums.length ≤ 10⁴</code>
      </li>
      <li>
        <code>-10⁹ ≤ nums[i] ≤ 10⁹</code>
      </li>
      <li>
        <code>-10⁹ ≤ target ≤ 10⁹</code>
      </li>
      <li>
        <strong>Only one valid answer exists.</strong>
      </li>
    </ul>

    <br />

    <p className="prob-text">
      <strong>Follow-up:</strong> Can you come up with an algorithm that runs in
      less than <code>O(n²)</code> time complexity?
    </p>
  </div>
);

export default {
  id: "two-sum",
  title: "1. Two Sum",
  difficulty: "Easy",
  description: <TwoSumDescription />,
  defaultCode: `def twoSum(nums, target):
    # Write your solution here
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
  visualData: {
    nums: [2, 7, 11, 15],
    currentState: { i: 0, seen: {}, complement: 7 }
  }
};
