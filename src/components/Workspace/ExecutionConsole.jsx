import React from 'react';
import {
  Play,
  Loader2,
  XCircle,
  CheckCircle2
} from 'lucide-react';

const ExecutionConsole = ({ output }) => {
  // EMPTY STATE
  if (!output) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-gray-900 border-t border-gray-700">
        <div className="text-center">
          <Play className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>Run your code to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-4 bg-gray-900 border-t border-gray-700 font-mono text-sm">

      {/* HEADER */}
      <h3 className="text-gray-400 text-xs uppercase font-bold mb-4">
        Console Output
      </h3>

      {/* RUNNING */}
      {output.status === 'running' && (
        <div className="flex items-center text-yellow-400">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Running tests...
        </div>
      )}

      {/* ERROR */}
      {output.status === 'error' && (
        <div className="space-y-2">
          <div className="flex items-center text-red-400 font-bold mb-3">
            <XCircle className="w-5 h-5 mr-2" />
            Runtime Error
          </div>
          <div className="bg-red-950/30 border border-red-800 rounded p-3 whitespace-pre-wrap text-red-300">
            {output.message}
          </div>
        </div>
      )}

      {/* SUCCESS */}
      {output.status === 'success' && (
        <div className="space-y-4">

          {/* SUMMARY */}
          <div className="flex items-center justify-between">
            <span className="text-white font-bold">
              {output.cases.filter(c => c.passed).length} / {output.cases.length} Test Cases Passed
            </span>

            {output.cases.every(c => c.passed) && (
              <span className="text-green-400 flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-1" />
                All tests passed!
              </span>
            )}
          </div>

          {/* TEST CASES */}
          {output.cases.map((testCase, i) => (
            <div
              key={i}
              className={`border rounded-lg overflow-hidden ${
                testCase.passed
                  ? 'border-green-800 bg-green-950/20'
                  : 'border-red-800 bg-red-950/20'
              }`}
            >
              {/* CASE HEADER */}
              <div
                className={`px-4 py-2 flex items-center justify-between ${
                  testCase.passed ? 'bg-green-900/30' : 'bg-red-900/30'
                }`}
              >
                <span className="flex items-center font-bold">
                  {testCase.passed ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                  ) : (
                    <XCircle className="w-4 h-4 mr-2 text-red-400" />
                  )}
                  <span className={testCase.passed ? 'text-green-400' : 'text-red-400'}>
                    Test Case {i + 1}
                  </span>
                </span>

                <span className={`text-xs ${testCase.passed ? 'text-green-400' : 'text-red-400'}`}>
                  {testCase.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>

              {/* FAILURE DETAILS */}
              {!testCase.passed && (
                <div className="px-4 py-3 space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400">Input:</span>
                    <div className="ml-4 text-gray-300">
                      {JSON.stringify(testCase.input)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected:</span>
                    <div className="ml-4 text-green-400">
                      {JSON.stringify(testCase.expected)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Got:</span>
                    <div className="ml-4 text-red-400">
                      {JSON.stringify(testCase.output)}
                    </div>
                  </div>

                  {testCase.error && (
                    <div className="pt-2 mt-2 border-t border-red-800 text-red-400">
                      {testCase.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExecutionConsole;
