import React from 'react';
import {
  CheckCircle2,
  Loader2,
  Play,
  Terminal,
  XCircle,
} from 'lucide-react';

const formatValue = (value) => {
  if (value === undefined) return '—';
  if (typeof value === 'string') return JSON.stringify(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const ExecutionConsole = ({ output }) => {
  if (!output) {
    return (
      <div className="console-empty">
        <span className="console-empty-icon">
          <Play size={15} />
        </span>
        <p>Run your code to see test results</p>
        <span className="console-hint">
          <kbd>Ctrl</kbd> + <kbd>Enter</kbd>
        </span>
      </div>
    );
  }

  return (
    <div className="console">
      {output.status === 'running' && (
        <div className="console-running">
          <Loader2 size={15} className="spin" />
          <span>Running tests…</span>
        </div>
      )}

      {output.status === 'error' && (
        <div className="console-error">
          <div className="console-error-head">
            <XCircle size={15} />
            <span>Runtime error</span>
          </div>
          <pre className="console-error-body">{output.message}</pre>
        </div>
      )}

      {output.status === 'success' && (
        <div className="console-success">
          <div className="console-summary">
            <span
              className={`verdict ${
                output.cases.every((testCase) => testCase.passed) ? 'is-pass' : 'is-fail'
              }`}
            >
              {output.cases.every((testCase) => testCase.passed) ? 'Accepted' : 'Not accepted'}
            </span>
            <span className="console-summary-text">
              {output.cases.filter((testCase) => testCase.passed).length} /{' '}
              {output.cases.length} test cases passed
            </span>
            <span className="console-summary-icon">
              <Terminal size={14} />
            </span>
          </div>

          <div className="case-list">
            {output.cases.map((testCase, index) => (
              <div
                key={index}
                className={`case ${testCase.passed ? 'is-pass' : 'is-fail'}`}
              >
                <div className="case-head">
                  <span className="case-icon">
                    {testCase.passed ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                  </span>
                  <span className="case-name">Case {index + 1}</span>
                  <span className="case-status">
                    {testCase.passed ? 'Passed' : 'Failed'}
                  </span>
                </div>

                {!testCase.passed && (
                  <div className="case-details">
                    <div className="case-kv">
                      <span>Input</span>
                      <code>{formatValue(testCase.input)}</code>
                    </div>
                    <div className="case-kv">
                      <span>Expected</span>
                      <code className="is-expected">{formatValue(testCase.expected)}</code>
                    </div>
                    <div className="case-kv">
                      <span>Output</span>
                      <code className="is-actual">{formatValue(testCase.actual)}</code>
                    </div>
                    {testCase.error && (
                      <div className="case-error">{testCase.error}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExecutionConsole;
