# Task Breakdown for Adaptive DSA Learning Harness

## Phase 0 – Project Setup (1 day)
1. Create a new Git branch `feature/adaptive-dsa-harness`.
2. Add a `tasks_breakdown.md` file (this document) and a `README.md` overview.
3. Ensure the repository builds (`npm install && npm run build`).

## Phase 1 – Client‑Side Intelligence (Weeks 1‑2)
### 1.1 AST Static Analyzer
- Modify `src/hooks/usePyodide.js`:
  - Add `StaticPatternInspector` class (see concept brief).
  - Export a function `runStaticAnalysis(code: string): ASTDiagnosticReport`.
  - Write unit tests (`tests/usePyodide.ast.test.js`).
- Add a Web‑Worker `pyodide.worker.js` that loads Pyodide, runs the inspector, and posts results back.

### 1.2 Skill‑Profile & Elo System
- Create `src/utils/skillRating.js`:
  - Define `SkillProfile` interface.
  - Implement `updateElo(profile, domain, outcome)` and persistence to `localStorage`.
- Hook into problem‑completion flow to call `updateElo` (+15 on success, -5 on failure).
- Add UI component `EloBadge` showing current domain rating.

### 1.3 Diagnostic Warm‑up Modal
- Design a React modal (`WarmupModal.jsx`) that presents three tracing questions.
- Capture answers, compute a quick `initialElo` per domain, store in `SkillProfile`.
- Show a progress bar indicating calibration completion.

### 1.4 Hint Ladder UI
- Extend `ProblemWorkspace.jsx`:
  - Add a “Hint” button that opens a drawer with three tiers.
  - Tier 1 & 2 pull deterministic templates from `src/hints/templates.json` based on detected archetype.
  - Tier 3 triggers a capped LLM request (implemented later).
- Wire the drawer to `runStaticAnalysis` results to select appropriate template.

## Phase 2 – Pedagogical Visualizer & Zero‑Token Hints (Weeks 3‑4)
### 2.1 Semantic AST Visualizer
- Build `ASTVisualizer.jsx`:
  - Consume `ASTDiagnosticReport` and render a Mermaid flowchart of the four DSA primitives.
  - Provide an “X‑Ray” toggle that overlays node highlights on the Monaco editor.
- Integrate into `ProblemWorkspace` side‑panel.

### 2.2 Deterministic Hint Templates
- Populate `src/hints/templates.json` with entries for the top‑5 mistake archetypes (e.g., `brute_force_nested`, `hash_optimization`).
- Each entry contains Tier 1 and Tier 2 text strings.
- Write a helper `getHint(archetype, tier)`.

### 2.3 Ghost‑Trace Overlay (optional UI polish)
- Implement a lightweight animation that steps variable values on the editor lines during test runs.
- Use `requestAnimationFrame` to keep UI smooth.

## Phase 3 – Low‑Token LLM Fallback (Week 5)
### 3.1 Edge Function / Serverless Wrapper
- Deploy a Cloudflare Worker (or Vercel Edge) named `dsa‑hint‑proxy`.
- Accept `MinimalHintPromptPayload` JSON, forward to selected LLM (Gemini‑Flash, Claude‑Haiku, etc.) with `max_output_tokens: 150`.
- Return the LLM’s short Socratic hint.

### 3.2 Front‑end Integration
- Add a `requestLLMHint(archetype, failInput, lineError)` function that calls the Edge worker via `fetch`.
- Enforce rate‑limit: max 3 LLM hints per 10 min per user (store timestamps in `localStorage`).

### 3.3 Token‑Budget Monitoring Dashboard
- Create `src/components/TokenUsageDashboard.jsx`:
  - Show cumulative tokens used per session.
  - Alert when approaching a configurable budget (e.g., 5 K tokens).

## Phase 4 – Testing, QA, and Documentation (Week 6)
1. Write integration tests covering the full flow: warm‑up → static analysis → hint ladder → LLM fallback.
2. Add end‑to‑end Cypress tests for UI interactions (modal, visualizer, ghost‑trace).
3. Update `README.md` with setup instructions, architecture diagram (Mermaid), and contribution guide.
4. Perform a token‑budget audit: simulate 100 student sessions, verify average tokens < 120 per session.

## Phase 5 – Rollout & Monitoring (Post‑Launch)
- Enable feature flag `adaptiveDSAHarness` in production config.
- Collect anonymous usage metrics (activation count, hint‑tier distribution, token usage).
- Iterate on hint templates based on top‑reported failure patterns.

---

**Milestones & Ownership**
- *Week 1‑2*: Front‑end engineer (AST & skill system).
- *Week 3‑4*: UI/UX designer (visualizer, hint UI).
- *Week 5*: DevOps / backend (Edge worker, token monitoring).
- *Week 6*: QA lead (tests, docs).

**Success Indicators**
- ≥ 80 % of student sessions finish without invoking the LLM.
- Average problem‑solving time improves by 15 % compared to baseline.
- User satisfaction score ≥ 4.2 / 5 in post‑session survey.
