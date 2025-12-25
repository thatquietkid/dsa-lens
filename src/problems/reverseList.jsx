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
  </div>
);

// Helper string to inject into Python for Linked List operations
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
`;

export default {
  id: "reverse-linked-list",
  title: "206. Reverse Linked List",
  difficulty: "Easy",
  description: <ReverseListDescription />,
  
  // EXECUTION CONFIG
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
    // Initial data for the visualizer
    values: [1, 2, 3, 4, 5] 
  },

  // 🟢 TRACE GENERATOR FOR LINKED LIST
  getTraceScript: (visualData) => {
    const vals = JSON.stringify(visualData.values);
    return `
import json
${LIST_NODE_HELPER}

def trace_reverse(vals):
    # Setup
    head = create_list(vals)
    steps = []
    
    # We need to map object IDs to values to track them visually
    # In a real debugger we use memory addresses, here we use values (assuming unique for simplicity)
    # or just simple indexing since we know the initial order.
    
    nodes_state = [{"id": v, "val": v, "next": vals[i+1] if i < len(vals)-1 else None} for i, v in enumerate(vals)]
    
    prev = None
    curr = head
    
    # Initial Snapshot
    steps.append({
        "nodes": nodes_state[:],
        "pointers": { "prev": None, "curr": curr.val if curr else None },
        "status": "start"
    })

    while curr:
        # Step: Identify Next
        nxt = curr.next
        steps.append({
            "nodes": nodes_state[:],
            "pointers": { "prev": prev.val if prev else None, "curr": curr.val, "nxt": nxt.val if nxt else None },
            "status": "current"
        })

        # Step: Reversal
        curr.next = prev
        
        # Update Node State for Visualizer (find node with val == curr.val and update its next)
        new_nodes = [n.copy() for n in nodes_state] # Deep copy for snapshot
        for n in new_nodes:
            if n["val"] == curr.val:
                n["next"] = prev.val if prev else None
        nodes_state = new_nodes # Persist change

        steps.append({
            "nodes": nodes_state[:],
            "pointers": { "prev": prev.val if prev else None, "curr": curr.val },
            "status": "reverse"
        })

        # Step: Move Pointers
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

  // 🟢 TEST CASES
  testCases: [
    {
      // We inject the helper class + the specific test case setup
      input: `${LIST_NODE_HELPER}\nhead = create_list([1,2,3,4,5])`,
      // We modify the runner to check the result by converting back to array
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