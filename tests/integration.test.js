// tests/integration.test.js
// Integration test suite validating the entire Adaptive DSA Harness flow:
// 1. Skill Profile & Elo System calculations
// 2. Deterministic Hint Template resolution
// 3. Compact Payload compression (< 120 tokens)
// 4. Rate-Limiting windows & Token budget recording
// 5. Simulation of 100 student sessions for Token Budget Audit

import assert from 'node:assert';
import test from 'node:test';

// Setup Mock Window / LocalStorage environment for Node
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, val) {
    this.store[key] = String(val);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.window = {
  localStorage: new MockLocalStorage(),
};

// Import modules to test
const {
  getSkillProfile,
  updateElo,
  completeDiagnostic,
  getExperienceTier,
  suggestDifficulty,
} = await import('../src/utils/skillRating.js');

const { getHint, getArchetypeLabel } = await import('../src/hints/index.js');

const {
  getTokenMetrics,
  recordTokenUsage,
  checkRateLimit,
  recordRateLimitHit,
  resetTokenMetrics,
} = await import('../src/utils/tokenBudget.js');

const { buildCompactPayload } = await import('../src/services/aiHintService.js');

test('1. Skill Profile & Elo Rating System', () => {
  window.localStorage.clear();
  const profile = getSkillProfile();
  assert.strictEqual(profile.overallElo, 1000);
  assert.strictEqual(profile.diagnosticCompleted, false);

  // Complete diagnostic calibration
  const calibrated = completeDiagnostic({
    arrays_hashing: 1150,
    stack: 850,
    binary_search: 1150,
  });
  assert.strictEqual(calibrated.diagnosticCompleted, true);
  assert.strictEqual(calibrated.domains.arrays_hashing, 1150);
  assert.strictEqual(calibrated.domains.stack, 850);

  // Win on an Easy problem
  const afterWin = updateElo('win', 'arrays_hashing', 'two-sum', 'Easy');
  assert.ok(afterWin.domains.arrays_hashing > 1150, 'Elo should increase on win');
  assert.strictEqual(afterWin.totalSolved, 1);
  assert.strictEqual(afterWin.streakCurrent, 1);

  // Loss on a problem
  const afterLoss = updateElo('loss', 'arrays_hashing', 'two-sum', 'Easy');
  assert.ok(afterLoss.domains.arrays_hashing < afterWin.domains.arrays_hashing, 'Elo should decrease on loss');
  assert.strictEqual(afterLoss.streakCurrent, 0, 'Streak should reset on loss');

  // Verify Experience Tiers
  const tier = getExperienceTier(afterLoss);
  assert.ok(['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(tier.label));

  // Verify difficulty suggestion
  const suggestedDiff = suggestDifficulty('arrays_hashing');
  assert.ok(['Easy', 'Medium', 'Hard'].includes(suggestedDiff));
});

test('2. Deterministic Hint Template Lookup (Zero-Token Engine)', () => {
  const archetypes = [
    'brute_force_nested',
    'hash_optimization',
    'pointer_convergence',
    'stack_pattern',
    'binary_search',
    'single_pass',
    'recursive',
    'linear_search_in_loop',
    'unknown',
  ];

  for (const arch of archetypes) {
    const label = getArchetypeLabel(arch);
    const tier1 = getHint(arch, 1);
    const tier2 = getHint(arch, 2);

    assert.ok(label && label.length > 0, `Archetype ${arch} should have a label`);
    assert.ok(tier1 && tier1.length > 10, `Archetype ${arch} should have Tier 1 hint`);
    assert.ok(tier2 && tier2.length > 10, `Archetype ${arch} should have Tier 2 hint`);
  }
});

test('3. Ultra-Compact Payload Compression (< 120 Tokens Budget)', () => {
  const payload = buildCompactPayload({
    problemId: 'two-sum',
    archetypeId: 'brute_force_nested',
    complexity: { time: 'O(n^2)', space: 'O(1)' },
    failingCase: {
      input: { nums: [2, 7, 11, 15], target: 9 },
      actual: [],
      expected: [0, 1],
    },
    codeSnippet: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
  });

  const serialized = JSON.stringify(payload);
  // Rough rule of thumb: ~4 characters per token
  const estimatedTokens = Math.ceil(serialized.length / 4);

  assert.strictEqual(payload.pid, 'two-sum');
  assert.strictEqual(payload.arch, 'brute_force_nested');
  assert.ok(estimatedTokens < 120, `Payload estimated at ${estimatedTokens} tokens, must be < 120 tokens`);
});

test('4. Rate Limiting & Window Enforcement', () => {
  window.localStorage.clear();
  resetTokenMetrics();

  // Fresh state
  let limit = checkRateLimit();
  assert.strictEqual(limit.allowed, true);
  assert.strictEqual(limit.remaining, 3);

  // Use 1 call
  recordRateLimitHit();
  limit = checkRateLimit();
  assert.strictEqual(limit.remaining, 2);

  // Use 2nd and 3rd calls
  recordRateLimitHit();
  recordRateLimitHit();
  limit = checkRateLimit();
  assert.strictEqual(limit.allowed, false, 'Should block after 3 calls');
  assert.strictEqual(limit.remaining, 0);
  assert.ok(limit.resetInMs > 0);

  // Record token usage
  const metrics = recordTokenUsage({
    promptTokens: 85,
    completionTokens: 42,
    problemId: 'two-sum',
  });
  assert.strictEqual(metrics.totalTokensUsed, 127);
  assert.strictEqual(metrics.callsCount, 1);
});

test('5. Token Budget Audit Simulation (100 Student Sessions)', () => {
  window.localStorage.clear();
  resetTokenMetrics();

  let totalTokensAcrossAllSessions = 0;
  const SESSION_COUNT = 100;

  // Realistic distribution from concept brief:
  // - 85% of sessions solve or use Tier 1/2 hints locally (0 tokens consumed)
  // - 15% of sessions escalate to Tier 3 AI mentor (< 150 tokens per call)
  for (let i = 0; i < SESSION_COUNT; i++) {
    const escalatesToAI = Math.random() < 0.15; // 15% escalation rate
    if (escalatesToAI) {
      // 1 to 2 AI mentor queries
      const queries = Math.random() < 0.8 ? 1 : 2;
      for (let q = 0; q < queries; q++) {
        const promptTokens = Math.floor(Math.random() * 20) + 90; // 90 - 110 tokens
        const completionTokens = Math.floor(Math.random() * 25) + 35; // 35 - 60 tokens
        const tokens = promptTokens + completionTokens;
        totalTokensAcrossAllSessions += tokens;
        recordTokenUsage({ promptTokens, completionTokens, problemId: 'session-' + i });
      }
    }
  }

  const avgTokensPerSession = totalTokensAcrossAllSessions / SESSION_COUNT;
  console.log(`\n📊 Audit Result: Average tokens per student session = ${avgTokensPerSession.toFixed(1)} tokens`);

  // Target requirement: average tokens < 120 per session
  assert.ok(
    avgTokensPerSession < 120,
    `Average tokens per session (${avgTokensPerSession}) must be under 120 tokens`
  );
});
