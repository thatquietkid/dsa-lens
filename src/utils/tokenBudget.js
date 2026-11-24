// src/utils/tokenBudget.js
// Tracks and enforces token budgets and rate-limits for Tier 3 AI mentor requests.

const TOKEN_STORAGE_KEY = 'dsalens:token_budget';
const RATE_LIMIT_STORAGE_KEY = 'dsalens:ai_hint_timestamps';

const MAX_HINTS_PER_WINDOW = 3;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const DEFAULT_SESSION_BUDGET = 5000; // 5,000 token soft cap

/**
 * Get current token usage metrics.
 */
export const getTokenMetrics = () => {
  try {
    const raw = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!raw) {
      return {
        totalTokensUsed: 0,
        promptTokens: 0,
        completionTokens: 0,
        callsCount: 0,
        sessionBudget: DEFAULT_SESSION_BUDGET,
        history: [], // { timestamp, promptTokens, completionTokens, problemId }
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalTokensUsed: 0,
      promptTokens: 0,
      completionTokens: 0,
      callsCount: 0,
      sessionBudget: DEFAULT_SESSION_BUDGET,
      history: [],
    };
  }
};

/**
 * Record token expenditure.
 */
export const recordTokenUsage = ({ promptTokens = 0, completionTokens = 0, problemId = '' }) => {
  const metrics = getTokenMetrics();
  const total = promptTokens + completionTokens;

  metrics.totalTokensUsed += total;
  metrics.promptTokens += promptTokens;
  metrics.completionTokens += completionTokens;
  metrics.callsCount += 1;
  metrics.history = [
    {
      timestamp: Date.now(),
      promptTokens,
      completionTokens,
      total,
      problemId,
    },
    ...metrics.history,
  ].slice(0, 50);

  try {
    window.localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(metrics));
  } catch {
    // Non-critical fallback
  }

  return metrics;
};

/**
 * Rate limit check: Max 3 AI hints per 10 minutes.
 * Returns: { allowed: boolean, remaining: number, resetInMs: number }
 */
export const checkRateLimit = () => {
  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];

    // Filter to timestamps within the window
    const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);

    if (validTimestamps.length >= MAX_HINTS_PER_WINDOW) {
      const oldestInWindow = Math.min(...validTimestamps);
      const resetInMs = WINDOW_MS - (now - oldestInWindow);
      return {
        allowed: false,
        remaining: 0,
        resetInMs: Math.max(0, resetInMs),
      };
    }

    return {
      allowed: true,
      remaining: MAX_HINTS_PER_WINDOW - validTimestamps.length,
      resetInMs: 0,
    };
  } catch {
    return { allowed: true, remaining: MAX_HINTS_PER_WINDOW, resetInMs: 0 };
  }
};

/**
 * Records an AI hint request for rate-limiting.
 */
export const recordRateLimitHit = () => {
  try {
    const now = Date.now();
    const raw = window.localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
    const timestamps = raw ? JSON.parse(raw) : [];
    const validTimestamps = timestamps.filter((ts) => now - ts < WINDOW_MS);
    validTimestamps.push(now);
    window.localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify(validTimestamps));
  } catch {
    // Non-critical
  }
};

/**
 * Reset token metrics for testing or new sessions.
 */
export const resetTokenMetrics = () => {
  try {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
  } catch {
    // Non-critical
  }
};
