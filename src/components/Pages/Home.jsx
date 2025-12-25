import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PROBLEMS = [
  { id: 'two-sum', title: 'Two Sum', diff: 'Easy', tags: ['Array', 'Hash Map'], color: '#22d3ee' },
  { id: 'valid-parentheses', title: 'Valid Parentheses', diff: 'Easy', tags: ['Stack', 'Strings'], color: '#a855f7' },
  { id: 'reverse-linked-list', title: 'Reverse List', diff: 'Medium', tags: ['Linked List'], color: '#f59e0b' },
  { id: 'binary-search', title: 'Binary Search', diff: 'Easy', tags: ['Searching'], color: '#10b981' }
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-hero">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Master DSA with <span className="text-gradient">Visual Intuition</span>
        </motion.h1>
        <p>Select a problem to start visualizing your code execution in real-time.</p>
      </header>

      <div className="problem-grid">
        {PROBLEMS.map((prob) => (
          <motion.div 
            key={prob.id}
            className="problem-card"
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/solve/${prob.id}`)}
          >
            <div className="card-top">
              <span className={`diff-badge ${prob.diff.toLowerCase()}`}>{prob.diff}</span>
              <div className="glow-dot" style={{ backgroundColor: prob.color }}></div>
            </div>
            <h3>{prob.title}</h3>
            <div className="card-tags">
              {prob.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
            </div>
            <button className="btn-card">Start Solving →</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Home;