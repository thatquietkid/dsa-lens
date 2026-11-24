# Concept Brief: Adaptive DSA Learning Harness

**Feature Concept:** Adaptive DSA Learning Harness with Skill Assessment, Pyodide AST Diagnostics, Visual Execution, and Token‑Minimized AI Mentorship  
**Target Codebase:** `DSALens` (`src/hooks/usePyodide.js`, `src/components/Pages/ProblemWorkspace.jsx`, `src/problems/`)  
**Compiled By:** EGM Synthesizer Persona  

---

## 1. Executive Summary & Core Value Proposition

The **Adaptive DSA Learning Harness** transforms DSALens from a passive algorithm player into an active, intelligent tutoring system. Traditional AI coding platforms suffer from two severe pitfalls:
1. **Token Cost Explosion**: Sending student code, test outputs, and conversational context to LLMs on every attempt drains token budgets and introduces 2–6 second round‑trip latencies.
2. **Cognitive Disconnect**: Beginners cannot bridge abstract syntax trees (ASTs) or complex LeetCode descriptions with their own mental model of runtime memory.

This feature introduces an **Inverted, Client‑Heavy Architecture**:
* **Zero‑Token Local Intelligence**: Leverage the existing in‑browser **Pyodide** runtime to perform client‑side static AST analysis, dynamic step‑tracing, and canonical mistake pattern matching.
* **Micro‑Diagnostic Warmup**: Quick, 60‑second interactive tracing challenges calibrate user competency (Elo rating per algorithmic domain) before entering the workspace.
* **Tiered Socratic Hints**: 85 % of hints are delivered deterministically at 0 token cost using local AST tree‑matching; LLMs are treated strictly as an escalated, low‑token ($<150$ tokens) fallback.
* **Pedagogical AST Visualizer**: Abstract AST nodes are synthesized into conceptual visual representations (Loop Window, Pointer Divergence, Hash Table probes) synchronized directly with Monaco Editor lines.

---

## 2. Multi‑Lens Brainstorm Synthesis

### 2.1 UX & Ergonomics Lens (`egm-design`)
* **Warm‑up Calibration vs. Anxiety Quizzing**:
  * Avoid intimidating "Test Your DSA IQ" forms. Frame assessment as a 3‑question "Code Tracing Calibrator" where users predict variable states after 2 iterations.
  * Instant difficulty routing: Seamlessly drops the user into an appropriately calibrated problem (e.g., Two Sum $O(N^2)$ brute force vs. Two Sum Two‑Pointer on sorted input) without displaying demotivating failure notices.
* **Progressive Hint Ladder Interface**:
  1. *Rung 1 (Socratic Nudge, 0 tokens)*: "Notice your inner loop starts at `j = 0` every time. What happens to previous pairs?"
  2. *Rung 2 (Pattern Suggestion, 0 tokens)*: "Can you eliminate the nested scan with an auxiliary lookup structure?"
  3. *Rung 3 (AI Guided Coach, Capped tokens)*: Micro‑feedback (max 60 words) highlighting the exact AST invariant missing.
* **Unified Workspace Ergonomics**:
  * Integrate AST insights directly into `ProblemWorkspace.jsx` without eye‑hopping. Provide an "X‑Ray View" toggle over Monaco that highlights loop nesting depth and data‑structure hotspots.

### 2.2 Codebase Details Lens (`egm-codebase-details`)
* **Grounded in `src/hooks/usePyodide.js`**:
  * Currently, `usePyodide.js` already runs an in‑browser Python AST instrumenter (`ast.NodeTransformer` with `record_event`).
  * Extend `AST_INSTRUMENTER_SCRIPT` with a `StaticPatternInspector` that captures loop depth, anti‑patterns, and auxiliary‑memory usage, running in under 5 ms client‑side before test execution.
* **Extending `src/utils/progress.js`**:
  * Upgrade from flat array of solved IDs to domain Elo vectors so we can track skill per DSA topic and avoid repeated blunders.

### 2.3 Skeptical Architecture & System Lens (`egm-zoom-out`)
* **The Token Depletion Threat**:
  * Direct LLM integration for live coding leads to token burnout, prompt injections, and API quota exhaustion.
  * **System Boundary Rule**: The server/LLM layer must never receive raw problem boilerplate or unparsed code. Only send a compressed 4‑tuple `{ problem_id, ast_summary, failing_test_case_delta, student_approach_tag }` – reduces input tokens from ~1 200 to ~120 (90 % reduction). Output token hard limit set to 150.
* **Pyodide Web Worker Decoupling**:
  * Static AST parsing and dynamic instrumentation must migrate to a dedicated Web Worker (`pyodide.worker.js`) to guarantee 60 fps UI responsiveness during code typing.

### 2.4 Comprehension & Cognitive Load Lens (`egm-comprehension`)
* **Raw AST vs. Pedagogical AST**:
  * Translate raw AST into 4 high‑level **Semantic DSA Primitives** (Iterators, State Accumulators, Condition Gates, Memory Containers) to reduce cognitive load.
* **Mental Model Reinforcement**:
  * When an invariant breaks, flash the specific AST node with an intuitive tooltip (e.g., "Tried to pop an empty container at Line 8").

### 2.5 Implementation Readiness Lens (`egm-implementation-readiness`)
* **Phased Rollout Milestones**:
  * **Phase 1 (Weeks 1‑2)**: In‑browser heuristic engine, skill matrix, diagnostic modal.
  * **Phase 2 (Weeks 3‑4)**: Semantic visualizer, deterministic hint ladder, templates for top‑5 mistake archetypes.
  * **Phase 3 (Week 5)**: Capped LLM fallback via Edge worker, rate limits (max 3 AI hints per 10 min).

### 2.6 Structural & Data Flow Lens (`egm-structural`)
* **Core Schemas** (TypeScript snippets) for `SkillProfile`, `ASTDiagnosticReport`, and `MinimalHintPromptPayload` – all designed to stay under the 150‑token LLM payload budget.

### 2.7 Inventive Catalyst Lens (`egm-inventive-catalyst`)
* **TRIZ Contradiction Resolutions**:
  * **A – Personalisation vs. Zero‑Token** → Embed a 30 KB static JSON lookup of AST fingerprints for known mistakes; serve pre‑authored master hints instantly when similarity > 85 %.
  * **B – Feedback vs. Cognitive Fatigue** → "Ghost Trace" overlay that animates variable values directly on source lines instead of a separate tree diagram.
  * **C – Calibration Quiz Drop‑off vs. Tailored Difficulty** → Reverse‑execution micro‑challenge (flip one line to achieve target output) – gamified, 10 s, no quiz fatigue.

---

## 3. Token‑Optimization & Zero‑Token Architecture
```mermaid
flowchart TD
    UserCode[User Submits Code in Monaco] --> Pyodide[Pyodide In‑Browser Worker]
    Pyodide --> ASTParser[Static AST Analysis & Complexity Inspector]
    Pyodide --> TestRunner[Run Unit Test Cases]
    TestRunner -->|All Pass| Success[Mark Solved & Update Domain Elo +15]
    TestRunner -->|Fail| LocalDiagnostics[Local Diagnostic Engine]
    ASTParser --> LocalDiagnostics
    LocalDiagnostics --> ArchetypeMatcher{Matches Known Mistake Archetype?}
    ArchetypeMatcher -->|Yes (85% cases)| Rung1[Serve Tier 1/2 Local Template Hint – 0 Tokens]
    ArchetypeMatcher -->|No / Exhausted| EscalationCheck{User Requests Deep AI Coach?}
    EscalationCheck -->|No| SelfCorrection[Student Continues Iterating]
    EscalationCheck -->|Yes| EdgeProxy[Compress AST Delta + Fail Input]
    EdgeProxy --> LLM[Fast Mini LLM – Max 150 Out Tokens]
    LLM --> SocraticFeedback[Display Focused Socratic Nudge]
```
---

## 4. Prioritized Feature Backlog
| Priority | Feature Item | Target Subsystem | Token Impact |
| :---: | :--- | :--- | :--- |
| 🔴 **P0** | **In‑Browser AST Static Analyzer** (`usePyodide.js`) | Pyodide / Hooks | **0 tokens** |
| 🔴 **P0** | **Domain‑Specific Elo & Progress Store** (`skillRating.js`) | Progress / LocalStorage | **0 tokens** |
| 🟡 **P1** | **Deterministic 3‑Tier Hint Ladder** | `ProblemWorkspace.jsx` | **0 tokens** |
| 🟡 **P1** | **Interactive 60 s Micro‑Diagnostic Warm‑up** | Home / Modal | **0 tokens** |
| 🟡 **P1** | **Pedagogical AST Semantic Visualizer** | Workspace VisualTrace | **0 tokens** |
| 🟢 **P2** | **Zero‑Shot Low‑Token Edge LLM Fallback** | Edge Function / API | **< 150 tokens/call** |
| 🟢 **P2** | **Reverse‑Execution Code Puzzle Generator** | Learn Route | **0 tokens** |
---

### Handoff Summary
All seven Goldfish sub‑agent perspectives have been rigorously explored, reconciled, and compiled into the unified concept brief above. The deliverable is immediately actionable for implementation in the DSALens codebase with zero external dependencies required for Phase 1.
