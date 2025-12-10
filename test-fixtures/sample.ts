// Test cases for TS1016: A required parameter cannot follow an optional parameter

// Case 1: Simple function with optional followed by required
function greet(name?: string, greeting?: string) {
  return `${greeting}, ${name}!`;
}

// Case 2: Multiple required after optional
function example(a?: number, b?: string, c?: boolean) {
  return { a, b, c };
}

// Case 3: Class method
class MyClass {
  myMethod(optional?: string, required?: number) {
    return required;
  }

  // Case 4: Constructor
  constructor(opt?: boolean, req?: string) {}
}

// Case 5: Arrow function
const arrowFn = (a?: string, b?: number) => a + b;

// Case 6: Function expression
const funcExpr = function (x?: number, y?: string) {
  return y;
};

// Case 7: Already valid - should not be modified
function validFunc(required: string, optional?: number) {
  return required;
}

// Case 8: With default value (counts as optional)
function withDefault(a = 10, b?: string) {
  return b;
}

// Case 9: Rest parameter at end (should be fine)
function withRest(a?: string, ...rest: number[]) {
  return rest;
}
