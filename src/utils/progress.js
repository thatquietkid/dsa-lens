const STORAGE_KEY = 'dsalens:solved';

export const getSolvedProblems = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const markProblemSolved = (id) => {
  try {
    const solved = new Set(getSolvedProblems());
    solved.add(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...solved]));
  } catch {
    // Storage can be unavailable in private browsing; progress is non-critical.
  }
};
