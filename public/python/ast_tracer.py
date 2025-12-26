import ast
import json
import sys

# The "Spy" that stores events
TRACE_LOG = []

def record_event(event_type, target, value, line_no):
    # Convert types to UI-friendly strings
    val_type = type(value).__name__
    
    # Handle specific data structures for serialization
    serializable_val = value
    if isinstance(value, list):
        val_type = "list"
        serializable_val = list(value) # Clone it
    elif isinstance(value, dict):
        val_type = "dict"
        serializable_val = dict(value) # Clone it
        
    TRACE_LOG.append({
        "event": event_type,
        "target": target, # Variable name
        "value": serializable_val,
        "type": val_type,
        "line": line_no
    })
    return value

# The Transformer that rewrites user code
class CodeInstrumenter(ast.NodeTransformer):
    def visit_Assign(self, node):
        self.generic_visit(node)
        
        # We only handle simple assignments (x = 5) for now
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
            target_name = node.targets[0].id
            
            # Create the record_event call
            # Rewrites: x = y -> x = record_event('ASSIGN', 'x', y, line)
            
            new_node = ast.Assign(
                targets=node.targets,
                value=ast.Call(
                    func=ast.Name(id='record_event', ctx=ast.Load()),
                    args=[
                        ast.Constant(value='ASSIGN'),
                        ast.Constant(value=target_name),
                        node.value, # The original value expression
                        ast.Constant(value=node.lineno)
                    ],
                    keywords=[]
                )
            )
            ast.copy_location(new_node, node)
            return new_node
        
        # Handle Array/Dict assignment: arr[i] = val
        if len(node.targets) == 1 and isinstance(node.targets[0], ast.Subscript):
            # This is harder to rewrite inline, so we insert a logger AFTER
            # We leave the original assignment, and add a log call after it
            
            log_node = ast.Expr(
                value=ast.Call(
                    func=ast.Name(id='record_event', ctx=ast.Load()),
                    args=[
                        ast.Constant(value='MUTATE'),
                        # Try to get the name of the list/dict being modified
                        ast.Constant(value=node.targets[0].value.id if hasattr(node.targets[0].value, 'id') else 'unknown'),
                        # We can't easily capture the new state inline here without complex logic, 
                        # so for V1 we just log that a mutation happened.
                        # In V2, we will capture the full object state.
                        ast.Name(id=node.targets[0].value.id, ctx=ast.Load()), 
                        ast.Constant(value=node.lineno)
                    ],
                    keywords=[]
                )
            )
            return [node, log_node]

        return node

    def visit_Return(self, node):
        self.generic_visit(node)
        if node.value:
            # Wrap return value: return x -> return record_event('RETURN', 'return', x, line)
            node.value = ast.Call(
                func=ast.Name(id='record_event', ctx=ast.Load()),
                args=[
                    ast.Constant(value='RETURN'),
                    ast.Constant(value='result'),
                    node.value,
                    ast.Constant(value=node.lineno)
                ],
                keywords=[]
            )
        return node

def run_instrumented(user_code, entry_point, *args):
    global TRACE_LOG
    TRACE_LOG = [] # Reset log
    
    try:
        # 1. Parse User Code
        tree = ast.parse(user_code)
        
        # 2. Instrument Code (Inject Spies)
        instrumenter = CodeInstrumenter()
        modified_tree = instrumenter.visit(tree)
        ast.fix_missing_locations(modified_tree)
        
        # 3. Compile and Execute Definition
        # This defines the functions in the current scope
        exec(compile(modified_tree, filename="<string>", mode="exec"), globals())
        
        # 4. Run the Entry Function
        if entry_point in globals():
            func = globals()[entry_point]
            func(*args)
            
        return json.dumps(TRACE_LOG)
        
    except Exception as e:
        return json.dumps([{"event": "ERROR", "message": str(e)}])