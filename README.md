# ts-autofix-ts1016

A codemod to automatically fix TypeScript **TS1016** errors: "A required parameter cannot follow an optional parameter".

## What it does

This tool finds function signatures where a required parameter follows an optional parameter and makes the required parameter optional by adding `?`.

```typescript
// Before
function greet(name?: string, greeting: string) {}

// After
function greet(name?: string, greeting?: string) {}
```

## Installation

```bash
npm install
npm run build
```

## Usage

```bash
# Using a tsconfig.json
node dist/index.js ./tsconfig.json

# Using a directory path
node dist/index.js ./src
```

## Supported constructs

- Function declarations
- Class methods
- Constructors
- Arrow functions
- Function expressions
- Parameters with default values (treated as optional)

## Example

Given this input:

```typescript
function example(a?: number, b: string, c: boolean) {
  return { a, b, c };
}

class MyClass {
  myMethod(optional?: string, required: number) {
    return required;
  }
}

const arrowFn = (a?: string, b: number) => a + b;
```

The codemod produces:

```typescript
function example(a?: number, b?: string, c?: boolean) {
  return { a, b, c };
}

class MyClass {
  myMethod(optional?: string, required?: number) {
    return required;
  }
}

const arrowFn = (a?: string, b?: number) => a + b;
```

## License

ISC
