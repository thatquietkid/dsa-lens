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
  description: <ValidParenthesesDescription />,
  
  // EXECUTION CONFIG
  entryFunction: "isValid",
  inputVariables: ["s"],

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

  // VISUALIZATION CONFIG
  visualData: {
    input: "()[]{}" 
  },

  // 🟢 NEW: PYTHON SCRIPT TO GENERATE STACK TRACE
  getTraceScript: (visualData) => {
    const inputStr = JSON.stringify(visualData.input);
    return `
import json
def trace_valid_parentheses(s):
    steps = []
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    steps.append({ "i": -1, "stack": [], "char": None, "status": "start" })
    
    for i, char in enumerate(s):
        # Step: Inspect Char
        steps.append({ "i": i, "stack": list(stack), "char": char, "status": "inspect" })
        
        if char in mapping:
            # Step: Attempt Pop
            steps.append({ "i": i, "stack": list(stack), "char": char, "status": "pop" })
            
            top = stack.pop() if stack else '#'
            
            if mapping[char] != top:
                # Step: Mismatch
                steps.append({ "i": i, "stack": list(stack), "char": char, "status": "error" })
                break
            else:
                 # Step: Match Found
                 steps.append({ "i": i, "stack": list(stack), "char": char, "status": "match" })
        else:
            stack.append(char)
            # Step: Push
            steps.append({ "i": i, "stack": list(stack), "char": char, "status": "push" })

    return json.dumps(steps)

trace_valid_parentheses(${inputStr})
`;
  },

  testCases: [
    { input: "s = \"()\"", expected: "True" },
    { input: "s = \"()[]{}\"", expected: "True" },
    { input: "s = \"(]\"", expected: "False" },
    { input: "s = \"([)]\"", expected: "False" },
    { input: "s = \"{[]}\"", expected: "True" }
  ]
};