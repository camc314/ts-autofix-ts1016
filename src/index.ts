#!/usr/bin/env node

import {
  Project,
  SourceFile,
  FunctionDeclaration,
  MethodDeclaration,
  ConstructorDeclaration,
  ArrowFunction,
  FunctionExpression,
  ParameterDeclaration,
  SyntaxKind,
} from "ts-morph";
import * as path from "path";

type FunctionLike =
  | FunctionDeclaration
  | MethodDeclaration
  | ConstructorDeclaration
  | ArrowFunction
  | FunctionExpression;

/**
 * TS1016: A required parameter cannot follow an optional parameter.
 *
 * This codemod fixes this by making required parameters that follow optional
 * parameters also optional (by adding the `?` modifier).
 */

function fixParametersInFunction(fn: FunctionLike): boolean {
  const parameters = fn.getParameters();
  let hasOptional = false;
  let modified = false;

  for (const param of parameters) {
    // Rest parameters don't count for this check
    if (param.isRestParameter()) {
      continue;
    }

    const isOptional = param.hasQuestionToken() || param.hasInitializer();

    if (isOptional) {
      hasOptional = true;
    } else if (hasOptional) {
      // This is a required parameter following an optional one - TS1016
      // Fix it by making it optional
      param.setHasQuestionToken(true);
      modified = true;
      console.log(`  Fixed parameter "${param.getName()}" - made optional`);
    }
  }

  return modified;
}

function processSourceFile(sourceFile: SourceFile): number {
  let fixCount = 0;
  const filePath = sourceFile.getFilePath();

  // Process all function declarations
  sourceFile.getFunctions().forEach((fn) => {
    if (fixParametersInFunction(fn)) {
      console.log(`Fixed function: ${fn.getName() || "(anonymous)"} in ${filePath}`);
      fixCount++;
    }
  });

  // Process all classes (methods and constructors)
  sourceFile.getClasses().forEach((cls) => {
    cls.getMethods().forEach((method) => {
      if (fixParametersInFunction(method)) {
        console.log(`Fixed method: ${cls.getName()}.${method.getName()} in ${filePath}`);
        fixCount++;
      }
    });

    cls.getConstructors().forEach((ctor) => {
      if (fixParametersInFunction(ctor)) {
        console.log(`Fixed constructor: ${cls.getName()} in ${filePath}`);
        fixCount++;
      }
    });
  });

  // Process arrow functions and function expressions
  sourceFile.getDescendantsOfKind(SyntaxKind.ArrowFunction).forEach((fn) => {
    if (fixParametersInFunction(fn)) {
      console.log(`Fixed arrow function in ${filePath}`);
      fixCount++;
    }
  });

  sourceFile.getDescendantsOfKind(SyntaxKind.FunctionExpression).forEach((fn) => {
    if (fixParametersInFunction(fn)) {
      console.log(`Fixed function expression in ${filePath}`);
      fixCount++;
    }
  });

  return fixCount;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log("Usage: ts-autofix-ts1016 <tsconfig.json path or directory>");
    console.log("");
    console.log("Examples:");
    console.log("  ts-autofix-ts1016 ./tsconfig.json");
    console.log("  ts-autofix-ts1016 ./src");
    process.exit(1);
  }

  const targetPath = path.resolve(args[0]);

  let project: Project;

  // Check if it's a tsconfig.json file or a directory
  if (targetPath.endsWith("tsconfig.json")) {
    console.log(`Loading project from: ${targetPath}`);
    project = new Project({
      tsConfigFilePath: targetPath,
    });
  } else {
    console.log(`Loading TypeScript files from: ${targetPath}`);
    project = new Project({
      compilerOptions: {
        allowJs: true,
        checkJs: false,
      },
    });
    project.addSourceFilesAtPaths(`${targetPath}/**/*.{ts,tsx}`);
  }

  const sourceFiles = project.getSourceFiles();
  console.log(`Found ${sourceFiles.length} source files`);
  console.log("");

  let totalFixes = 0;
  let filesModified = 0;

  for (const sourceFile of sourceFiles) {
    const fixes = processSourceFile(sourceFile);
    if (fixes > 0) {
      totalFixes += fixes;
      filesModified++;
    }
  }

  if (totalFixes > 0) {
    console.log("");
    console.log(`Saving changes...`);
    await project.save();
    console.log(`Done! Fixed ${totalFixes} function(s) in ${filesModified} file(s).`);
  } else {
    console.log("No TS1016 errors found.");
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});
