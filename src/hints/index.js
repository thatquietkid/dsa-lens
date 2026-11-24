// src/hints/index.js
import hintTemplates from './templates.json' with { type: 'json' };

/**
 * Retrieves the deterministic hint for a given archetype and tier.
 * @param {string} archetype - Detected mistake archetype id
 * @param {number} tier - Hint tier (1 or 2)
 * @returns {string} The text hint
 */
export const getHint = (archetype, tier = 1) => {
  const item = hintTemplates[archetype] || hintTemplates['unknown'];
  if (tier === 1) return item.tier1;
  if (tier === 2) return item.tier2;
  return item.tier1;
};

export const getArchetypeLabel = (archetype) => {
  const item = hintTemplates[archetype] || hintTemplates['unknown'];
  return item.label;
};

export default hintTemplates;
