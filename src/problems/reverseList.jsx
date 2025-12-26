import React from "react";

const ReverseListDescription = () => (
  <div>
    <p className="prob-text">
      Given the <code>head</code> of a singly linked list, reverse the list, and
      return the reversed list.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>head = [1,2,3,4,5]</code><br />
      <strong>Output:</strong> <code>[5,4,3,2,1]</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>head = [1,2]</code><br />
      <strong>Output:</strong> <code>[2,1]</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>0 ≤ number of nodes ≤ 5000</code></li>
      <li><code>-5000 ≤ Node.val ≤ 5000</code></li>
    </ul>
  </div>
);

export default {
  id: "reverse-linked-list",
  title: "206. Reverse Linked List",
  difficulty: "Easy",
  type: "linked-list",
  description: <ReverseListDescription />,
  
  // 🟢 CLEAN CONFIGURATION
  // We use the real function name. The Workspace maps this to the wrapper automatically.
  entryFunction: "reverseList",
  inputVariables: ["head"],

  defaultCode: `def reverseList(head):
    prev = None
    curr = head

    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt

    return prev`,

  visualData: {
    head: [1, 2, 3, 4, 5] 
  },

  // 🟢 CLEAN TEST CASES (Data Only, No Python Code)
  testCases: [
    {
      head: [1, 2, 3, 4, 5],
      expected: [5, 4, 3, 2, 1]
    },
    {
      head: [1, 2],
      expected: [2, 1]
    },
    {
      head: [],
      expected: []
    }
  ]
};