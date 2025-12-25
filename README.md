# DSALens — DSA Visualizer 🔍🧠

**DSALens** is a lightweight, in-browser **Data Structures & Algorithms visualizer** that lets you write, run, and *see* Python algorithms step-by-step.
It executes Python using **Pyodide** and converts algorithm execution into visual traces for intuitive learning.

---
## 📌 Table of Contents

- [Overview](#dsalens--dsa-visualizer-)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start-development)
- [How Pyodide Works](#-how-pyodide-works-here)
- [Project Structure](#-project-structure)
- [Adding a New Problem](#-adding-a-new-problem)
- [Editing Visual Input](#-editing-visual-input)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)
- [License](#-license)
---
## ✨ Features

* 🐍 **Run Python in the browser** using Pyodide (no backend needed)
* 🎥 **Live visualizations** for common DSA problems:

  * Two Sum
  * Binary Search
  * Reverse Linked List
  * Valid Parentheses
  * More coming…
* 🧩 **Step-by-step execution traces** rendered as stacks, arrays, and linked lists
* 📝 **Monaco Editor** with test execution console
* ⚙️ **Custom visual input** for experimenting with different cases
* 🎞️ Smooth animations powered by Framer Motion

---

## 🛠️ Tech Stack

* **React** (Vite / CRA-style setup)
* **Monaco Editor** — code editing
* **Pyodide (CDN)** — in-browser Python execution
* **Framer Motion** — animations
* **lucide-react** — icons

---

## 🚀 Quick Start (Development)

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
# or
npm start
```

### 3. Open in browser
Go to
[http://localhost:5173](http://localhost:5173)

---

## 🧠 How Pyodide Works Here

* Pyodide is loaded via CDN (`src/hooks/usePyodide.js`)
* Python code is executed fully in the browser
* Each problem provides a **trace script** that:

  * Executes the algorithm
  * Emits structured JSON
* The visualizer consumes this JSON to render step-by-step visuals

⚠️ **Note:**
>Avoid heavy or infinite Python logic — Pyodide runs on the main thread and can slow down the UI.

---

## 📁 Project Structure

```text
src/
├── App.jsx                          # App entry + routing
├── hooks/
│   └── usePyodide.js                # Pyodide loader + execution helpers
├── components/
│   ├── layout/
│   │   └── Header.jsx               # Top navigation (Editor / Visualizer / Learn)
│   ├── Pages/
│   │   └── ProblemWorkspace.jsx     # Editor + Console + Visualizer
│   └── Workspace/
│       ├── VisualizerRenderer.jsx   # Playback controls
│       └── VisualTrace.jsx          # Renders arrays, stacks, linked lists
├── problems/
│   ├── twoSum.jsx
│   ├── validParentheses.jsx
│   └── index.js                     # Problem registry
```

---

## ➕ Adding a New Problem

1. Create a file in `src/problems/`
   Example: `myProblem.jsx`

2. Export a default object:

```js
export default {
  id: "my-problem",
  title: "My Problem",
  difficulty: "Easy",
  entryFunction: "solve",
  inputVariables: ["nums", "target"],
  defaultCode: `def solve(nums, target): pass`,
  testCases: [
    { input: "[1,2,3], 4", expected: "True" }
  ],
  visualData: { nums: [1, 2, 3], target: 4 },
  getTraceScript: (visualData) => `# python trace script`
};
```

3. Register it in `src/problems/index.js`

---

## 🎛️ Editing Visual Input

1. Open a problem
2. Click the **settings icon** in the Live Memory View
3. Paste JSON matching the problem’s `visualData` shape
4. Click **“Visualize This Data”**

---

## 🧪 Troubleshooting

* **“Engine loading…”**

  * Pyodide is still initializing — wait a moment
* **No visualization output**

  * Ensure `getTraceScript()` prints a valid JSON string
* **Linked list issues**

  * Use the helper constructors provided in that problem’s file

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Add problems, improve visuals, or optimize performance
4. Open a PR 🚀

Guidelines:

* Keep trace scripts deterministic
* Prefer clarity over cleverness
* Avoid heavy Python loops

---

## 📄 License

MIT License
See the [`LICENSE`](LICENSE) file for details.