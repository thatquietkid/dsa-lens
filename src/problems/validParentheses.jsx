// src/problems/validParentheses.jsx
import React from "react";

const ValidParenthesesDescription = () => (
  <div>
    <p className="prob-text">
  Given a string <code>s</code> containing just the characters{" "}
  <code>(</code>, <code>)</code>, <code>{'{'}</code>, <code>{'}'}</code>,{" "}
  <code>[</code> and <code>]</code>, determine if the input string is valid.
</p>


    <p className="prob-text">An input string is valid if:</p>

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
  type: "stack", // Falls back to default adapter (Lists work natively)
  description: <ValidParenthesesDescription />,
  
  // 🟢 CONTRACT DEFINITION
  entryFunction: "isValid",
  inputVariables: ["s"],

  // 🟢 STANDARD PYTHON SOLUTION
  defaultCode: `def isValid(s):
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}

    for char in s:
        if char in mapping:
            # Pop the top element if stack is not empty, else assign a dummy value
            top_element = stack.pop() if stack else '#'
            
            # The mapping for the closing bracket must match the popped element
            if mapping[char] != top_element:
                return False
        else:
            # We have an opening bracket, push it onto the stack
            stack.append(char)

    # If the stack is empty, then it is a valid string
    return not stack`,

  // 🟢 CLEAN VISUAL DATA (Matches inputVariables)
  visualData: {
    s: "()[]{}" 
  },

  // 🟢 CLEAN TEST CASES (Pure JSON)
  testCases: [
    { s: "()", expected: true },
    { s: "()[]{}", expected: true },
    { s: "(]", expected: false },
    { s: "([)]", expected: false },
    { s: "{[]}", expected: true }
  ]
};