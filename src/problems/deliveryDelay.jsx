// src/problems/deliveryDelay.jsx
import React from "react";

const DeliveryDelayDescription = () => (
  <div>
    <p className="prob-text">
      A logistics app stores delivery delays as a whole number of minutes{" "}
      <code>M</code>. Convert <code>M</code> into a friendly text made of{" "}
      <strong>days, hours and minutes</strong> (1 day = 24 hours and 1 hour = 60
      minutes).
    </p>

    <br />
    <h4 className="section-subtitle">Rules:</h4>
    <ul className="prob-text">
      <li>
        Include only the <strong>non-zero</strong> units, in the order day,
        hour, minute, separated by single spaces.
      </li>
      <li>
        Use the singular word when a value is exactly 1 (<code>1 day</code>,{" "}
        <code>1 hour</code>, <code>1 minute</code>), otherwise the plural (
        <code>2 days</code>, ...).
      </li>
      <li>
        If <code>M</code> is 0, return <code>"0 minutes"</code>.
      </li>
      <li>
        If <code>M</code> is negative, the parcel arrived early: format the
        absolute value and put <code>"Early by "</code> (with one trailing
        space) in front of the result.
      </li>
    </ul>

    <p className="prob-text">
      <strong>Return</strong> the formatted text as a string.
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>M = 90</code>
      <br />
      <strong>Output:</strong> <code>"1 hour 30 minutes"</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>M = 1441</code>
      <br />
      <strong>Output:</strong> <code>"1 day 1 minute"</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 3:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>M = -61</code>
      <br />
      <strong>Output:</strong> <code>"Early by 1 hour 1 minute"</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>M</code> is a whole number (may be negative or zero)</li>
    </ul>
  </div>
);

export default {
  id: "delivery-delay",
  title: "1. Delivery Delay Formatter",
  difficulty: "Easy",
  type: "array",
  description: <DeliveryDelayDescription />,

  // 🟢 CONTRACT definition
  entryFunction: "formatDelay",
  inputVariables: ["M"],

  // 🟢 STARTER CODE (Students write their own solution)
  defaultCode: `def formatDelay(M):
    # Write your solution here
    pass`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    M: 90
  },

  // 🟢 CLEAN DATA for Test Runner
  testCases: [
    { M: 90, expected: "1 hour 30 minutes" },
    { M: 1441, expected: "1 day 1 minute" },
    { M: -61, expected: "Early by 1 hour 1 minute" },
    { M: 0, expected: "0 minutes" },
    { M: 1, expected: "1 minute" },
    { M: 60, expected: "1 hour" },
    { M: 1440, expected: "1 day" },
    { M: -1, expected: "Early by 1 minute" },
    { M: 2880, expected: "2 days" },
    { M: 2881, expected: "2 days 1 minute" },
    { M: -1500, expected: "Early by 1 day 1 hour" },
    { M: 525600, expected: "365 days" }
  ]
};