// src/problems/tinyBank.jsx
import React from "react";

const TinyBankDescription = () => (
  <div>
    <p className="prob-text">
      Build a tiny <strong>in-memory bank</strong>. You are given a list of
      command strings <code>commands</code>. Tokens are separated by single
      spaces; account names are <strong>case-sensitive</strong> words without
      spaces; amounts are integers. Commands are case-sensitive and written in
      upper case.
    </p>

    <br />
    <h4 className="section-subtitle">Commands:</h4>
    <p className="prob-text">
      Checks are done <strong>in the order listed</strong>; the first failing
      check decides the message.
    </p>
    <ul className="prob-text">
      <li>
        <code>OPEN name amount</code> — amount must be an integer ≥ 0; name must
        not exist. Success: <code>OPENED name</code>
      </li>
      <li>
        <code>DEPOSIT name amount</code> — amount integer ≥ 1; account must
        exist. Success: <code>OK name new_balance</code>
      </li>
      <li>
        <code>WITHDRAW name amount</code> — amount integer ≥ 1; account exists;
        amount ≤ balance. Success: <code>OK name new_balance</code>
      </li>
      <li>
        <code>TRANSFER src dst amount</code> — amount integer ≥ 1; src exists;
        dst exists; src differs from dst; amount ≤ src balance. Success:{" "}
        <code>{"TRANSFERRED amount src -> dst"}</code>
      </li>
      <li>
        <code>SHOW name</code> — account must exist. Success:{" "}
        <code>name: balance</code>
      </li>
    </ul>

    <br />
    <h4 className="section-subtitle">Error messages:</h4>
    <p className="prob-text">
      A failed command produces one error line and has <strong>no effect</strong>.
    </p>
    <ul className="prob-text">
      <li>
        <code>ERROR: invalid amount</code> — amount is not an integer (e.g.{" "}
        <code>abc</code>, <code>12.5</code>) or is below the minimum
      </li>
      <li>
        <code>ERROR: account exists</code> — <code>OPEN</code> on a name that
        already exists
      </li>
      <li>
        <code>ERROR: no such account</code> — a referenced account does not
        exist
      </li>
      <li>
        <code>ERROR: insufficient funds</code> — amount is larger than the
        balance
      </li>
      <li>
        <code>ERROR: same account</code> — <code>TRANSFER</code> whose source and
        destination are the same account
      </li>
      <li>
        <code>ERROR: unknown command</code> — the first word is not one of the
        five commands
      </li>
    </ul>

    <p className="prob-text">
      <strong>Return</strong> a list of output lines: one line per command, in
      order, followed by one final line{" "}
      <code>ACCOUNTS=&lt;number of accounts opened&gt; TOTAL=&lt;sum of all balances&gt;</code>.
    </p>

    <p className="prob-text">
      <strong>Design hint:</strong> an <code>Account</code> class with a
      class-level counter, a custom exception for rule violations handled with{" "}
      <code>try/except</code>, and a <code>__str__</code> method keep the
      solution short and clean.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong>{" "}
      <code>{'commands = ["OPEN sam 100", "DEPOSIT sam 50", "WITHDRAW sam 500", "OPEN sam 1", "OPEN joe 20", "TRANSFER sam joe 70"]'}</code>
      <br />
      <strong>Output:</strong>{" "}
      <code>{'["OPENED sam", "OK sam 150", "ERROR: insufficient funds", "ERROR: account exists", "OPENED joe", "TRANSFERRED 70 sam -> joe", "ACCOUNTS=2 TOTAL=170"]'}</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>0 ≤ commands.length ≤ 10⁴</code></li>
      <li>Names are case-sensitive: <code>Sam</code> and <code>sam</code> are different accounts</li>
    </ul>
  </div>
);

export default {
  id: "tiny-bank",
  title: "3. Tiny In-Memory Bank",
  difficulty: "Medium",
  type: "array",
  description: <TinyBankDescription />,

  // 🟢 CONTRACT definition
  entryFunction: "runBank",
  inputVariables: ["commands"],

  // 🟢 STARTER CODE (Students write their own solution)
  defaultCode: `def runBank(commands):
    # Write your solution here
    pass`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    commands: ["OPEN sam 100", "DEPOSIT sam 50", "WITHDRAW sam 500", "OPEN sam 1", "OPEN joe 20", "TRANSFER sam joe 70"]
  },

  // 🟢 CLEAN DATA for Test Runner
  testCases: [
    {
      commands: ["OPEN sam 100", "DEPOSIT sam 50", "WITHDRAW sam 500", "OPEN sam 1", "OPEN joe 20", "TRANSFER sam joe 70"],
      expected: ["OPENED sam", "OK sam 150", "ERROR: insufficient funds", "ERROR: account exists", "OPENED joe", "TRANSFERRED 70 sam -> joe", "ACCOUNTS=2 TOTAL=170"]
    },
    {
      commands: [],
      expected: ["ACCOUNTS=0 TOTAL=0"]
    },
    {
      commands: ["OPEN a abc", "OPEN a -5", "OPEN a 0", "SHOW a", "DEPOSIT a 0", "DEPOSIT a 12.5", "DEPOSIT b 5", "SHOW b"],
      expected: ["ERROR: invalid amount", "ERROR: invalid amount", "OPENED a", "a: 0", "ERROR: invalid amount", "ERROR: invalid amount", "ERROR: no such account", "ERROR: no such account", "ACCOUNTS=1 TOTAL=0"]
    },
    {
      commands: ["OPEN x 10", "TRANSFER x x 5", "TRANSFER x y 5", "TRANSFER y x 5", "TRANSFER x x abc", "WITHDRAW x 10", "SHOW x"],
      expected: ["OPENED x", "ERROR: same account", "ERROR: no such account", "ERROR: no such account", "ERROR: invalid amount", "OK x 0", "x: 0", "ACCOUNTS=1 TOTAL=0"]
    },
    {
      commands: ["open x 5", "Open x 5", "HELLO", "OPEN Sam 1", "OPEN sam 2", "SHOW Sam", "SHOW sam"],
      expected: ["ERROR: unknown command", "ERROR: unknown command", "ERROR: unknown command", "OPENED Sam", "OPENED sam", "Sam: 1", "sam: 2", "ACCOUNTS=2 TOTAL=3"]
    }
  ]
};