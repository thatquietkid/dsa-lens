export const PROBLEM_CATALOG = [
  {
    id: 'two-sum',
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    topics: ['Array', 'Hash Table'],
    blurb: 'Find two indices that add up to a target.',
  },
  {
    id: 'valid-parentheses',
    number: 20,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    topics: ['String', 'Stack'],
    blurb: 'Check whether every bracket is closed in the right order.',
  },
  {
    id: 'reverse-linked-list',
    number: 206,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    topics: ['Linked List', 'Pointers'],
    blurb: 'Walk a linked list once and flip every pointer.',
  },
  {
    id: 'binary-search',
    number: 704,
    title: 'Binary Search',
    difficulty: 'Easy',
    topics: ['Array', 'Binary Search'],
    blurb: 'Halve the search space until the target is found.',
  },
  {
    id: 'delivery-delay',
    number: 5,
    title: 'Delivery Delay Formatter',
    difficulty: 'Easy',
    topics: ['Math', 'String'],
    blurb: 'Convert raw delivery delay minutes into a human-friendly string.',
  },
  {
    id: 'word-frequency',
    number: 6,
    title: 'Word Frequency Counter',
    difficulty: 'Easy',
    topics: ['String', 'Hash Table'],
    blurb: 'Normalise tokens and report frequencies in order of first appearance.',
  },
  {
    id: 'tiny-bank',
    number: 7,
    title: 'Tiny In-Memory Bank',
    difficulty: 'Medium',
    topics: ['Design', 'Hash Table', 'Simulation'],
    blurb: 'Implement accounts, deposits, transfers, and error validations.',
  },
  {
    id: 'functional-pipeline',
    number: 8,
    title: 'Functional Pipeline',
    difficulty: 'Medium',
    topics: ['Functional', 'Array'],
    blurb: 'Execute sequential map, filter, and reduce operations.',
  },
];

export const getProblemMeta = (id) =>
  PROBLEM_CATALOG.find((problem) => problem.id === id) || null;
