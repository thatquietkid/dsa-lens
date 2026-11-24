You are generating a coding-problem definition file for my practice platform.
Convert the problem statement at the bottom into ONE React/JSX file that follows
the TEMPLATE and RULES below exactly. Output only the file contents in a single
code block, with no commentary before or after it.

## SETTINGS
- File name / id (kebab-case): {{e.g. two-sum}}
- Title (with number):         {{e.g. "1. Two Sum"}}
- Difficulty:                  {{Easy | Medium | Hard}}
- Language of solution:        Python
- Entry function name:         {{camelCase, e.g. twoSum}}   (or "choose one")
- Input variables:             {{e.g. nums, target}}        (or "infer them")

## RULES
1. FUNCTION CONTRACT, NOT STDIN/STDOUT.
   The platform calls `entryFunction(*inputVariables)` and compares the
   RETURN VALUE to `expected`. If the original problem reads from input() and
   prints, convert it:
   - Each input line / group becomes a function parameter
     (a line of integers -> list[int], n command lines -> list[str], etc.).
   - Everything the original program prints becomes the return value:
       * one printed value  -> return that value (str / int / list)
       * many printed lines -> return list[str], one element per line
   - State this return type explicitly in the description
     ("Return a list of output lines", "Return the formatted text as a string").
2. DESCRIPTION component
   - Named `<PascalCaseName>Description`, a plain functional component.
   - Use ONLY these elements/classes: `<p className="prob-text">`,
     `<h4 className="section-subtitle">`, `<ul className="prob-text">`,
     `<code>`, `<strong>`, `<em>`, `<br />`.
   - Order: intro paragraph(s) -> rules/commands (as <ul>) -> return statement
     -> Example 1..N -> Constraints.
   - Each example: `<strong>Input:</strong> <code>...</code><br />
     <strong>Output:</strong> <code>...</code>`.
   - Write inputs the way the function receives them (`nums = [2, 7]`,
     `text = "Hello"`), outputs the way it returns them (`[0, 1]`, `"abc"`).
   - Constraints use Unicode: `≤ ≥ 10⁴ 10⁹`, never LaTeX.
   - JSX SAFETY: put any text containing `{ } < > &`, quotes, or `->` inside a
     JS string expression, e.g. `<code>{'text = "It\'s"'}</code>` or
     `{"->"}`. Use `&lt;` / `&gt;` only for plain angle brackets in prose.
     Use `{" "}` for a significant space at the end of a line.
3. DEFAULT EXPORT object, exactly these keys in this order:
   id, title, difficulty, type, description, entryFunction, inputVariables,
   defaultCode, visualData, testCases.
   - `type`: "array" unless I say otherwise (it uses the default adapter).
   - `description`: `<YourDescription />` (the element, not the function).
   - `inputVariables`: array of strings, same order as the function parameters.
4. defaultCode
   - A correct, clean, OPTIMAL Python solution inside a JS template literal.
   - Define a function named exactly `entryFunction` with parameters named
     exactly like `inputVariables`.
   - Template-literal safety: NEVER use backticks, `${`, or backslashes
     (`\n`, `\d`, ...) inside it. Build strings with `+` / `str()` rather than
     f-strings if they contain braces; avoid regex escapes (use `isdigit()` etc.).
   - Standard library imports are fine. No input(), no print().
5. visualData: a plain object with the SAME keys as inputVariables, holding
   the first example's input. Plain JSON-style data only.
6. testCases
   - Array of plain objects: one key per input variable plus `expected`.
   - Include ALL examples from the statement first, then edge cases:
     empty input, single element, minimum/maximum boundaries, ties,
     negative numbers, duplicates, case sensitivity, every error branch.
   - 6–12 cases (more for rule-heavy problems).
   - `expected` must be what defaultCode really returns. Trace each one
     carefully; do not guess. Do NOT include Python strings or stdin text.
7. Do not invent requirements. If the statement is ambiguous, pick the most
   literal reading and mention it in a one-line `// NOTE:` comment above the
   export.

## TEMPLATE (follow this structure)
```jsx
// src/problems/{{fileName}}.jsx
import React from "react";

const {{PascalName}}Description = () => (
  <div>
    <p className="prob-text">
      ...intro with <code>param</code> and <strong>key terms</strong>...
    </p>

    <br />
    <h4 className="section-subtitle">Rules:</h4>
    <ul className="prob-text">
      <li>...</li>
    </ul>

    <p className="prob-text">
      <strong>Return</strong> ...type and shape of the return value...
    </p>

    <br />
    <h4 className="section-subtitle">Example 1:</h4>
    <p className="prob-text">
      <strong>Input:</strong> <code>param = ...</code>
      <br />
      <strong>Output:</strong> <code>...</code>
    </p>

    <br />
    <h4 className="section-subtitle">Constraints:</h4>
    <ul className="prob-text">
      <li><code>1 ≤ n ≤ 10⁵</code></li>
    </ul>
  </div>
);

export default {
  id: "{{kebab-id}}",
  title: "{{N. Title}}",
  difficulty: "{{Easy|Medium|Hard}}",
  type: "array",
  description: <{{PascalName}}Description />,

  // 🟢 CONTRACT definition
  entryFunction: "{{functionName}}",
  inputVariables: ["{{param1}}", "{{param2}}"],

  // 🟢 OPTIMAL SOLUTION
  defaultCode: `def {{functionName}}({{param1}}, {{param2}}):
    ...`,

  // 🟢 CLEAN DATA for Visualizer
  visualData: {
    {{param1}}: ...,
    {{param2}}: ...
  },

  // 🟢 CLEAN DATA for Test Runner
  testCases: [
    { {{param1}}: ..., {{param2}}: ..., expected: ... }
  ]
};
```

## SELF-CHECK (do silently before answering)
- [ ] Function name and parameter names match entryFunction / inputVariables.
- [ ] Every example in the statement is in testCases and in the description.
- [ ] Every expected value was traced through defaultCode.
- [ ] No backticks, `${`, or backslashes inside defaultCode.
- [ ] All `{ } < > &` in JSX text are wrapped in JS string expressions.
- [ ] Return type is stated in the description.

## PROBLEM STATEMENT
{{PASTE THE ORIGINAL PROBLEM HERE, including its sample inputs and outputs}}


---

## Tips

- **Batch mode:** paste several problems under `## PROBLEM STATEMENT` and add
  "Generate one file per problem, each in its own code block, with the file
  path as the first-line comment."
- **Verify before committing:** run each `defaultCode` against its `testCases`.
  A tiny script that regex-extracts both, `exec`s the Python, and compares is
  enough, and catches the most common LLM mistake (wrong `expected` values).
- **Stdin problems:** the biggest judgment call is how to turn "read lines /
  print lines" into parameters and a return value. Consistent conventions:
  - n command lines → `commands: list[str]`, return `list[str]` of output lines
  - one text line → `text: str`
  - a line of ints → `nums: list[int]`
  - printed list / number / word → return the value as-is