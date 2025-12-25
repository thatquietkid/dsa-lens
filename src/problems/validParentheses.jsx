// src/problems/validParentheses.jsx
import React from "react";

const ValidParenthesesDescription = () => (
  <div>
    <p className="prob-text">
      Given a string <code>s</code> containing just the characters{" "}
      <code>'('</code>, <code>')'</code>, <code>'{'</code>, <code>'}'</code>,{" "}
      <code>'['</code> and <code>']'</code>, determine if the input string is
      valid.
    </p>

    <p className="prob-text">
      An input string is valid if:
    </p>

    <ul className="prob-text">
      <li>Open brackets must be closed by the same type of brackets.</li>
      <li>Open brackets must be closed in the correct order.</li>
      <li>Every close bracket has a corresponding open bracket.</li>
    </ul>

    <br />

    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>s = "()"</code>
      <br />
      <strong>Output:</strong> <code>true</code>
    </p>

    <br />

    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>s = "()[]{}"</code>
      <br />
      <strong>Output:</strong> <code>true</code>
    </p>

    <br />

    <h4 className="section-subtitle">Example 3:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>s = "(]"</code>
      <br />
      <strong>Output:</strong> <code>false</code>
    </p>

    <br />

    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li>
        <code>1 ≤ s.length ≤ 10⁴</code>
      </li>
      <li>
        <code>s</code> consists of parentheses only <code>()[]{"{}"}</code>
      </li>
    </ul>
  </div>
);

export default {
  id: "valid-parentheses",
  title: "20. Valid Parentheses",
  difficulty: "Easy",
  description: <ValidParenthesesDescription />,
  defaultCode: `def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)

    return not stack`,
  visualData: {
    input: "()[]{}",
    currentState: { index: 0, stack: [] }
  }
};
