import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import {
  Activity,
  Check,
  ChevronRight,
  FileCode2,
  FileText,
  FlaskConical,
  History,
  Lightbulb,
  Loader2,
  Play,
  Send,
  SlidersHorizontal,
  Terminal,
  Trash2,
} from 'lucide-react';
import { PROBLEM_MAPPING } from '../../problems';
import { getProblemMeta } from '../../data/problemCatalog';
import { getSolvedProblems, markProblemSolved } from '../../utils/progress';
import VisualizerRenderer from '../Workspace/VisualizerRenderer';
import ExecutionConsole from '../Workspace/ExecutionConsole';
import { usePyodide } from '../../hooks/usePyodide';
import { transformEventTrace, transformDynamicTrace } from '../../utils/traceTransformers';
import { getSkillProfile, updateElo, getDomainForProblem, recordMistake } from '../../utils/skillRating';
import HintDrawer from '../Adaptive/HintDrawer';
import EloBadge from '../Adaptive/EloBadge';
import ASTVisualizer from '../Adaptive/ASTVisualizer';
import TokenUsageDashboard from '../Adaptive/TokenUsageDashboard';

// Linked-list helper injected around user code.
const LIST_NODE_HELPER = `
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
    def __repr__(self):
        return str(self.val)

def create_list(arr):
    if not arr: return None
    nodes = [ListNode(x) for x in arr]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i+1]
    return nodes[0]
`;

const DESCRIPTION_TABS = [
  { id: 'description', label: 'Description', icon: FileText },
  { id: 'solution', label: 'Solution', icon: Lightbulb },
  { id: 'submissions', label: 'Submissions', icon: History },
];

const formatCaseValue = (value) => {
  if (value === undefined || value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
  return JSON.stringify(value);
};

const getCaseValue = (testCase, variable) => {
  if (testCase[variable] !== undefined) return testCase[variable];
  if (variable === 'head') return testCase.values ?? testCase.input ?? null;
  return null;
};

const ProblemWorkspace = () => {
  const { problemId } = useParams();
  const meta = getProblemMeta(problemId);

  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentLine, setCurrentLine] = useState(null);
  const [showVisualInput, setShowVisualInput] = useState(false);
  const [customVisualData, setCustomVisualData] = useState('');
  const [visualDataError, setVisualDataError] = useState('');
  const [output, setOutput] = useState(null);
  const [traceData, setTraceData] = useState([]);
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [descriptionTab, setDescriptionTab] = useState('description');
  const [bottomTab, setBottomTab] = useState('output');
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [submissions, setSubmissions] = useState([]);
  const [solved, setSolved] = useState(false);
  const [astReport, setAstReport] = useState(null);
  const [hintOpen, setHintOpen] = useState(false);
  const [failingCase, setFailingCase] = useState(null);
  const [skillProfile, setSkillProfile] = useState(() => getSkillProfile());
  const [rightPanelTab, setRightPanelTab] = useState('trace'); // 'trace' | 'ast'
  const [xrayActive, setXrayActive] = useState(false);
  const [ghostVariableOverlay, setGhostVariableOverlay] = useState(null);
  const [showTokenDashboard, setShowTokenDashboard] = useState(false);

  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);
  const runRef = useRef(null);

  const { runCode, generateDynamicTrace, analyzeCode, loading: engineLoading } = usePyodide();

  // 1. Load problem
  useEffect(() => {
    let cancelled = false;

    const loadProblem = async () => {
      setLoading(true);
      setOutput(null);
      setTraceData([]);
      setCurrentLine(null);
      setSubmissions([]);
      setDescriptionTab('description');
      setBottomTab('output');
      setShowVisualInput(false);
      setVisualDataError('');

      const importFn = PROBLEM_MAPPING[problemId];
      if (!importFn) {
        if (!cancelled) {
          setProblem(null);
          setLoading(false);
        }
        return;
      }

      try {
        const module = await importFn();
        if (cancelled) return;
        const data = module.default;
        setProblem(data);
        setCode(data.defaultCode);
        setCustomVisualData(data.visualData ? JSON.stringify(data.visualData, null, 2) : '');
      } catch (error) {
        console.error(error);
        if (!cancelled) setProblem(null);
      }

      if (!cancelled) setLoading(false);
    };

    loadProblem();
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  // 2. Solved state + window title
  useEffect(() => {
    setSolved(getSolvedProblems().includes(problemId));
  }, [problemId]);

  useEffect(() => {
    if (problem) document.title = `DSA Lens · ${problem.title}`;
    return () => {
      document.title = 'DSA Lens';
    };
  }, [problem]);

  // 3. Monaco setup
  const handleEditorWillMount = (monaco) => {
    monaco.editor.defineTheme('dsa-lens', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '5c5c72', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'a78bfa' },
        { token: 'keyword.control', foreground: 'a78bfa' },
        { token: 'string', foreground: '7dd3fc' },
        { token: 'number', foreground: 'fbbf24' },
        { token: 'type', foreground: '93c5fd' },
        { token: 'type.identifier', foreground: '93c5fd' },
        { token: 'identifier', foreground: 'e6e6ee' },
        { token: 'function', foreground: '93c5fd' },
        { token: 'delimiter', foreground: '8b8b9e' },
        { token: 'operator', foreground: 'c4b5fd' },
        { token: 'constant', foreground: 'fbbf24' },
      ],
      colors: {
        'editor.background': '#0b0b11',
        'editor.foreground': '#e8e8ef',
        'editorLineNumber.foreground': '#3f3f52',
        'editorLineNumber.activeForeground': '#a78bfa',
        'editorCursor.foreground': '#a78bfa',
        'editor.selectionBackground': '#8b5cf63d',
        'editor.inactiveSelectionBackground': '#8b5cf61f',
        'editor.lineHighlightBackground': '#ffffff05',
        'editor.lineHighlightBorder': '#00000000',
        'editorIndentGuide.background1': '#ffffff08',
        'editorIndentGuide.activeBackground1': '#8b5cf63d',
        'editorWidget.background': '#12121a',
        'editorWidget.border': '#242433',
        'editorSuggestWidget.background': '#12121a',
        'editorSuggestWidget.border': '#242433',
        'editorSuggestWidget.selectedBackground': '#8b5cf626',
        'scrollbarSlider.background': '#ffffff10',
        'scrollbarSlider.hoverBackground': '#ffffff1c',
        'scrollbarSlider.activeBackground': '#ffffff28',
        'editorOverviewRuler.border': '#00000000',
        'editorGutter.background': '#0b0b11',
        'editorBracketHighlight.foreground1': '#a78bfa',
        'editorBracketHighlight.foreground2': '#60a5fa',
        'editorBracketHighlight.foreground3': '#34d399',
      },
    });
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // The panel reaches its final size after the first paint, so nudge Monaco
    // to measure again instead of staying at its initial 5x5 size.
    requestAnimationFrame(() => editor.layout());
    setTimeout(() => editor.layout(), 60);

    editor.onDidChangeCursorPosition((event) => {
      setCursor({
        line: event.position.lineNumber,
        column: event.position.column,
      });
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      runRef.current?.('run');
    });
  };

  // 4. Highlight the traced line and apply X-Ray AST diagnostics
  useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const newDecorations = [];

    // Line trace decoration
    if (currentLine) {
      newDecorations.push({
        range: new monaco.Range(currentLine, 1, currentLine, 1),
        options: {
          isWholeLine: true,
          className: 'active-line-highlight',
        },
      });
    }

    // X-Ray overlays from AST Inspector
    if (xrayActive && astReport) {
      // Highlight anti-patterns
      (astReport.antiPatternsDetected || []).forEach((ap) => {
        if (ap.line) {
          newDecorations.push({
            range: new monaco.Range(ap.line, 1, ap.line, 1),
            options: {
              isWholeLine: true,
              className: 'xray-antipattern-highlight',
              glyphMarginClassName: 'xray-glyph-warning',
              hoverMessage: { value: `⚠️ **Anti-Pattern**: ${ap.detail || ap.type}` },
            },
          });
        }
      });
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [currentLine, xrayActive, astReport]);

  // Universal argument extractor for test cases
  const getArgs = (sourceData, variables) => {
    if (!variables || !Array.isArray(variables)) return [];

    return variables.map((varName) => {
      if (sourceData[varName] !== undefined) return sourceData[varName];
      if (variables.length === 1 && typeof sourceData !== 'object') return sourceData;
      if (sourceData.input !== undefined) return sourceData.input;
      if (varName === 'head' && sourceData.values) return sourceData.values;
      return null;
    });
  };

  // 5. Run tests
  const handleRun = async (kind = 'run') => {
    if (!problem) return;

    setBottomTab('output');
    setOutput({ status: 'running' });
    const startedAt = performance.now();

    let entryFunc = problem.entryFunction;
    const functionMatch = code.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
    if (functionMatch && functionMatch[1]) entryFunc = functionMatch[1];

    let codeToRun = code;
    let entryToRun = entryFunc;

    const isList = problem.type === 'linked-list';

    if (isList) {
      const listWrappers = `
${LIST_NODE_HELPER}

def list_to_array(head):
    arr = []
    curr = head
    while curr:
        arr.append(curr.val)
        curr = curr.next
    return arr

def test_wrapper(arr):
    if arr is None: arr = []
    if not isinstance(arr, list): arr = []
    head = create_list(arr)
    result_head = ${entryFunc}(head)
    return list_to_array(result_head)
`;
      codeToRun = `${code}\n\n${listWrappers}`;
      entryToRun = 'test_wrapper';
    }

    const testCasesToRun = problem.testCases.map((testCase) => {
      let args;
      if (isList) {
        args = [testCase.head ?? testCase.values ?? testCase.input ?? testCase.arr ?? []];
      } else {
        args = getArgs(testCase, problem.inputVariables);
      }
      return { ...testCase, args };
    });

    const { results, error } = await runCode(
      codeToRun,
      testCasesToRun,
      entryToRun,
      problem.inputVariables
    );
    const durationMs = Math.round(performance.now() - startedAt);

    if (error) {
      setOutput({ status: 'error', message: error });
      setSubmissions((previous) =>
        [
          {
            id: Date.now(),
            kind,
            status: 'error',
            durationMs,
            passed: 0,
            total: problem.testCases.length,
            at: new Date(),
          },
          ...previous,
        ].slice(0, 8)
      );
      return;
    }

    const passedCount = results.filter((testCase) => testCase.passed).length;
    const allPassed = results.length > 0 && passedCount === results.length;

    setOutput({ status: 'success', cases: results });
    setSubmissions((previous) =>
      [
        {
          id: Date.now(),
          kind,
          status: allPassed ? 'passed' : 'failed',
          durationMs,
          passed: passedCount,
          total: results.length,
          at: new Date(),
        },
        ...previous,
      ].slice(0, 8)
    );

    if (allPassed) {
      markProblemSolved(problem.id);
      setSolved(true);

      // Update Elo on success.
      const domain = getDomainForProblem(meta, problem);
      const updated = updateElo('win', domain, problem.id, difficulty);
      setSkillProfile(updated);
    } else {
      // Update Elo on failure + record mistake archetype.
      const domain = getDomainForProblem(meta, problem);
      const updated = updateElo('loss', domain, problem.id, difficulty);
      setSkillProfile(updated);

      // Track the first failing case for hints.
      const firstFail = results.find((c) => !c.passed);
      if (firstFail) setFailingCase(firstFail);
    }

    // Run static AST analysis (zero tokens, client-side only).
    analyzeCode(code).then((report) => {
      setAstReport(report);
      if (!allPassed && report?.archetypeId) {
        recordMistake(report.archetypeId);
      }
    });

    // Auto-generate the trace for the first case.
    let inputData = problem.visualData;
    try {
      inputData = JSON.parse(customVisualData);
    } catch {
      // Keep the problem's default visual data when the editor has no valid JSON.
    }
    handleVisualize(inputData);
  };

  useEffect(() => {
    runRef.current = handleRun;
  });

  // 6. Generate a trace for given input data
  const handleVisualize = async (dataToVisualize) => {
    setIsVisualizing(true);
    setTraceData([]);
    setCurrentLine(0);

    try {
      const isList = problem.type === 'linked-list';

      let entryFunc = problem.entryFunction;
      const functionMatch = code.match(/^def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/m);
      if (functionMatch && functionMatch[1]) entryFunc = functionMatch[1];

      let fullCode = code;
      if (isList) {
        fullCode = `${LIST_NODE_HELPER}\n${code}\n\ndef dynamic_entry(arr):\n    h = create_list(arr)\n    ${entryFunc}(h)`;
        entryFunc = 'dynamic_entry';
      }

      let inputArgs = [];
      if (isList) {
        inputArgs = [
          dataToVisualize.values ?? dataToVisualize.nums ?? dataToVisualize.head ?? [],
        ];
      } else {
        inputArgs = problem.inputVariables.map((variableName) => {
          if (dataToVisualize[variableName] !== undefined) {
            return dataToVisualize[variableName];
          }
          if (variableName === 'nums') return dataToVisualize.nums || [];
          if (variableName === 'target') return dataToVisualize.target || 0;
          return null;
        });
      }

      const raw = await generateDynamicTrace(fullCode, entryFunc, inputArgs);
      const isEventStream = raw[0] && raw[0].event !== undefined;
      const steps = isEventStream
        ? transformEventTrace(raw)
        : transformDynamicTrace(raw, problem.type);

      if (steps && steps.length > 0) {
        setTraceData(steps);
        if (steps[0]) setCurrentLine(steps[0].line);
      }
    } catch (error) {
      console.error('Visualizer error:', error);
    } finally {
      setIsVisualizing(false);
    }
  };

  const applyVisualData = () => {
    try {
      const parsed = JSON.parse(customVisualData);
      setVisualDataError('');
      handleVisualize(parsed);
    } catch {
      setVisualDataError('That does not look like valid JSON.');
    }
  };

  const resetVisualData = () => {
    if (!problem) return;
    setCustomVisualData(JSON.stringify(problem.visualData ?? {}, null, 2));
    setVisualDataError('');
    handleVisualize(problem.visualData ?? {});
  };

  if (loading) {
    return (
      <div className="workspace-state">
        <Loader2 size={18} className="spin" />
        <p>Loading workspace…</p>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="workspace-state">
        <p>That problem could not be found.</p>
        <Link to="/" className="btn btn-submit">
          Back to problems
        </Link>
      </div>
    );
  }

  const showRightPanel = !problem.hideLiveTrace;
  const fileName = `${problem.id.replace(/-/g, '_')}.py`;
  const difficulty = meta?.difficulty || problem.difficulty || 'Easy';
  const topics = meta?.topics || [];
  const displayTitle = meta ? `${meta.number}. ${meta.title}` : problem.title;
  const isRunning = output?.status === 'running';
  const runDisabled = engineLoading || isRunning;

  const outputState = !output
    ? null
    : output.status === 'running'
    ? 'is-pending'
    : output.status === 'error'
    ? 'is-fail'
    : output.cases.every((testCase) => testCase.passed)
    ? 'is-pass'
    : 'is-fail';

  return (
    <div className={`workspace ${showRightPanel ? '' : 'no-trace'}`}>
      {/* LEFT: problem statement */}
      <aside className="panel description-panel">
        <div className="panel-tabs">
          {DESCRIPTION_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                className={`panel-tab ${descriptionTab === tab.id ? 'is-active' : ''}`}
                onClick={() => setDescriptionTab(tab.id)}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="panel-scroll">
          {descriptionTab === 'description' && (
            <>
              <div className="problem-head">
                <div className="problem-head-main">
                  <div className="problem-kicker">
                    <span>{meta ? `Problem ${meta.number}` : 'Problem'}</span>
                    {topics[0] && (
                      <>
                        <span className="kicker-dot" />
                        <span>{topics[0]}</span>
                      </>
                    )}
                  </div>
                  <h1>{displayTitle}</h1>
                </div>
                <div className="problem-head-side">
                  <span className={`diff ${difficulty.toLowerCase()}`}>{difficulty}</span>
                </div>
              </div>

              <div className="problem-meta">
                <span>
                  <Terminal size={12} /> Python 3
                </span>
                <span>
                  <Activity size={12} /> Auto trace
                </span>
                {solved && (
                  <span className="solved-chip">
                    <Check size={11} /> Solved
                  </span>
                )}
                <EloBadge profile={skillProfile} compact={false} />
              </div>

              <div className="problem-body">{problem.description}</div>
            </>
          )}

          {descriptionTab === 'solution' && (
            <div className="solution-view">
              <h2>{problem.approach?.title || 'Approach'}</h2>

              {problem.approach ? (
                <>
                  <p className="solution-idea">{problem.approach.idea}</p>

                  {problem.approach.steps?.length > 0 && (
                    <>
                      <h3>Steps</h3>
                      <ol className="solution-steps">
                        {problem.approach.steps.map((step, index) => (
                          <li key={index}>
                            <span>{index + 1}</span>
                            <p>{step}</p>
                          </li>
                        ))}
                      </ol>
                    </>
                  )}

                  <div className="complexity-grid">
                    <div className="complexity-card">
                      <span>Time</span>
                      <strong>{problem.approach.time}</strong>
                    </div>
                    <div className="complexity-card">
                      <span>Space</span>
                      <strong>{problem.approach.space}</strong>
                    </div>
                  </div>
                </>
              ) : (
                <p className="solution-idea">
                  Run your solution to inspect it line by line in the live trace. The reference
                  approach appears here for supported problems.
                </p>
              )}

              <div className="solution-callout">
                Edit the editor on the right — the tests and trace always use your code.
              </div>
            </div>
          )}

          {descriptionTab === 'submissions' && (
            <div className="submissions-view">
              <div className="submissions-title">
                <h2>Submissions</h2>
                {submissions.length > 0 && (
                  <span className="count-badge">{submissions.length}</span>
                )}
              </div>

              {submissions.length === 0 ? (
                <div className="empty-state">
                  <History size={18} />
                  <p>No submissions yet</p>
                  <span>Run your code to record a result here.</span>
                </div>
              ) : (
                <div className="submission-list">
                  <div className="submission-list-head">
                    <span>Time</span>
                    <span>Result</span>
                    <span>Tests</span>
                    <span>Runtime</span>
                  </div>
                  {submissions.map((submission) => (
                    <div key={submission.id} className="submission-row">
                      <span className="submission-time">
                        {submission.at.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className={`submission-verdict is-${submission.status}`}>
                        {submission.status === 'passed'
                          ? 'Accepted'
                          : submission.status === 'failed'
                          ? 'Wrong answer'
                          : 'Runtime error'}
                      </span>
                      <span className="submission-tests">
                        {submission.passed}/{submission.total}
                      </span>
                      <span className="submission-runtime">{submission.durationMs} ms</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* MIDDLE: editor + console */}
      <section className="panel workbench">
        <div className="file-tabs">
          <div className="file-tab is-active">
            <FileCode2 size={14} />
            <span>{fileName}</span>
            <span className="file-tab-state" aria-hidden="true" />
          </div>

          <div className="file-tab-actions">
            <button
              type="button"
              className="btn btn-run"
              onClick={() => handleRun('run')}
              disabled={runDisabled}
            >
              {engineLoading || isRunning ? (
                <Loader2 size={13} className="spin" />
              ) : (
                <Play size={12} fill="currentColor" />
              )}
              <span>{isRunning ? 'Running' : engineLoading ? 'Booting' : 'Run'}</span>
            </button>

            <button
              type="button"
              className="btn btn-submit"
              onClick={() => handleRun('submit')}
              disabled={runDisabled}
            >
              <Send size={12} />
              <span>Submit</span>
            </button>
          </div>
        </div>

        <div className="editor-breadcrumb">
          <span className="breadcrumb-root">My Code</span>
          <ChevronRight size={12} />
          <span className="breadcrumb-file">{fileName}</span>
          <span className="breadcrumb-spacer" />
          <span className="breadcrumb-lang">Python 3</span>
        </div>

        <div className="editor-host" style={{ position: 'relative' }}>
          {/* Ghost-Trace In-Editor Floating Overlay */}
          {ghostVariableOverlay && ghostVariableOverlay.memory && (
            <div className="ghost-trace-overlay">
              <span className="ghost-trace-badge">Line {ghostVariableOverlay.line} Step State:</span>
              <div className="ghost-trace-vars">
                {Object.entries(ghostVariableOverlay.memory)
                  .filter(([k]) => !['adapted_args', 'result'].includes(k))
                  .slice(0, 5)
                  .map(([k, v]) => (
                    <span key={k} className="ghost-var-item">
                      <code>{k}</code> = <strong>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</strong>
                    </span>
                  ))}
              </div>
            </div>
          )}
          <Editor
            height="100%"
            theme="dsa-lens"
            language="python"
            value={code}
            beforeMount={handleEditorWillMount}
            onMount={handleEditorDidMount}
            onChange={(value) => setCode(value || '')}
            loading={
              <div className="editor-loading">
                <Loader2 size={16} className="spin" />
              </div>
            }
            options={{
              minimap: { enabled: false },
              fontSize: 13.5,
              lineHeight: 23,
              fontFamily: "'JetBrains Mono', ui-monospace, monospace",
              fontLigatures: true,
              padding: { top: 16, bottom: 16 },
              lineNumbersMinChars: 3,
              glyphMargin: false,
              folding: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              renderLineHighlight: 'all',
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              bracketPairColorization: { enabled: true },
              guides: { indentation: false },
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              scrollbar: {
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                useShadows: false,
              },
              tabSize: 4,
            }}
          />
        </div>

        <div className="statusbar">
          <span className="statusbar-item statusbar-engine">
            <span className={`status-dot ${engineLoading ? 'is-loading' : ''}`} />
            {engineLoading ? 'Booting engine' : 'Pyodide ready'}
          </span>
          <span className="statusbar-item">
            Ln {cursor.line}, Col {cursor.column}
          </span>
          <span className="statusbar-item">Spaces: 4</span>
          <span className="statusbar-spacer" />
          <span className="statusbar-item">UTF-8</span>
          <span className="statusbar-item">Python</span>
        </div>

        <div className="bottom-panel">
          <div className="bottom-tabs">
            <button
              type="button"
              className={`tab-btn ${bottomTab === 'output' ? 'is-active' : ''}`}
              onClick={() => setBottomTab('output')}
            >
              <Terminal size={13} />
              Output
              {outputState && <span className={`tab-dot ${outputState}`} />}
            </button>

            <button
              type="button"
              className={`tab-btn ${bottomTab === 'testcases' ? 'is-active' : ''}`}
              onClick={() => setBottomTab('testcases')}
            >
              <FlaskConical size={13} />
              Testcases
              <span className="tab-count">{problem.testCases.length}</span>
            </button>

            <button
              type="button"
              className={`tab-btn ${bottomTab === 'hints' ? 'is-active' : ''}`}
              onClick={() => setBottomTab('hints')}
            >
              <Lightbulb size={13} />
              Adaptive Hints
              {astReport?.archetypeId && astReport.archetypeId !== 'unknown' && (
                <span className="tab-dot is-pending" />
              )}
            </button>

            <span className="bottom-tabs-spacer" />

            <button
              type="button"
              className="icon-btn icon-btn-sm"
              onClick={() => setOutput(null)}
              disabled={!output}
              title="Clear output"
              aria-label="Clear output"
            >
              <Trash2 size={13} />
            </button>
          </div>

          <div className="bottom-body">
            {bottomTab === 'output' ? (
              <ExecutionConsole output={output} />
            ) : bottomTab === 'testcases' ? (
              <div className="testcases">
                {problem.testCases.map((testCase, index) => (
                  <div className="testcase" key={index}>
                    <div className="testcase-head">
                      <span>Case {index + 1}</span>
                    </div>
                    <div className="testcase-body">
                      {problem.inputVariables.map((variable) => (
                        <div className="testcase-line" key={variable}>
                          <span className="tc-key">{variable}</span>
                          <span className="tc-op">=</span>
                          <code>{formatCaseValue(getCaseValue(testCase, variable))}</code>
                        </div>
                      ))}
                      <div className="testcase-line is-expected">
                        <span className="tc-key">expected</span>
                        <span className="tc-op">=</span>
                        <code>{formatCaseValue(testCase.expected)}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="hints-tab-content" style={{ padding: '12px' }}>
                <HintDrawer
                  astReport={astReport}
                  problemId={problem.id}
                  isOpen={true}
                  onToggle={() => {}}
                  failingCase={failingCase}
                  code={code}
                  onOpenTokenModal={() => setShowTokenDashboard(true)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* RIGHT: live trace and AST breakdown */}
      {showRightPanel && (
        <aside className="panel trace-panel">
          <div className="panel-head">
            <div className="panel-tabs-mini">
              <button
                type="button"
                className={`panel-tab-mini ${rightPanelTab === 'trace' ? 'is-active' : ''}`}
                onClick={() => setRightPanelTab('trace')}
              >
                <Activity size={13} />
                <span>Live trace</span>
                {traceData.length > 0 && (
                  <span className="count-badge">{traceData.length}</span>
                )}
              </button>

              <button
                type="button"
                className={`panel-tab-mini ${rightPanelTab === 'ast' ? 'is-active' : ''}`}
                onClick={() => setRightPanelTab('ast')}
              >
                <FileCode2 size={13} />
                <span>AST X-Ray</span>
                {astReport?.archetypeId && astReport.archetypeId !== 'unknown' && (
                  <span className="status-dot" style={{ width: 6, height: 6 }} />
                )}
              </button>
            </div>

            <div className="panel-actions">
              {isVisualizing && (
                <span className="trace-loading">
                  <Loader2 size={11} className="spin" /> tracing
                </span>
              )}
              {rightPanelTab === 'trace' && (
                <button
                  type="button"
                  className={`icon-btn icon-btn-sm ${showVisualInput ? 'is-active' : ''}`}
                  onClick={() => setShowVisualInput((previous) => !previous)}
                  title="Edit trace input"
                  aria-label="Edit trace input"
                >
                  <SlidersHorizontal size={14} />
                </button>
              )}
            </div>
          </div>

          {rightPanelTab === 'trace' ? (
            <>
              {showVisualInput && (
                <div className="trace-input">
                  <div className="trace-input-head">
                    <span>Trace input</span>
                    <span className="trace-input-lang">JSON</span>
                  </div>
                  <textarea
                    value={customVisualData}
                    onChange={(event) => setCustomVisualData(event.target.value)}
                    spellCheck="false"
                    aria-label="Trace input JSON"
                  />
                  {visualDataError && <div className="field-error">{visualDataError}</div>}
                  <div className="trace-input-actions">
                    <button type="button" className="btn btn-ghost" onClick={resetVisualData}>
                      Reset
                    </button>
                    <button type="button" className="btn btn-primary" onClick={applyVisualData}>
                      Apply &amp; trace
                    </button>
                  </div>
                </div>
              )}

              <div className="trace-body">
                <VisualizerRenderer
                  traceSteps={traceData}
                  onStepChange={(line, step) => {
                    setCurrentLine(line);
                    if (step?.memory) {
                      setGhostVariableOverlay({ line, memory: step.memory });
                    }
                  }}
                />
              </div>
            </>
          ) : (
            <div className="trace-body ast-body-wrapper" style={{ padding: '14px', overflowY: 'auto' }}>
              <ASTVisualizer
                astReport={astReport}
                code={code}
                xrayActive={xrayActive}
                onToggleXRay={() => setXrayActive(!xrayActive)}
                onHighlightLine={(line) => {
                  setCurrentLine(line);
                  editorRef.current?.revealLineInCenter(line);
                }}
              />
            </div>
          )}
        </aside>
      )}

      {/* Token Economics & LLM Settings Modal */}
      <TokenUsageDashboard
        isOpen={showTokenDashboard}
        onClose={() => setShowTokenDashboard(false)}
      />
    </div>
  );
};

export default ProblemWorkspace;
