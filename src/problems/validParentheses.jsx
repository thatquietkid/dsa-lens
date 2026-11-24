import React from 'react';

const ValidParenthesesDescription = () => (
  <div className="problem-prose">
    <p>
      Given a string <code>s</code> containing just the characters <code>(</code>,{' '}
      <code>)</code>, <code>{'{'}</code>, <code>{'}'}</code>, <code>[</code> and <code>]</code>,
      determine if the input string is valid.
    </p>
    <p>An input string is valid if:</p>
    <ul>
      <li>Open brackets are closed by the same type of bracket.</li>
      <li>Open brackets are closed in the correct order.</li>
      <li>Every closing bracket has a corresponding opening bracket.</li>
    </ul>

    <div className="example-card">
      <div className="example-title">Example 1</div>
      <div className="example-line">
        <span>Input</span>
        <code>s = "()"</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>true</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 2</div>
      <div className="example-line">
        <span>Input</span>
        <code>s = "()[]{"{}"}"</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>true</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 3</div>
      <div className="example-line">
        <span>Input</span>
        <code>s = "(]"</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>false</code>
      </div>
    </div>

    <div className="constraint-card">
      <h4>Constraints</h4>
      <ul>
        <li>
          <code>1 ≤ s.length ≤ 10⁴</code>
        </li>
        <li>
          <code>s</code> consists of parentheses only: <code>()[]{}</code>
        </li>
      </ul>
    </div>
  </div>
);

export default {
  id: 'valid-parentheses',
  title: '20. Valid Parentheses',
  difficulty: 'Easy',
  type: 'stack',
  description: <ValidParenthesesDescription />,

  entryFunction: 'isValid',
  inputVariables: ['s'],

  approach: {
    title: 'Stack of open brackets',
    idea: 'A closing bracket must match the most recent unmatched opening bracket. A stack gives exactly that last-in-first-out behavior: push every opening bracket, and on every closing bracket compare it with the top of the stack.',
    steps: [
      'Map every closing bracket to its matching opening bracket.',
      'Iterate through the characters of s.',
      'For an opening bracket, push it onto the stack.',
      'For a closing bracket, pop the stack and compare. If the stack is empty or the pair does not match, return false.',
      'After the loop, the string is valid only when the stack is empty.',
    ],
    time: 'O(n)',
    space: 'O(n)',
  },

  defaultCode: `def isValid(s):
    # Write your solution here
    pass`,

  visualData: {
    s: '()[]{}',
  },

  testCases: [
    { s: '()', expected: true },
    { s: '()[]{}', expected: true },
    { s: '(]', expected: false },
    { s: '([)]', expected: false },
    { s: '{[]}', expected: true },
  ],
};
