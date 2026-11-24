// src/utils/skillRating.js
// Domain-specific Elo rating system for adaptive DSA learning.

const STORAGE_KEY = 'dsalens:skill_profile';

const DEFAULT_ELO = 1000;
const K_FACTOR = 32;

// Map problem types/topics to skill domains.
const TOPIC_TO_DOMAIN = {
  'Array':          'arrays_hashing',
  'Hash Table':     'arrays_hashing',
  'Two Pointers':   'two_pointers',
  'String':         'strings',
  'Stack':          'stack',
  'Queue':          'stack',      // grouped with stack for now
  'Linked List':    'linked_lists',
  'Pointers':       'linked_lists',
  'Binary Search':  'binary_search',
  'Tree':           'trees',
  'Graph':          'graphs',
  'Dynamic Programming': 'dynamic_programming',
};

const ALL_DOMAINS = [
  'arrays_hashing',
  'two_pointers',
  'strings',
  'stack',
  'linked_lists',
  'binary_search',
  'trees',
  'graphs',
  'dynamic_programming',
];

const DOMAIN_LABELS = {
  arrays_hashing: 'Arrays & Hashing',
  two_pointers: 'Two Pointers',
  strings: 'Strings',
  stack: 'Stack & Queue',
  linked_lists: 'Linked Lists',
  binary_search: 'Binary Search',
  trees: 'Trees',
  graphs: 'Graphs',
  dynamic_programming: 'Dynamic Programming',
};

/**
 * Returns a fresh default profile.
 */
const createDefaultProfile = () => {
  const domains = {};
  ALL_DOMAINS.forEach((d) => { domains[d] = DEFAULT_ELO; });

  return {
    overallElo: DEFAULT_ELO,
    domains,
    diagnosticCompleted: false,
    mistakeCounts: {},       // archetype → count
    totalAttempts: 0,
    totalSolved: 0,
    streakCurrent: 0,
    streakBest: 0,
    history: [],             // last 50 entries: { problemId, domain, delta, ts }
  };
};

/**
 * Load profile from localStorage (or return default).
 */
export const getSkillProfile = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProfile();
    const parsed = JSON.parse(raw);
    // Ensure new domains added later are present.
    const profile = { ...createDefaultProfile(), ...parsed };
    ALL_DOMAINS.forEach((d) => {
      if (profile.domains[d] === undefined) profile.domains[d] = DEFAULT_ELO;
    });
    return profile;
  } catch {
    return createDefaultProfile();
  }
};

/**
 * Save profile to localStorage.
 */
export const saveSkillProfile = (profile) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // localStorage unavailable — non-critical.
  }
};

/**
 * Resolve the primary skill domain for a problem.
 * @param {object} problemMeta  — entry from PROBLEM_CATALOG (has .topics[])
 * @param {object} problemData  — the full problem export (has .type)
 * @returns {string} domain key
 */
export const getDomainForProblem = (problemMeta, problemData) => {
  // Try topics first.
  if (problemMeta?.topics) {
    for (const topic of problemMeta.topics) {
      const domain = TOPIC_TO_DOMAIN[topic];
      if (domain) return domain;
    }
  }
  // Fallback: map problem.type.
  const typeMap = {
    array: 'arrays_hashing',
    stack: 'stack',
    'linked-list': 'linked_lists',
  };
  if (problemData?.type && typeMap[problemData.type]) {
    return typeMap[problemData.type];
  }
  return 'arrays_hashing'; // safe default
};

/**
 * Update Elo after an attempt.
 * @param {'win'|'loss'} outcome
 * @param {string} domain
 * @param {string} problemId
 * @param {string} [difficulty='Easy']
 * @returns {object} updated profile
 */
export const updateElo = (outcome, domain, problemId, difficulty = 'Easy') => {
  const profile = getSkillProfile();

  // Difficulty maps to an expected-score anchor.
  const difficultyElo = { Easy: 900, Medium: 1200, Hard: 1500 };
  const opponentElo = difficultyElo[difficulty] || 1000;

  const currentElo = profile.domains[domain] || DEFAULT_ELO;

  // Standard Elo expected score.
  const expected = 1 / (1 + Math.pow(10, (opponentElo - currentElo) / 400));
  const actual = outcome === 'win' ? 1 : 0;
  const delta = Math.round(K_FACTOR * (actual - expected));

  profile.domains[domain] = Math.max(100, currentElo + delta);

  // Recompute overall as weighted average of active domains.
  const activeDomains = ALL_DOMAINS.filter((d) => profile.domains[d] !== DEFAULT_ELO || d === domain);
  profile.overallElo = Math.round(
    activeDomains.reduce((sum, d) => sum + profile.domains[d], 0) / activeDomains.length
  );

  // Track stats.
  profile.totalAttempts += 1;
  if (outcome === 'win') {
    profile.totalSolved += 1;
    profile.streakCurrent += 1;
    profile.streakBest = Math.max(profile.streakBest, profile.streakCurrent);
  } else {
    profile.streakCurrent = 0;
  }

  // History (keep last 50).
  profile.history = [
    { problemId, domain, delta, ts: Date.now() },
    ...(profile.history || []),
  ].slice(0, 50);

  saveSkillProfile(profile);
  return profile;
};

/**
 * Record a mistake archetype occurrence.
 */
export const recordMistake = (archetypeId) => {
  const profile = getSkillProfile();
  profile.mistakeCounts[archetypeId] = (profile.mistakeCounts[archetypeId] || 0) + 1;
  saveSkillProfile(profile);
  return profile;
};

/**
 * Mark the diagnostic as completed and set initial Elo values.
 * @param {object} domainScores — e.g. { arrays_hashing: 1100, stack: 950 }
 */
export const completeDiagnostic = (domainScores) => {
  const profile = getSkillProfile();
  Object.entries(domainScores).forEach(([domain, elo]) => {
    if (profile.domains[domain] !== undefined) {
      profile.domains[domain] = elo;
    }
  });
  profile.diagnosticCompleted = true;

  const vals = Object.values(profile.domains);
  profile.overallElo = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

  saveSkillProfile(profile);
  return profile;
};

/**
 * Get the user's experience tier based on overall Elo.
 */
export const getExperienceTier = (profile) => {
  const elo = profile?.overallElo ?? DEFAULT_ELO;
  if (elo < 900)  return { tier: 'beginner',     label: 'Beginner',     color: '#4ade80' };
  if (elo < 1150) return { tier: 'intermediate',  label: 'Intermediate', color: '#fbbf24' };
  if (elo < 1400) return { tier: 'advanced',      label: 'Advanced',     color: '#60a5fa' };
  return              { tier: 'expert',        label: 'Expert',       color: '#a78bfa' };
};

/**
 * Suggest difficulty for the next problem based on domain Elo.
 */
export const suggestDifficulty = (domain) => {
  const profile = getSkillProfile();
  const elo = profile.domains[domain] || DEFAULT_ELO;
  if (elo < 950)  return 'Easy';
  if (elo < 1250) return 'Medium';
  return 'Hard';
};

export { ALL_DOMAINS, DOMAIN_LABELS, TOPIC_TO_DOMAIN, DEFAULT_ELO };
