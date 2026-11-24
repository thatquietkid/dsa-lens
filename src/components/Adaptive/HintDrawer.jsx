import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Zap, MessageSquare, X, AlertTriangle, Sparkles } from 'lucide-react';
import hintTemplates, { getHint, getArchetypeLabel } from '../../hints';
import { requestLLMHint } from '../../services/aiHintService';
import { checkRateLimit } from '../../utils/tokenBudget';

/**
 * 3-tier Socratic hint drawer.
 *
 * Tier 1 (Socratic Nudge)   — 0 tokens, deterministic template
 * Tier 2 (Pattern Suggestion) — 0 tokens, deterministic template
 * Tier 3 (AI Coach)          — capped LLM call (implemented in Phase 3)
 *
 * Props:
 *   astReport      — ASTDiagnosticReport from the static analyzer
 *   problemId      — string
 *   isOpen         — boolean
 *   onToggle       — () => void
 *   failingCase    — { input, expected, actual } | null
 */

const TIERS = [
  { id: 1, label: 'Nudge',      icon: HelpCircle,    cost: 'Free' },
  { id: 2, label: 'Pattern',    icon: Zap,           cost: 'Free' },
  { id: 3, label: 'AI Coach',   icon: MessageSquare,  cost: 'Tokens' },
];

const HintDrawer = ({ astReport, problemId, isOpen, onToggle, failingCase, code = '', onOpenTokenModal }) => {
  const [revealedTier, setRevealedTier] = useState(0); // 0 = none revealed yet
  const [aiHint, setAiHint] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  // Reset revealed tiers when the problem or report changes.
  useEffect(() => {
    setRevealedTier(0);
    setAiHint(null);
  }, [problemId, astReport?.archetypeId]);

  const archetype = astReport?.archetypeId || 'unknown';
  const template = hintTemplates[archetype] || hintTemplates['unknown'];

  // Check for anti-pattern-specific hints.
  const antiPatternHints = (astReport?.antiPatternsDetected || []).map((ap) => {
    const t = hintTemplates[ap.type];
    return t ? { ...ap, ...t } : ap;
  });

  const revealNext = () => {
    if (revealedTier < 3) {
      setRevealedTier(revealedTier + 1);
    }
  };

  const handleAiHint = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const res = await requestLLMHint({
        problemId,
        archetypeId: astReport?.archetypeId,
        complexity: astReport?.detectedComplexity,
        failingCase,
        codeSnippet: code,
      });
      setAiHint(res.hint);
    } catch (err) {
      setAiError(err.message || 'Failed to generate AI hint.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className={`hint-drawer ${isOpen ? 'is-open' : ''}`}>
      <button className="hint-drawer-toggle" onClick={onToggle}>
        <HelpCircle size={14} />
        <span>Hints</span>
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="hint-drawer-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Detected archetype banner */}
            {astReport && archetype !== 'unknown' && (
              <div className="hint-archetype">
                <span className="hint-archetype-label">Detected pattern</span>
                <span className="hint-archetype-value">{template.label}</span>
                {astReport.detectedComplexity && (
                  <span className="hint-complexity">
                    Time: {astReport.detectedComplexity.time} · Space: {astReport.detectedComplexity.space}
                  </span>
                )}
              </div>
            )}

            {/* Anti-pattern warnings */}
            {antiPatternHints.length > 0 && (
              <div className="hint-warnings">
                {antiPatternHints.map((ap, i) => (
                  <div className="hint-warning" key={i}>
                    <Zap size={12} />
                    <span>
                      Line {ap.line}: {ap.detail}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Tier buttons */}
            <div className="hint-tiers">
              {TIERS.map((tier) => {
                const isRevealed = tier.id <= revealedTier;
                const isNext = tier.id === revealedTier + 1;
                const TierIcon = tier.icon;

                return (
                  <div className={`hint-tier ${isRevealed ? 'is-revealed' : ''}`} key={tier.id}>
                    <div className="hint-tier-head">
                      <TierIcon size={13} />
                      <span className="hint-tier-label">
                        Tier {tier.id}: {tier.label}
                      </span>
                      <span className={`hint-tier-cost ${tier.cost === 'Tokens' ? 'is-paid' : ''}`}>
                        {tier.cost}
                      </span>
                    </div>

                    {isRevealed && tier.id <= 2 && (
                      <motion.div
                        className="hint-tier-content"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <p>{tier.id === 1 ? template.tier1 : template.tier2}</p>
                      </motion.div>
                    )}

                    {isRevealed && tier.id === 3 && (
                      <motion.div
                        className="hint-tier-content"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        {aiHint ? (
                          <div className="ai-hint-box">
                            <Sparkles size={13} className="text-violet" />
                            <p>{aiHint}</p>
                          </div>
                        ) : (
                          <div className="ai-hint-trigger">
                            <p className="ai-prompt-desc">
                              The AI Mentor evaluates your exact AST delta and failing case with maximum 70-word Socratic feedback.
                            </p>
                            {aiError && (
                              <div className="ai-hint-error">
                                <AlertTriangle size={13} />
                                <span>{aiError}</span>
                              </div>
                            )}
                            <div className="ai-hint-btns">
                              <button
                                className="btn btn-primary hint-ai-btn"
                                onClick={handleAiHint}
                                disabled={aiLoading}
                              >
                                {aiLoading ? 'Thinking with LLM…' : 'Consult AI Coach (< 150 Tokens)'}
                              </button>
                              {onOpenTokenModal && (
                                <button
                                  type="button"
                                  className="btn btn-ghost"
                                  onClick={onOpenTokenModal}
                                >
                                  Configure API Key / Budget
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {isNext && !isRevealed && (
                      <button className="hint-reveal-btn" onClick={revealNext}>
                        Reveal Tier {tier.id}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {revealedTier === 0 && (
              <div className="hint-cta">
                <p>Stuck? Reveal hints one tier at a time. Try to solve it with minimal help.</p>
                <button className="btn btn-primary hint-start-btn" onClick={revealNext}>
                  <HelpCircle size={13} />
                  Show first hint
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HintDrawer;
