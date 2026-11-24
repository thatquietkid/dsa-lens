import React from 'react';

const BinarySearchDescription = () => (
  <div className="problem-prose">
    <p>
      Given an array of integers <code>nums</code> sorted in ascending order and an integer{' '}
      <code>target</code>, return the index of <code>target</code> in <code>nums</code>. If it
      does not exist, return <code>-1</code>.
    </p>
    <p>
      You must write an algorithm with <strong>O(log n)</strong> runtime complexity.
    </p>

    <div className="example-card">
      <div className="example-title">Example 1</div>
      <div className="example-line">
        <span>Input</span>
        <code>nums = [-1, 0, 3, 5, 9, 12], target = 9</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>4</code>
      </div>
      <div className="example-line">
        <span>Explanation</span>
        <code>9 exists in nums at index 4.</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 2</div>
      <div className="example-line">
        <span>Input</span>
        <code>nums = [-1, 0, 3, 5, 9, 12], target = 2</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>-1</code>
      </div>
      <div className="example-line">
        <span>Explanation</span>
        <code>2 is not present, so return -1.</code>
      </div>
    </div>

    <div className="constraint-card">
      <h4>Constraints</h4>
      <ul>
        <li>
          <code>1 ≤ nums.length ≤ 10⁴</code>
        </li>
        <li>
          <code>-10⁴ &lt; nums[i], target &lt; 10⁴</code>
        </li>
        <li>All values in nums are unique and sorted in ascending order.</li>
      </ul>
    </div>
  </div>
);

export default {
  id: 'binary-search',
  title: '704. Binary Search',
  difficulty: 'Easy',
  type: 'array',
  description: <BinarySearchDescription />,

  entryFunction: 'search',
  inputVariables: ['nums', 'target'],

  approach: {
    title: 'Halve the search space',
    idea: 'Because the array is sorted, comparing the middle element with the target tells you which half can be discarded. Keep two boundary pointers and shrink the window until the target is found or the window is empty.',
    steps: [
      'Set left = 0 and right = len(nums) - 1.',
      'While left <= right, compute mid = (left + right) // 2.',
      'If nums[mid] equals target, return mid.',
      'If nums[mid] < target, move left to mid + 1.',
      'Otherwise move right to mid - 1. Return -1 if the window closes.',
    ],
    time: 'O(log n)',
    space: 'O(1)',
  },

  defaultCode: `def search(nums, target):
    # Write your solution here
    pass`,

  visualData: {
    nums: [-1, 0, 3, 5, 9, 12],
    target: 9,
  },

  testCases: [
    {
      nums: [-1, 0, 3, 5, 9, 12],
      target: 9,
      expected: 4,
    },
    {
      nums: [-1, 0, 3, 5, 9, 12],
      target: 2,
      expected: -1,
    },
    {
      nums: [5],
      target: 5,
      expected: 0,
    },
  ],
};
