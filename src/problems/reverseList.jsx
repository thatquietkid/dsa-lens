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

// 1. HELPER SCRIPT with Wrapper
// We define a wrapper that runs the user code AND formats the output
const LIST_NODE_HELPER = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def create_list(arr):
    dummy = ListNode(0)
    curr = dummy
    for x in arr:
        curr.next = ListNode(x)
        curr = curr.next
    return dummy.next

def list_to_arr(node):
    arr = []
    while node:
        arr.append(node.val)
        node = node.next
    return arr

# WRAPPER FUNCTION: Runs the user's solution and converts result to Array
def run_wrapper(head):
    result_head = reverseList(head)
    return list_to_arr(result_head)
`;

export default {
  id: "reverse-linked-list",
  title: "206. Reverse Linked List",
  difficulty: "Easy",
  type: "linked-list",
  hideLiveTrace: true,    // 🔴 HIDES right panel in Editor tab
  description: <ReverseListDescription />,
  
  // 2. UPDATED EXECUTION CONFIG
  // We call 'run_wrapper' instead of 'reverseList' directly
  entryFunction: "run_wrapper",
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
    values: [1, 2, 3, 4, 5] 
  },

  // Trace script for Visualizer (unchanged)
  getTraceScript: (visualData) => {
    const vals = JSON.stringify(visualData.values);
    return `
import json
${LIST_NODE_HELPER}

def trace_reverse(vals):
    head = create_list(vals)
    steps = []
    
    # Snapshot helper
    nodes_state = [{"id": v, "val": v, "next": vals[i+1] if i < len(vals)-1 else None} for i, v in enumerate(vals)]
    
    prev = None
    curr = head
    
    steps.append({
        "nodes": nodes_state[:],
        "pointers": { "prev": None, "curr": curr.val if curr else None },
        "status": "start"
    })

    while curr:
        nxt = curr.next
        
        # Step: Current
        steps.append({
            "nodes": nodes_state[:],
            "pointers": { "prev": prev.val if prev else None, "curr": curr.val, "nxt": nxt.val if nxt else None },
            "status": "current"
        })

        # Logic: Reversal
        curr.next = prev
        
        # Visual Update
        new_nodes = [n.copy() for n in nodes_state]
        for n in new_nodes:
            if n["val"] == curr.val:
                n["next"] = prev.val if prev else None
        nodes_state = new_nodes

        steps.append({
            "nodes": nodes_state[:],
            "pointers": { "prev": prev.val if prev else None, "curr": curr.val },
            "status": "reverse"
        })

        # Logic: Move
        prev = curr
        curr = nxt
        
        steps.append({
            "nodes": nodes_state[:],
            "pointers": { "prev": prev.val if prev else None, "curr": curr.val if curr else None },
            "status": "move"
        })

    return json.dumps(steps)

trace_reverse(${vals})
`;
  },

  // 3. UPDATED TEST CASES
  // Input now includes the helper + wrapper definitions
  testCases: [
    {
      input: `${LIST_NODE_HELPER}\nhead = create_list([1,2,3,4,5])`,
      expected: "[5, 4, 3, 2, 1]"
    },
    {
      input: `${LIST_NODE_HELPER}\nhead = create_list([1,2])`,
      expected: "[2, 1]"
    },
    {
      input: `${LIST_NODE_HELPER}\nhead = create_list([])`,
      expected: "[]"
    }
  ]
};