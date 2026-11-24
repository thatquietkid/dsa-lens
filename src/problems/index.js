// src/problems/index.js

export const PROBLEM_MAPPING = {
  'two-sum': () => import('./twoSum.jsx'),
  'valid-parentheses': () => import('./validParentheses.jsx'),
  'reverse-linked-list': () => import('./reverseList.jsx'),
  'binary-search': () => import('./binarySearch.jsx'),
  'delivery-delay': () => import('./deliveryDelay.jsx'),
  'word-frequency': () => import('./wordFrequency.jsx'),
  'tiny-bank': () => import('./tinyBank.jsx'),
  'functional-pipeline': () => import('./functionalPipeline.jsx'),
};