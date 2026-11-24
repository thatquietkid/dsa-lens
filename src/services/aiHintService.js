// src/services/aiHintService.js
// Compact AI Hint client communicating with user-provided API key or proxy worker.

import { checkRateLimit, recordRateLimitHit, recordTokenUsage } from '../utils/tokenBudget.js';

const API_CONFIG_KEY = 'dsalens:llm_config';

/**
 * Retrieve saved LLM configuration (stored safely in browser localStorage).
 */
export const getLLMConfig = () => {
  try {
    const raw = window.localStorage.getItem(API_CONFIG_KEY);
    if (!raw) {
      return {
        provider: 'gemini', // 'gemini' | 'openai' | 'anthropic' | 'custom_proxy'
        apiKey: '',
        customEndpoint: '',
        model: 'gemini-1.5-flash',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      provider: 'gemini',
      apiKey: '',
      customEndpoint: '',
      model: 'gemini-1.5-flash',
    };
  }
};

export const saveLLMConfig = (config) => {
  try {
    window.localStorage.setItem(API_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // Non-critical
  }
};

/**
 * Builds the Ultra-Compact 4-Tuple (< 120 tokens input)
 * { pid, archetype, failDelta, approachTag }
 */
export const buildCompactPayload = ({
  problemId,
  archetypeId = 'unknown',
  complexity = {},
  failingCase = null,
  codeSnippet = '',
}) => {
  // Compress failing case to minimum delta
  let failSummary = 'None';
  if (failingCase) {
    const inputStr = JSON.stringify(failingCase.input || '').slice(0, 80);
    const gotStr = JSON.stringify(failingCase.actual ?? failingCase.error ?? '').slice(0, 40);
    const expStr = JSON.stringify(failingCase.expected ?? '').slice(0, 40);
    failSummary = `in:${inputStr} got:${gotStr} exp:${expStr}`;
  }

  return {
    pid: problemId,
    arch: archetypeId,
    comp: `${complexity.time || '?'}/${complexity.space || '?'}`,
    fail: failSummary,
    snippet: (codeSnippet || '').trim().slice(0, 180), // first 180 chars only
  };
};

/**
 * Request an AI Socratic Hint with hard-capped output tokens (< 150 tokens).
 */
export const requestLLMHint = async ({
  problemId,
  archetypeId,
  complexity,
  failingCase,
  codeSnippet,
}) => {
  // 1. Rate Limit Gate
  const rateLimit = checkRateLimit();
  if (!rateLimit.allowed) {
    const waitMins = Math.ceil(rateLimit.resetInMs / 60000);
    throw new Error(
      `Rate limit reached (max 3 AI hints per 10 mins). Please wait ${waitMins} min before requesting another AI hint.`
    );
  }

  const config = getLLMConfig();
  const payload = buildCompactPayload({
    problemId,
    archetypeId,
    complexity,
    failingCase,
    codeSnippet,
  });

  // System instruction enforcing Socratic, token-frugal response
  const systemPrompt = `You are a DSA Socratic Tutor. Never give complete solutions or full code.
Given an ultra-compact summary of a student's mistake:
- Identify the invariant misconception in <= 50 words.
- Ask one guided question to help them find the fix.
Keep response strictly under 70 words.`;

  const userPrompt = `Problem: ${payload.pid}
Pattern: ${payload.arch} (${payload.comp})
Failed Test: ${payload.fail}
Code Sample:
${payload.snippet}`;

  // If no API key configured, provide an educational simulated hint while prompting user to configure their key
  if (!config.apiKey && !config.customEndpoint) {
    // Record rate limit hit even in mock mode to verify system behavior
    recordRateLimitHit();
    recordTokenUsage({ promptTokens: 95, completionTokens: 45, problemId });

    return {
      hint: `[Simulated AI Coach]: Notice where your code diverges on "${payload.fail}". Your current logic assumes elements can be checked sequentially without tracking seen history. What invariant is broken? (Add your LLM API Key in Settings for live model responses).`,
      simulated: true,
      tokensUsed: 140,
    };
  }

  let hintText = '';
  let promptTokens = 110;
  let completionTokens = 45;

  try {
    if (config.provider === 'gemini') {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${
        config.model || 'gemini-1.5-flash'
      }:generateContent?key=${config.apiKey}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.3,
          },
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      hintText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No hint generated.';
      promptTokens = data.usageMetadata?.promptTokenCount || 105;
      completionTokens = data.usageMetadata?.candidatesTokenCount || 48;
    } else if (config.provider === 'openai') {
      const endpoint = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 150,
          temperature: 0.3,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `API error ${res.status}`);
      }

      const data = await res.json();
      hintText = data.choices?.[0]?.message?.content || 'No hint generated.';
      promptTokens = data.usage?.prompt_tokens || 110;
      completionTokens = data.usage?.completion_tokens || 45;
    } else {
      // Fallback custom proxy
      const endpoint = config.customEndpoint || '/api/hint-proxy';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });
      const data = await res.json();
      hintText = data.hint || 'No hint returned from proxy.';
    }

    // Record usage
    recordRateLimitHit();
    recordTokenUsage({
      promptTokens,
      completionTokens,
      problemId,
    });

    return {
      hint: hintText,
      simulated: false,
      tokensUsed: promptTokens + completionTokens,
    };
  } catch (err) {
    throw new Error(`AI Hint failed: ${err.message}`);
  }
};
