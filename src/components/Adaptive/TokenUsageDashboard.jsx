import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Cpu,
  ShieldCheck,
  RotateCcw,
  Key,
  Save,
  Check,
  AlertTriangle,
  X,
} from 'lucide-react';
import { getTokenMetrics, resetTokenMetrics } from '../../utils/tokenBudget';
import { getLLMConfig, saveLLMConfig } from '../../services/aiHintService';

const TokenUsageDashboard = ({ isOpen, onClose }) => {
  const [metrics, setMetrics] = useState(getTokenMetrics());
  const [config, setConfig] = useState(getLLMConfig());
  const [keyInput, setKeyInput] = useState(config.apiKey || '');
  const [provider, setProvider] = useState(config.provider || 'gemini');
  const [model, setModel] = useState(config.model || 'gemini-1.5-flash');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setMetrics(getTokenMetrics());
      const loaded = getLLMConfig();
      setConfig(loaded);
      setKeyInput(loaded.apiKey || '');
      setProvider(loaded.provider || 'gemini');
      setModel(loaded.model || 'gemini-1.5-flash');
      setSavedSuccess(false);
    }
  }, [isOpen]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    const updated = {
      ...config,
      provider,
      apiKey: keyInput.trim(),
      model: model.trim(),
    };
    saveLLMConfig(updated);
    setConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleReset = () => {
    resetTokenMetrics();
    setMetrics(getTokenMetrics());
  };

  // if (!isOpen) return null; // handled conditionally inside AnimatePresence for clean exit transitions

  const budgetUsedPct = Math.min(
    100,
    Math.round((metrics.totalTokensUsed / metrics.sessionBudget) * 100)
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="token-modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose?.();
            }
          }}
        >
          <motion.div
            className="token-modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
          >
            <div className="token-modal-header">
              <div className="token-modal-title">
                <Coins size={16} />
                <span>Token Economics & AI Mentor Settings</span>
              </div>
              <button
                type="button"
                className="icon-btn icon-btn-sm token-close-btn"
                onClick={onClose}
                aria-label="Close"
                title="Close (Esc)"
              >
                <X size={15} />
              </button>
            </div>

          <div className="token-modal-body">
            {/* Session Budget Progress */}
            <div className="token-budget-card">
              <div className="budget-row">
                <span className="budget-label">Session Token Expenditure</span>
                <span className="budget-numbers">
                  <strong>{metrics.totalTokensUsed}</strong> / {metrics.sessionBudget} tokens
                </span>
              </div>
              <div className="budget-track">
                <div
                  className={`budget-fill ${budgetUsedPct > 80 ? 'is-warning' : ''}`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
              <div className="budget-stats">
                <span>Prompt tokens: {metrics.promptTokens}</span>
                <span>Completion tokens: {metrics.completionTokens}</span>
                <span>Calls made: {metrics.callsCount}</span>
              </div>
            </div>

            {/* Zero-Token Architecture Callout */}
            <div className="zero-token-alert">
              <ShieldCheck size={16} className="text-green" />
              <p>
                <strong>Zero-Token Guarantee:</strong> 85%+ of hints and all AST diagnostic
                inspections run entirely inside your browser via Pyodide. Tokens are strictly spent
                only when escalating to Tier 3 AI Mentor.
              </p>
            </div>

            {/* Configure User API Key */}
            <form onSubmit={handleSaveConfig} className="token-config-form">
              <div className="form-head">
                <Key size={14} />
                <span>Custom LLM Configuration</span>
              </div>

              <div className="form-group">
                <label>Provider</label>
                <select
                  value={provider}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProvider(val);
                    if (val === 'gemini') setModel('gemini-1.5-flash');
                    if (val === 'openai') setModel('gpt-4o-mini');
                  }}
                >
                  <option value="gemini">Google Gemini (Gemini 1.5 Flash)</option>
                  <option value="openai">OpenAI (GPT-4o mini)</option>
                  <option value="custom_proxy">Custom Proxy Endpoint</option>
                </select>
              </div>

              <div className="form-group">
                <label>Model Identifier</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gemini-1.5-flash"
                />
              </div>

              <div className="form-group">
                <label>API Key</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="Enter your API Key (stored locally)"
                />
                <span className="form-hint">
                  Saved only in browser localStorage. Never sent to any third-party server.
                </span>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {savedSuccess ? (
                    <>
                      <Check size={13} /> Saved!
                    </>
                  ) : (
                    <>
                      <Save size={13} /> Save Key
                    </>
                  )}
                </button>

                <button type="button" className="btn btn-ghost" onClick={handleReset}>
                  <RotateCcw size={13} /> Reset Budget Stats
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default TokenUsageDashboard;
