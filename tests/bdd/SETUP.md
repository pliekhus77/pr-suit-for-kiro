# BDD Testing Setup Guide

This guide walks through setting up and running BDD tests for the Pragmatic Rhino SUIT extension.

## Prerequisites

- Node.js 18+ installed
- VS Code 1.85.0+ installed
- Extension development environment set up

## Installation

All dependencies are already installed if you ran `npm install` in the project root. If not:

```bash
# Install all dependencies including BDD testing tools
npm install

# Install Playwright browsers
npm run playwright:install
```

## Verify Installation

Check that the following packages are installed:

```bash
npm list @cucumber/cucumber
npm list playwright
npm list @playwright/test
```

## Directory Structure

The BDD test infrastructure is organized as follows:

```
tests/bdd/
├── features/              # Gherkin feature files
│   └── example.feature    # Example feature demonstrating syntax
├── step-definitions/      # Step implementations
│   └── example.steps.ts   # Example step definitions
├── support/              # Test support files
│   ├── world.ts          # Custom World class (test context)
│   ├── hooks.ts          # Before/After hooks
│   └── helpers.ts        # Utility functions
├── reports/              # Generated test reports (gitignored)
├── tsconfig.json         # TypeScript config for BDD tests
└── README.md            # BDD testing documentation
```

## Configuration Files

### cucumber.js

Main Cucumber configuration with three profiles:

- **default**: Standard test run (2 parallel workers, 1 retry)
- **ci**: CI/CD optimized (4 parallel workers, 2 retries)
- **debug**: Debug mode (single thread, non-headless, slow motion)

### tests/bdd/tsconfig.json

TypeScript configuration for BDD tests, extends root tsconfig.json.

## Running Tests

### Important Note

BDD tests for VS Code extensions require the VS Code Extension Host environment because they need access to the VS Code API. There are two ways to run these tests:

1. **Using VS Code Debugger** (Recommended for development)
2. **Using Extension Test Runner** (For CI/CD)

### Method 1: VS Code Debugger (Recommended)

This is the easiest way to run and debug BDD tests during development:

1. Open VS Code
2. Press `F5` or go to Run > Start Debugging
3. Select "Debug BDD Tests" from the dropdown
4. Tests will run in the Extension Development Host

You can set breakpoints in step definitions and debug interactively.

### Method 2: Command Line (Limited)

For standalone Cucumber tests (without VS Code API dependencies):

```bash
# Run all BDD tests
npm run test:bdd

# Run in CI mode (faster, more retries)
npm run test:bdd:ci

# Run in debug mode (slower, visible browser)
npm run test:bdd:debug
```

**Note**: Tests that use the VS Code API (tagged with `@extension`) will fail when run standalone. Use the VS Code Debugger method instead.

### Advanced Usage

```bash
# Run specific feature file
npm run test:bdd -- tests/bdd/features/example.feature

# Run scenarios with specific tag
npm run test:bdd -- --tags "@extension"

# Run multiple tags (AND)
npm run test:bdd -- --tags "@extension and @smoke"

# Run multiple tags (OR)
npm run test:bdd -- --tags "@extension or @integration"

# Exclude scenarios with tag
npm run test:bdd -- --tags "not @slow"

# Dry run (check for undefined steps)
npm run test:bdd -- --dry-run

# List available step definitions
npm run test:bdd -- --dry-run --format usage
```

## Writing Your First Test

### 1. Create a Feature File

Create `tests/bdd/features/my-feature.feature`:

```gherkin
Feature: My Feature
  As a user
  I want to do something
  So that I achieve a goal

  @extension
  Scenario: Basic scenario
    Given I have a precondition
    When I perform an action
    Then I should see a result
```

### 2. Generate Step Definitions

Run the test to see which steps are undefined:

```bash
npm run test:bdd -- tests/bdd/features/my-feature.feature
```

Cucumber will show you the undefined steps and suggest implementations.

### 3. Implement Step Definitions

Create `tests/bdd/step-definitions/my-feature.steps.ts`:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { ExtensionWorld } from '../support/world';

Given('I have a precondition', function(this: ExtensionWorld) {
  // Setup code
});

When('I perform an action', async function(this: ExtensionWorld) {
  // Action code
});

Then('I should see a result', function(this: ExtensionWorld) {
  // Assertion code
});
```

### 4. Run Your Test

```bash
npm run test:bdd -- tests/bdd/features/my-feature.feature
```

## Using Tags

Tags help organize and filter scenarios:

```gherkin
@extension @smoke
Scenario: Quick smoke test
  # This scenario runs with both @extension and @smoke tags

@webview @slow
Scenario: Webview test
  # This scenario uses Playwright and may be slower
```

Common tags:

- `@extension`: Requires VS Code extension activation
- `@webview`: Uses Playwright for webview testing
- `@integration`: Integration test
- `@smoke`: Quick smoke test
- `@slow`: Test that takes longer
- `@skip`: Temporarily skip this scenario

## Debugging

### VS Code Debugger

1. Open the feature or step definition file
2. Set breakpoints in step definitions
3. Press F5 and select "Debug BDD Tests"
4. Step through code with F10 (step over) or F11 (step into)

### Console Logging

Add `console.log()` statements in step definitions:

```typescript
When('I do something', function(this: ExtensionWorld) {
  console.log('Current test data:', this.testData);
  console.log('Extension active:', this.extension?.isActive);
});
```

### Screenshots on Failure

Screenshots are automatically taken on test failure and saved to:
```
tests/bdd/reports/screenshots/
```

## Test Reports

After running tests, reports are generated in `tests/bdd/reports/`:

- **cucumber-report.html**: Open in browser for visual report
- **cucumber-report.json**: Machine-readable JSON format
- **cucumber-report.xml**: JUnit XML for CI tools

View HTML report:
```bash
# Windows
start tests/bdd/reports/cucumber-report.html

# macOS
open tests/bdd/reports/cucumber-report.html

# Linux
xdg-open tests/bdd/reports/cucumber-report.html
```

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Run BDD Tests
  run: npm run test:bdd:ci

- name: Upload Test Reports
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: bdd-reports
    path: tests/bdd/reports/
```

### Azure DevOps Example

```yaml
- script: npm run test:bdd:ci
  displayName: 'Run BDD Tests'

- task: PublishTestResults@2
  condition: always()
  inputs:
    testResultsFormat: 'JUnit'
    testResultsFiles: 'tests/bdd/reports/cucumber-report.xml'
```

## Troubleshooting

### "Extension not found" Error

Make sure the extension ID matches:
```typescript
const ext = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
```

### Timeout Errors

Increase timeout in `cucumber.js`:
```javascript
worldParameters: {
  timeout: 60000  // 60 seconds
}
```

Or in individual steps:
```typescript
When('I do something slow', { timeout: 60000 }, async function() {
  // Long-running operation
});
```

### Playwright Browser Not Found

Install Playwright browsers:
```bash
npm run playwright:install
```

### TypeScript Compilation Errors

Compile tests before running:
```bash
npm run compile-tests
npm run test:bdd
```

### Step Definition Not Found

Make sure step definitions are in `tests/bdd/step-definitions/` and have `.ts` extension.

Check that the step text matches exactly (case-sensitive):
```gherkin
When I click the button  # Must match exactly
```

```typescript
When('I click the button', function() { ... })  // ✅ Matches
When('I click the Button', function() { ... })  // ❌ Doesn't match
```

## Best Practices

1. **One scenario, one behavior**: Each scenario should test one specific behavior
2. **Use Background for setup**: Avoid repeating Given steps across scenarios
3. **Keep steps reusable**: Write generic steps that work in multiple scenarios
4. **Use the World for state**: Store data in `this.setData()` / `this.getData()`
5. **Clean up after tests**: Use After hooks to clean up resources
6. **Tag appropriately**: Use tags to organize and filter tests
7. **Write declarative scenarios**: Focus on what, not how
8. **Keep step definitions simple**: Complex logic should be in helper functions

## Next Steps

1. Review the example feature and step definitions
2. Read the [BDD README](README.md) for detailed documentation
3. Check out [Cucumber documentation](https://cucumber.io/docs/cucumber/)
4. Explore [Playwright documentation](https://playwright.dev/)
5. Start writing tests for your features!

## Getting Help

- Check the [BDD README](README.md) for detailed documentation
- Review example tests in `features/example.feature`
- Look at helper functions in `support/helpers.ts`
- Consult [Cucumber documentation](https://cucumber.io/docs/cucumber/)
- Ask questions in the team chat or create an issue

## Summary

You now have a complete BDD testing infrastructure set up with:

✅ Cucumber for BDD testing  
✅ Playwright for browser automation  
✅ TypeScript support  
✅ VS Code debugger integration  
✅ Test reports (HTML, JSON, XML)  
✅ CI/CD ready  
✅ Example tests to get started  

Happy testing! 🎉
