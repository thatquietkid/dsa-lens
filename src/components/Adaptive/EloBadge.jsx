import React from 'react';
import { getExperienceTier, DOMAIN_LABELS } from '../../utils/skillRating';

/**
 * Compact badge showing the user's overall Elo and tier.
 * Props:
 *   profile  — the SkillProfile object
 *   compact  — if true, show only the tier pill (no number)
 */
const EloBadge = ({ profile, compact = false }) => {
  if (!profile) return null;

  const { label, color } = getExperienceTier(profile);

  return (
    <span
      className="elo-badge"
      style={{
        '--elo-color': color,
      }}
      title={`Overall Elo: ${profile.overallElo}`}
    >
      <span className="elo-dot" style={{ background: color }} />
      {!compact && <span className="elo-number">{profile.overallElo}</span>}
      <span className="elo-tier">{label}</span>
    </span>
  );
};

/**
 * Expanded skill radar showing per-domain Elo.
 */
export const SkillSummary = ({ profile }) => {
  if (!profile) return null;

  const { label, color } = getExperienceTier(profile);
  const activeDomains = Object.entries(profile.domains)
    .filter(([, elo]) => elo !== 1000)
    .sort((a, b) => b[1] - a[1]);

  if (activeDomains.length === 0) return null;

  return (
    <div className="skill-summary">
      <div className="skill-summary-head">
        <span className="skill-summary-label">Skill Profile</span>
        <EloBadge profile={profile} />
      </div>
      <div className="skill-bars">
        {activeDomains.map(([domain, elo]) => {
          const pct = Math.min(100, Math.max(0, ((elo - 500) / 1000) * 100));
          return (
            <div className="skill-bar-row" key={domain}>
              <span className="skill-bar-label">{DOMAIN_LABELS[domain] || domain}</span>
              <div className="skill-bar-track">
                <div
                  className="skill-bar-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="skill-bar-value">{elo}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EloBadge;
