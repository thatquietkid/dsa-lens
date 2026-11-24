import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  CircleDot,
  ListFilter,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { PROBLEM_CATALOG } from '../../data/problemCatalog';
import { getSolvedProblems } from '../../utils/progress';
import { getSkillProfile } from '../../utils/skillRating';
import EloBadge, { SkillSummary } from '../Adaptive/EloBadge';
import WarmupModal from '../Adaptive/WarmupModal';

const FILTERS = ['All', 'Easy', 'Medium'];

const Home = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [profile, setProfile] = useState(() => getSkillProfile());
  const [showWarmup, setShowWarmup] = useState(false);
  const solved = useMemo(() => new Set(getSolvedProblems()), []);

  const problems = useMemo(
    () => PROBLEM_CATALOG.filter((problem) => filter === 'All' || problem.difficulty === filter),
    [filter]
  );

  const solvedCount = PROBLEM_CATALOG.filter((problem) => solved.has(problem.id)).length;

  return (
    <main className="home">
      <div className="home-inner">
        <section className="hero">
          <motion.div
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <Sparkles size={13} />
            Visual DSA workspace
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Master DSA with
            <br />
            <span className="hero-accent">visual intuition</span>
          </motion.h1>

          <motion.p
            className="hero-sub"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Write Python, run it against real test cases, and watch variables, pointers and
            stacks update line by line beside your code.
          </motion.p>

          <motion.div
            className="hero-meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.16 }}
          >
            <span className="hero-meta-item">
              <strong>{solvedCount}</strong> / {PROBLEM_CATALOG.length} solved
            </span>
            <span className="hero-meta-divider" aria-hidden="true" />
            <span className="hero-meta-item">
              <Terminal size={13} /> Python 3 in the browser
            </span>
            <span className="hero-meta-divider" aria-hidden="true" />
            <span className="hero-meta-item">
              <CircleDot size={13} /> Auto trace on run
            </span>
            <span className="hero-meta-divider" aria-hidden="true" />
            <button
              type="button"
              className="hero-meta-item"
              onClick={() => setShowWarmup(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <EloBadge profile={profile} />
              <span style={{ color: 'var(--violet-bright)', textDecoration: 'underline', marginLeft: '6px' }}>
                {profile.diagnosticCompleted ? 'Recalibrate' : 'Take Skill Diagnostic'}
              </span>
            </button>
          </motion.div>
        </section>

        <motion.section
          className="problem-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
        >
          <div className="problem-panel-head">
            <div className="panel-title">
              <ListFilter size={15} />
              <h2>Problems</h2>
              <span className="count-badge">{problems.length}</span>
            </div>

            <div className="filter-chips" role="group" aria-label="Filter by difficulty">
              {FILTERS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={`filter-chip ${filter === option ? 'is-active' : ''}`}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="problem-table">
            <div className="problem-table-head">
              <span>Status</span>
              <span>Title</span>
              <span className="head-topics">Topics</span>
              <span>Difficulty</span>
              <span aria-hidden="true" />
            </div>

            {problems.map((problem) => {
              const isSolved = solved.has(problem.id);
              return (
                <button
                  key={problem.id}
                  type="button"
                  className="problem-row"
                  onClick={() => navigate(`/solve/${problem.id}`)}
                >
                  <span className={`row-status ${isSolved ? 'is-solved' : ''}`}>
                    {isSolved ? <Check size={14} /> : <span className="row-status-dot" />}
                  </span>

                  <span className="row-title">
                    <span className="row-title-main">
                      <span className="row-number">{problem.number}.</span>
                      <span className="row-name">{problem.title}</span>
                    </span>
                    <span className="row-blurb">{problem.blurb}</span>
                  </span>

                  <span className="row-topics">
                    {problem.topics.map((topic) => (
                      <span key={topic} className="topic-chip">
                        {topic}
                      </span>
                    ))}
                  </span>

                  <span className={`diff ${problem.difficulty.toLowerCase()}`}>
                    {problem.difficulty}
                  </span>

                  <span className="row-arrow">
                    <ArrowUpRight size={16} />
                  </span>
                </button>
              );
            })}

            {problems.length === 0 && (
              <div className="problem-empty">No problems in this difficulty yet.</div>
            )}
          </div>

          <div className="problem-panel-foot">
            <span>
              <Terminal size={13} /> Python 3 · runs fully in your browser
            </span>
            <span>Every run builds a live trace</span>
          </div>
        </motion.section>

        {profile.diagnosticCompleted && (
          <div style={{ marginTop: '24px' }}>
            <SkillSummary profile={profile} />
          </div>
        )}

        <WarmupModal
          open={showWarmup}
          onClose={() => setShowWarmup(false)}
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setShowWarmup(false);
          }}
        />
      </div>
    </main>
  );
};

export default Home;
