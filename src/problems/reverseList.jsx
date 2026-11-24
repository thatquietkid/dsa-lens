import React from 'react';

const ReverseListDescription = () => (
  <div className="problem-prose">
    <p>
      Given the <code>head</code> of a singly linked list, reverse the list and return the new
      head.
    </p>
    <p>
      The list is built from <code>ListNode</code> objects with a <code>val</code> and a{' '}
      <code>next</code> pointer.
    </p>

    <div className="example-card">
      <div className="example-title">Example 1</div>
      <div className="example-line">
        <span>Input</span>
        <code>head = [1, 2, 3, 4, 5]</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>[5, 4, 3, 2, 1]</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 2</div>
      <div className="example-line">
        <span>Input</span>
        <code>head = [1, 2]</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>[2, 1]</code>
      </div>
    </div>

    <div className="example-card">
      <div className="example-title">Example 3</div>
      <div className="example-line">
        <span>Input</span>
        <code>head = []</code>
      </div>
      <div className="example-line">
        <span>Output</span>
        <code>[]</code>
      </div>
    </div>

    <div className="constraint-card">
      <h4>Constraints</h4>
      <ul>
        <li>
          <code>0 ≤ number of nodes ≤ 5000</code>
        </li>
        <li>
          <code>-5000 ≤ Node.val ≤ 5000</code>
        </li>
      </ul>
    </div>
  </div>
);

export default {
  id: 'reverse-linked-list',
  title: '206. Reverse Linked List',
  difficulty: 'Easy',
  type: 'linked-list',
  description: <ReverseListDescription />,

  entryFunction: 'reverseList',
  inputVariables: ['head'],

  approach: {
    title: 'Iterative pointer reversal',
    idea: 'Walk the list once while keeping three pointers: the previous node, the current node, and the next node. Before changing curr.next, save the rest of the list so the walk can continue.',
    steps: [
      'Start with prev = None and curr = head.',
      'Save nxt = curr.next so the remaining list is not lost.',
      'Point curr.next backwards at prev.',
      'Advance prev to curr and curr to nxt.',
      'When curr becomes None, prev is the new head.',
    ],
    time: 'O(n)',
    space: 'O(1)',
  },

  defaultCode: `def reverseList(head):
    # Write your solution here
    pass`,

  visualData: {
    head: [1, 2, 3, 4, 5],
  },

  testCases: [
    {
      head: [1, 2, 3, 4, 5],
      expected: [5, 4, 3, 2, 1],
    },
    {
      head: [1, 2],
      expected: [2, 1],
    },
    {
      head: [],
      expected: [],
    },
  ],
};
