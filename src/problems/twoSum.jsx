import React from 'react';

const TwoSumDescription = () => (
  <div className="problem-prose">
    <p>
      Given an array of integers <code>nums</code> and an integer <code>target</code>, return
      the indices of the two numbers such that they add up to <code>target</code>.
    </p>
    <p>
      You may assume that each input has <strong>exactly one solution</strong>, and you may not
      use the same element twice. You can return the answer in any order.
    </p>

    <div className="example-card">
      <div className="example-title">Example 1</div>
      <div className="example-line">
        <span>Input</span>
        <code>nums = [2, 7, 11, 15], target = 9</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>[0, 1]</code>
      </div>
      <div className="example-line">
        <span>Explanation</span>
        <code>nums[0] + nums[1] == 9, so we return [0, 1].</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 2</div>
      <div className="example-line">
        <span>Input</span>
        <code>nums = [3, 2, 4], target = 6</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>[1, 2]</code>
      </div>
    </div>

    <div className="constraint-card">
      <h4>Constraints</h4>
      <ul>
        <li>
          <code>2 ≤ nums.length ≤ 10⁴</code>
        </li>
        <li>
          <code>-10⁹ ≤ nums[i] ≤ 10⁹</code>
        </li>
        <li>
          <code>-10⁹ ≤ target ≤ 10⁹</code>
        </li>
        <li>Only one valid answer exists.</li>
      </ul>
    </div>
  </div>
);

export default {
  id: 'two-sum',
  title: '1. Two Sum',
  difficulty: 'Easy',
  type: 'array',
  description: <TwoSumDescription />,

  entryFunction: 'twoSum',
  inputVariables: ['nums', 'target'],

  approach: {
    title: 'Hash map lookup',
    idea: 'Scan the array once and keep the values you have already seen in a hash map, keyed by value. For every number, the only partner that completes the target is target - num. If that partner is already in the map, you have the answer.',
    steps: [
      'Create an empty map from value to index.',
      'For each index i and value num, compute complement = target - num.',
      'If complement is already in the map, return [seen[complement], i].',
      'Otherwise store seen[num] = i and continue.',
    ],
    time: 'O(n)',
    space: 'O(n)',
  },

  defaultCode: `def twoSum(nums, target):
    # Write your solution here
    pass`,

  visualData: {
    nums: [2, 7, 11, 15],
    target: 9,
  },

  testCases: [
    {
      nums: [2, 7, 11, 15],
      target: 9,
      expected: [0, 1],
    },
    {
      nums: [3, 2, 4],
      target: 6,
      expected: [1, 2],
    },
    {
      nums: [3, 3],
      target: 6,
      expected: [0, 1],
    },
  ],
};
