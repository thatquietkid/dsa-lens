// src/problems/index.js

export const PROBLEM_MAPPING = {
  'two-sum': () => import('./twoSum.jsx'),
  'valid-parentheses': () => import('./validParentheses.jsx'),
  'reverse-linked-list': () => import('./reverseList.jsx'),
  'binary-search': () => import('./binarySearch.jsx'),
};