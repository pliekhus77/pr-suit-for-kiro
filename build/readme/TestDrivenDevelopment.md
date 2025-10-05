# Kiro Steering: TDD/BDD Testing Strategy

## Overview

This package provides the TDD/BDD testing strategy guide for Amazon Kiro. It covers Red-Green-Refactor, Given-When-Then, testing-plan.md creation, and quality standards for comprehensive test coverage.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.TestDrivenDevelopment
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.TestDrivenDevelopment
```

## What's Included

This package installs `strategy-tdd-bdd.md` to your project's `.kiro/steering/` directory. The file includes:

- Required testing-plan.md template
- TDD process (Red-Green-Refactor)
- BDD process (Given-When-Then with Gherkin)
- Scenario identification (happy path, failure, edge cases, boundary)
- Integration with tasks.md
- Coverage requirements (80% minimum, 100% for critical paths)
- Quality standards and common patterns

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Create testing-plan.md during requirements phase
- Identify all test scenarios (happy, failure, edge, boundary)
- Implement TDD with Red-Green-Refactor cycle
- Generate BDD feature files and step definitions
- Ensure coverage requirements are met
- Include testing tasks in implementation plans

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Quality Built-In**: TDD ensures tests before code
- **Comprehensive Coverage**: All scenarios identified upfront
- **Living Documentation**: BDD scenarios document behavior
- **Fast Feedback**: Tests catch issues immediately
- **Confidence**: High coverage enables safe refactoring

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
