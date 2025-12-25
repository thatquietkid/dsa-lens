// src/problems/reverseList.jsx
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
      <strong>Input:</strong> <code>head = [1,2,3,4,5]</code>
      <br />
      <strong>Output:</strong> <code>[5,4,3,2,1]</code>
    </p>

    <br />

    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>head = [1,2]</code>
      <br />
      <strong>Output:</strong> <code>[2,1]</code>
    </p>

    <br />

    <h4 className="section-subtitle">Example 3:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>head = []</code>
      <br />
      <strong>Output:</strong> <code>[]</code>
    </p>

    <br />

    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li>
        <code>0 ≤ number of nodes ≤ 5000</code>
      </li>
      <li>
        <code>-5000 ≤ Node.val ≤ 5000</code>
      </li>
    </ul>

    <br />

    <p className="prob-text">
      <strong>Follow-up:</strong> Can you reverse the linked list both
      iteratively and recursively?
    </p>
  </div>
);

export default {
  id: "reverse-linked-list",
  title: "206. Reverse Linked List",
  difficulty: "Easy",
  description: <ReverseListDescription />,
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
    list: [1, 2, 3, 4, 5],
    currentState: { prev: null, curr: 1, next: 2 }
  }
};
