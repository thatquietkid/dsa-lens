// src/utils/astAnalyzer.js
// Python code for the StaticPatternInspector that runs inside Pyodide.
// Returns an ASTDiagnosticReport as JSON.

/**
 * Python script that performs static AST analysis on student code.
 * Runs entirely client-side in Pyodide — zero tokens.
 */
export const STATIC_ANALYZER_SCRIPT = `
import ast, json

class StaticPatternInspector(ast.NodeVisitor):
    def __init__(self):
        self.loop_depth = 0
        self.max_loop_depth = 0
        self.has_dict = False
        self.has_set = False
        self.has_list_comprehension = False
        self.linear_in_loop = False
        self.nested_loop_count = 0
        self.uses_recursion = False
        self.function_names = set()
        self.called_functions = set()
        self.has_stack_pattern = False
        self.has_two_pointer = False
        self.has_binary_search = False
        self.has_hash_lookup = False
        self.anti_patterns = []
        self.variable_names = set()
        self.loop_variables = []
        self.return_count = 0
        self.has_early_return = False
        self.total_lines = 0

    def visit_FunctionDef(self, node):
        self.function_names.add(node.name)
        self.total_lines = max(self.total_lines, node.end_lineno or node.lineno)
        self.generic_visit(node)

    def visit_For(self, node):
        self.loop_depth += 1
        if self.loop_depth > 1:
            self.nested_loop_count += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)

        # Track loop variable
        if isinstance(node.target, ast.Name):
            self.loop_variables.append(node.target.id)

        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_While(self, node):
        self.loop_depth += 1
        if self.loop_depth > 1:
            self.nested_loop_count += 1
        self.max_loop_depth = max(self.max_loop_depth, self.loop_depth)

        # Detect binary search pattern: while left <= right / while lo < hi
        if isinstance(node.test, ast.Compare):
            if len(node.test.ops) == 1 and isinstance(node.test.ops[0], (ast.LtE, ast.Lt)):
                left_id = getattr(node.test.left, 'id', '')
                if left_id in ('left', 'lo', 'low', 'l'):
                    self.has_binary_search = True

        # Detect two-pointer pattern: while left < right
        if isinstance(node.test, ast.Compare):
            if len(node.test.ops) == 1:
                left_id = getattr(node.test.left, 'id', '')
                comps = node.test.comparators
                right_id = getattr(comps[0], 'id', '') if comps and isinstance(comps[0], ast.Name) else ''
                if left_id in ('left', 'l', 'i') and right_id in ('right', 'r', 'j'):
                    self.has_two_pointer = True

        self.generic_visit(node)
        self.loop_depth -= 1

    def visit_Compare(self, node):
        # Detect 'x in list' anti-pattern inside loops
        if self.loop_depth > 0:
            for op in node.ops:
                if isinstance(op, (ast.In, ast.NotIn)):
                    # Check if the container is a list (not a dict or set)
                    for comp in node.comparators:
                        if isinstance(comp, ast.Name):
                            self.linear_in_loop = True
                            self.anti_patterns.append({
                                'type': 'linear_search_in_loop',
                                'line': node.lineno,
                                'detail': f'Using "in" on a list inside a loop is O(n) per check. Consider a set or dict.'
                            })
        self.generic_visit(node)

    def visit_Call(self, node):
        # Track function calls for recursion detection
        if isinstance(node.func, ast.Name):
            self.called_functions.add(node.func.id)
        # Detect stack patterns: .append() + .pop()
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in ('append', 'push'):
                self.has_stack_pattern = True
            if node.func.attr == 'pop':
                self.has_stack_pattern = True
        self.generic_visit(node)

    def visit_Dict(self, node):
        self.has_dict = True
        self.has_hash_lookup = True
        self.generic_visit(node)

    def visit_Set(self, node):
        self.has_set = True
        self.has_hash_lookup = True
        self.generic_visit(node)

    def visit_Assign(self, node):
        # Detect dict/set creation: x = {} or x = set()
        if isinstance(node.value, ast.Dict):
            self.has_dict = True
            self.has_hash_lookup = True
        if isinstance(node.value, ast.Set):
            self.has_set = True
            self.has_hash_lookup = True
        if isinstance(node.value, ast.Call):
            func = node.value.func
            if isinstance(func, ast.Name):
                if func.id == 'dict':
                    self.has_dict = True
                    self.has_hash_lookup = True
                if func.id == 'set':
                    self.has_set = True
                    self.has_hash_lookup = True

        # Track variable names
        for target in node.targets:
            if isinstance(target, ast.Name):
                self.variable_names.add(target.id)
            elif isinstance(target, ast.Tuple):
                for elt in target.elts:
                    if isinstance(elt, ast.Name):
                        self.variable_names.add(elt.id)

        self.generic_visit(node)

    def visit_ListComp(self, node):
        self.has_list_comprehension = True
        self.generic_visit(node)

    def visit_Return(self, node):
        self.return_count += 1
        self.generic_visit(node)

    def analyze(self, code):
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return json.dumps({
                'error': str(e),
                'archetypeId': 'syntax_error',
                'detectedComplexity': {'time': 'N/A', 'space': 'N/A'},
                'antiPatternsDetected': [{'type': 'syntax_error', 'line': e.lineno or 0, 'detail': str(e)}],
                'loopDepth': 0,
                'hasAuxiliaryMemory': False
            })

        self.visit(tree)

        # Detect recursion
        self.uses_recursion = bool(self.function_names & self.called_functions)

        # Determine archetype
        archetype = self._classify_archetype()

        # Estimate complexity
        time_complexity, space_complexity = self._estimate_complexity()

        return json.dumps({
            'archetypeId': archetype,
            'detectedComplexity': {'time': time_complexity, 'space': space_complexity},
            'antiPatternsDetected': self.anti_patterns,
            'loopDepth': self.max_loop_depth,
            'nestedLoopCount': self.nested_loop_count,
            'hasAuxiliaryMemory': self.has_dict or self.has_set,
            'hasStackPattern': self.has_stack_pattern,
            'hasTwoPointer': self.has_two_pointer,
            'hasBinarySearch': self.has_binary_search,
            'hasHashLookup': self.has_hash_lookup,
            'usesRecursion': self.uses_recursion,
            'linearSearchInLoop': self.linear_in_loop,
            'totalLines': self.total_lines
        })

    def _classify_archetype(self):
        if self.has_binary_search:
            return 'binary_search'
        if self.has_two_pointer:
            return 'pointer_convergence'
        if self.has_hash_lookup and self.max_loop_depth == 1:
            return 'hash_optimization'
        if self.has_stack_pattern and self.max_loop_depth == 1:
            return 'stack_pattern'
        if self.max_loop_depth >= 2:
            return 'brute_force_nested'
        if self.uses_recursion:
            return 'recursive'
        if self.max_loop_depth == 1:
            return 'single_pass'
        return 'unknown'

    def _estimate_complexity(self):
        # Time
        if self.has_binary_search:
            time_c = 'O(log n)'
        elif self.max_loop_depth >= 2:
            time_c = f'O(n^{self.max_loop_depth})'
        elif self.uses_recursion:
            time_c = 'O(2^n) or O(n)'  # conservative
        else:
            time_c = 'O(n)'

        # Space
        if self.has_dict or self.has_set:
            space_c = 'O(n)'
        elif self.uses_recursion:
            space_c = 'O(n)'
        elif self.has_stack_pattern:
            space_c = 'O(n)'
        else:
            space_c = 'O(1)'

        return time_c, space_c

def analyze_code(code):
    inspector = StaticPatternInspector()
    return inspector.analyze(code)
`;

/**
 * Run the static AST analysis via Pyodide.
 * @param {object} pyodide — the Pyodide instance
 * @param {string} code — user's Python code
 * @returns {Promise<object>} ASTDiagnosticReport
 */
export const runStaticAnalysis = async (pyodide, code) => {
  if (!pyodide || !code?.trim()) {
    return {
      archetypeId: 'unknown',
      detectedComplexity: { time: 'N/A', space: 'N/A' },
      antiPatternsDetected: [],
      loopDepth: 0,
      hasAuxiliaryMemory: false,
    };
  }

  try {
    await pyodide.runPythonAsync(STATIC_ANALYZER_SCRIPT);
    pyodide.globals.set('py_analyze_code', code);
    const resultJson = await pyodide.runPythonAsync('analyze_code(py_analyze_code)');
    return JSON.parse(resultJson);
  } catch (err) {
    console.error('AST analysis failed:', err);
    return {
      archetypeId: 'unknown',
      error: String(err),
      detectedComplexity: { time: 'N/A', space: 'N/A' },
      antiPatternsDetected: [],
      loopDepth: 0,
      hasAuxiliaryMemory: false,
    };
  }
};
