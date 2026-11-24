import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronRight, Sparkles, X } from 'lucide-react';
import { completeDiagnostic, getSkillProfile } from '../../utils/skillRating';

/**
 * Diagnostic warm-up: 3 short "code-tracing" challenges.
 * Each shows a small code snippet and asks the user to predict the output
 * after a fixed number of iterations. Answers calibrate initial domain Elos.
 *
 * Props:
 *   open       — boolean controlling visibility
 *   onClose    — called when the modal is dismissed
 *   onComplete — called with the updated SkillProfile after calibration
 */

const QUESTIONS = [
  {
    id: 'q1',
    domain: 'arrays_hashing',
    title: 'Array scan',
    code: `nums = [3, 1, 4, 1, 5]
total = 0
for n in nums:
    if n > 2:
        total += n
# What is total?`,
    options: ['7', '12', '14', '5'],
    answer: '12', // 3 + 4 + 5
    explanation: 'Only 3, 4, and 5 are greater than 2. Their sum is 12.',
  },
  {
    id: 'q2',
    domain: 'stack',
    title: 'Stack operations',
    code: `stack = []
for ch in "a(b)c":
    if ch == '(':
        stack.append(ch)
    elif ch == ')':
        stack.pop()
    else:
        stack.append(ch)
# What is stack?`,
    options: ["['a', 'b', 'c']", "['a', '(', 'b']", "['(', 'b', ')']", "['a', 'c']"],
    answer: "['a', 'b', 'c']",
    explanation: "Letters are pushed. '(' is pushed then ')' pops it, leaving a, b on the stack, then c is pushed.",
  },
  {
    id: 'q3',
    domain: 'binary_search',
    title: 'Loop tracing',
    code: `left, right = 0, 7
steps = 0
while left <= right:
    mid = (left + right) // 2
    if mid < 5:
        left = mid + 1
    else:
        right = mid - 1
    steps += 1
# What is steps?`,
    options: ['2', '3', '4', '8'],
    answer: '3',
    explanation: 'Iteration 1: mid=3 → left=4. Iteration 2: mid=5 → right=4. Iteration 3: mid=4 → left=5. Now left>right, so 3 steps.',
  },
];

const WarmupModal = ({ open, onClose, onComplete }) => {
  const [step, setStep] = useState(0); // 0 = intro, 1..3 = questions, 4 = results
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestion = step >= 1 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

  const isCorrect = currentQuestion && selectedOption === currentQuestion.answer;

  const handleSelect = (option) => {
    if (showFeedback) return; // already answered
    setSelectedOption(option);
    setShowFeedback(true);
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: option === currentQuestion.answer }));
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowFeedback(false);

    if (step < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      // Compute calibrated scores
      const scores = {};
      QUESTIONS.forEach((q) => {
        const correct = answers[q.id];
        scores[q.domain] = correct ? 1150 : 850;
      });
      const profile = completeDiagnostic(scores);
      setStep(QUESTIONS.length + 1);
      if (onComplete) onComplete(profile);
    }
  };

  const handleSkip = () => {
    const profile = completeDiagnostic({});
    if (onComplete) onComplete(profile);
    onClose();
  };

  const correctCount = Object.values(answers).filter(Boolean).length;

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="warmup-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          className="warmup-modal"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.97 }}
          transition={{ duration: 0.25 }}
        >
          <button className="warmup-close" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>

          {/* INTRO */}
          {step === 0 && (
            <div className="warmup-intro">
              <div className="warmup-icon-wrap">
                <Brain size={28} />
              </div>
              <h2>Quick Calibration</h2>
              <p>
                Answer 3 short code-tracing questions so we can tailor problem
                difficulty to your level. Takes about 60 seconds.
              </p>
              <div className="warmup-actions">
                <button className="btn btn-primary" onClick={() => setStep(1)}>
                  <Sparkles size={13} />
                  Start
                </button>
                <button className="btn btn-ghost" onClick={handleSkip}>
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* QUESTION */}
          {currentQuestion && (
            <div className="warmup-question">
              <div className="warmup-progress">
                <span>Question {step} of {QUESTIONS.length}</span>
                <div className="warmup-progress-bar">
                  <div
                    className="warmup-progress-fill"
                    style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
                  />
                </div>
              </div>

              <h3>{currentQuestion.title}</h3>

              <pre className="warmup-code">{currentQuestion.code}</pre>

              <div className="warmup-options">
                {currentQuestion.options.map((option) => {
                  let cls = 'warmup-option';
                  if (showFeedback) {
                    if (option === currentQuestion.answer) cls += ' is-correct';
                    else if (option === selectedOption) cls += ' is-wrong';
                  } else if (option === selectedOption) {
                    cls += ' is-selected';
                  }
                  return (
                    <button
                      key={option}
                      className={cls}
                      onClick={() => handleSelect(option)}
                      disabled={showFeedback}
                    >
                      <code>{option}</code>
                    </button>
                  );
                })}
              </div>

              {showFeedback && (
                <motion.div
                  className={`warmup-feedback ${isCorrect ? 'is-correct' : 'is-wrong'}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <strong>{isCorrect ? 'Correct!' : 'Not quite.'}</strong>
                  <span>{currentQuestion.explanation}</span>
                </motion.div>
              )}

              {showFeedback && (
                <div className="warmup-actions">
                  <button className="btn btn-primary" onClick={handleNext}>
                    {step < QUESTIONS.length ? 'Next' : 'See Results'}
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* RESULTS */}
          {step === QUESTIONS.length + 1 && (
            <div className="warmup-results">
              <div className="warmup-icon-wrap">
                <Sparkles size={28} />
              </div>
              <h2>Calibration Complete</h2>
              <p>
                You got <strong>{correctCount}</strong> out of <strong>{QUESTIONS.length}</strong> correct.
                We've adjusted your starting difficulty accordingly.
              </p>
              <div className="warmup-actions">
                <button className="btn btn-primary" onClick={onClose}>
                  Start Solving
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default WarmupModal;
