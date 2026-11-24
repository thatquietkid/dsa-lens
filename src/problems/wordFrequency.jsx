// src/problems/wordFrequency.jsx
import React from "react";

const WordFrequencyDescription = () => (
  <div>
    <p className="prob-text">
      Given one line of text <code>text</code>, report how often each word
      occurs. Words are separated by whitespace. <strong>Normalise</strong>{" "}
      every word before counting:
    </p>
    <ul className="prob-text">
      <li>convert it to <strong>lowercase</strong>, and</li>
      <li>
        strip the characters <code>. , ! ? ; :</code> from{" "}
        <strong>both ends</strong> of the word (characters inside the word, such
        as <code>'</code> or <code>-</code>, are kept).
      </li>
      <li>A token that becomes empty after stripping is ignored.</li>
    </ul>

    <p className="prob-text">
      <strong>Return</strong> a list of output lines (strings):
    </p>
    <ul className="prob-text">
      <li>
        If there are no words, return <code>["No words found"]</code> and
        nothing else.
      </li>
      <li>
        Otherwise: <code>"Total words: T"</code>, then{" "}
        <code>"Unique words: U"</code>.
      </li>
      <li>
        Then one line <code>"word: count"</code> for every unique word, in the
        order of its <strong>first appearance</strong>.
      </li>
      <li>
        Finally <code>"Most frequent: word (count)"</code>. If several words
        share the highest count, choose the one that appeared first.
      </li>
    </ul>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>{'text = "Up, up & away"'}</code>
      <br />
      <strong>Output:</strong>{" "}
      <code>{'["Total words: 4", "Unique words: 3", "up: 2", "&: 1", "away: 1", "Most frequent: up (2)"]'}</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 2:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>{'text = "Hello, hello World!"'}</code>
      <br />
      <strong>Output:</strong>{" "}
      <code>{'["Total words: 3", "Unique words: 2", "hello: 2", "world: 1", "Most frequent: hello (2)"]'}</code>
    </p>

    <br />
    <h4 className="section-subtitle">Example 3:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>{'text = "It\'s never lupus"'}</code>
      <br />
      <strong>Output:</strong>{" "}
      <code>{'["Total words: 3", "Unique words: 3", "it\'s: 1", "never: 1", "lupus: 1", "Most frequent: it\'s (1)"]'}</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>0 ≤ text.length ≤ 10⁵</code></li>
      <li>The text may be empty or contain only spaces</li>
    </ul>
  </div>
);

export default {
  id: "word-frequency",
  title: "2. Word Frequency Counter",
  difficulty: "Easy",
  type: "array",
  description: <WordFrequencyDescription />,

  // 🟢 CONTRACT definition
  entryFunction: "wordFrequency",
  inputVariables: ["text"],

  // 🟢 STARTER CODE (Students write their own solution)
  defaultCode: `def wordFrequency(text):
    # Write your solution here
    pass`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    text: "Up, up & away"
  },

  // 🟢 CLEAN DATA for Test Runner
  testCases: [
    {
      text: "Up, up & away",
      expected: ["Total words: 4", "Unique words: 3", "up: 2", "&: 1", "away: 1", "Most frequent: up (2)"]
    },
    {
      text: "Hello, hello World!",
      expected: ["Total words: 3", "Unique words: 2", "hello: 2", "world: 1", "Most frequent: hello (2)"]
    },
    {
      text: "It's never lupus",
      expected: ["Total words: 3", "Unique words: 3", "it's: 1", "never: 1", "lupus: 1", "Most frequent: it's (1)"]
    },
    { text: "", expected: ["No words found"] },
    { text: "   ", expected: ["No words found"] },
    { text: "...  !!! ??", expected: ["No words found"] },
    {
      text: "a b a b",
      expected: ["Total words: 4", "Unique words: 2", "a: 2", "b: 2", "Most frequent: a (2)"]
    },
    {
      text: "Well-known, well-known; 'quote' don't:",
      expected: ["Total words: 4", "Unique words: 3", "well-known: 2", "'quote': 1", "don't: 1", "Most frequent: well-known (2)"]
    },
    {
      text: "THE the The, tHe. end",
      expected: ["Total words: 5", "Unique words: 2", "the: 4", "end: 1", "Most frequent: the (4)"]
    }
  ]
};