import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './components/Pages/Home';
import ProblemWorkspace from './components/Pages/ProblemWorkspace';
import './App.css';

function App() {
  // src/App.jsx refined structure
  return (
    <Router>
      <div className="app-container">
        <Header />
        {/* Routes will render here. 
            Home.jsx handles its own padding.
            ProblemWorkspace.jsx handles its own grid.
        */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/solve/:problemId" element={<ProblemWorkspace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;