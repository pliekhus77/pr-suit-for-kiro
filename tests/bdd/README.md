# BDD Tests for Pragmatic Rhino SUIT Extension

This directory contains Behavior-Driven Development (BDD) tests using Cucumber and Playwright.

## Directory Structure

```
tests/bdd/
├── features/              # Gherkin feature files (.feature)
├── step-definitions/      # Step definition implementations (.ts)
├── support/              # Support files (world, hooks, helpers)
│   ├── world.ts          # Custom World class with VS Code and Playwright context
│   ├── hooks.ts          # Before/After hooks for setup and teardown
│   └── helpers.ts        # Common utility functions
├── reports/              # Test reports and screenshots (generated)
└── tsconfig.json         # TypeScript configuration for BDD tests
```

## Running Tests

### Run all BDD tests
```bash
npm run test:bdd
```

### Run specific feature
```bash
npm run test:bdd -- tests/bdd/features/example.feature
```

### Run with specific tag
```bash
npm run test:bdd -- --tags "@extension"
```

### Run in debug mode (non-headless, slower)
```bash
npm run test:bdd:debug
```

### Run in CI mode (parallel, with retries)
```bash
npm run test:bdd:ci
```

## Writing Feature Files

Feature files use Gherkin syntax to describe behavior in plain English:

```gherkin
Feature: Framework Installation
  As a developer
  I want to install framework steering documents
  So that Kiro follows best practices

  @extension
  Scenario: Install a framework
    Given a test workspace with .kiro directory
    When I execute the "Install Framework" command
    And I select "TDD/BDD Testing Strategy"
    Then the file ".kiro/steering/strategy-tdd-bdd.md" should exist
    And a success notification should be shown
```

### Gherkin Keywords

- **Feature**: High-level description of functionality
- **Scenario**: Specific test case
- **Given**: Preconditions (setup)
- **When**: Actions (what the user does)
- **Then**: Expected outcomes (assertions)
- **And**: Additional steps of the same type
- **But**: Negative assertions
- **Background**: Steps that run before each scenario

### Tags

Use tags to organize and filter scenarios:

- `@extension`: Tests that require VS Code extension activation
- `@webview`: Tests that use Playwright for webview testing
- `@integration`: Integration tests
- `@smoke`: Quick smoke tests
- `@slow`: Tests that take longer to run
- `@skip`: Temporarily skip a scenario

## Writing Step Definitions

Step definitions are TypeScript functions that implement the steps:

```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { ExtensionWorld } from '../support/world';

Given('a test workspace with .kiro directory', async function(this: ExtensionWorld) {
  const workspacePath = await createTestWorkspace('test-install');
  createKiroStructure(workspacePath);
  this.setData('workspacePath', workspacePath);
});

When('I execute the {string} command', async function(this: ExtensionWorld, commandName: string) {
  const result = await executeCommand(commandName);
  this.setData('commandResult', result);
});

Then('the file {string} should exist', function(this: ExtensionWorld, filePath: string) {
  const workspacePath = this.getData<string>('workspacePath');
  const fullPath = path.join(workspacePath!, filePath);
  assert(fileExists(fullPath), `File should exist: ${filePath}`);
});
```

## Using the World

The `ExtensionWorld` class provides context for each scenario:

```typescript
// Store data for use across steps
this.setData('key', value);

// Retrieve data
const value = this.getData<Type>('key');

// Access VS Code extension
const ext = this.getExtension();
await this.activateExtension();

// Use Playwright for webview testing
await this.initBrowser();
await this.page.goto('http://localhost:3000');
await this.page.click('button');
```

## Hooks

Hooks run at specific points in the test lifecycle:

- `BeforeAll`: Once before all scenarios
- `AfterAll`: Once after all scenarios
- `Before`: Before each scenario
- `After`: After each scenario
- `BeforeStep`: Before each step (optional)
- `AfterStep`: After each step (optional)

Hooks are defined in `support/hooks.ts`.

## Test Reports

Test reports are generated in `tests/bdd/reports/`:

- `cucumber-report.html`: HTML report (human-readable)
- `cucumber-report.json`: JSON report (for CI tools)
- `cucumber-report.xml`: JUnit XML report (for CI tools)
- `screenshots/`: Screenshots on test failure

## Best Practices

1. **Keep scenarios focused**: One scenario should test one behavior
2. **Use Background for common setup**: Avoid repeating Given steps
3. **Write declarative scenarios**: Focus on what, not how
4. **Use tags for organization**: Group related scenarios
5. **Keep step definitions reusable**: Write generic steps that can be reused
6. **Use the World for state**: Don't use global variables
7. **Clean up after tests**: Use After hooks to clean up resources
8. **Take screenshots on failure**: Helps with debugging

## Debugging

### VS Code Debugger

1. Set breakpoints in step definitions
2. Run "Debug BDD Tests" launch configuration
3. Step through code with F10/F11

### Console Logging

Use `console.log()` in step definitions for debugging:

```typescript
When('I do something', function(this: ExtensionWorld) {
  console.log('Current data:', this.testData);
  // ... rest of step
});
```

### Slow Motion

Run tests in slow motion to see what's happening:

```bash
npm run test:bdd:debug
```

This runs with `slowMo: 100` and `headless: false`.

## Troubleshooting

### Extension not found

Make sure the extension is installed and the ID matches:

```typescript
const ext = vscode.extensions.getExtension('pragmatic-rhino.pragmatic-rhino-suit');
```

### Timeout errors

Increase timeout in `cucumber.js`:

```javascript
worldParameters: {
  timeout: 60000  // 60 seconds
}
```

### Playwright errors

Make sure Playwright browsers are installed:

```bash
npx playwright install
```

## Examples

See `features/example.feature` and `step-definitions/example.steps.ts` for working examples.

## Resources

- [Cucumber Documentation](https://cucumber.io/docs/cucumber/)
- [Playwright Documentation](https://playwright.dev/)
- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Gherkin Reference](https://cucumber.io/docs/gherkin/reference/)


## Implemented Scenarios

### Framework Installation (framework-installation.feature)

This feature tests the framework browsing and installation functionality:

- ✅ **Browse and install a framework (Happy Path)**: Tests the complete flow of browsing available frameworks, selecting one, and installing it to the workspace
- ✅ **Install framework with conflict (Failure Path)**: Tests handling of conflicts when a framework file already exists, including backup and overwrite options

### Framework Management (framework-management.feature)

This feature tests framework viewing, updating, and management:

- ✅ **View installed frameworks in tree view (Happy Path)**: Tests displaying installed frameworks in the tree view and opening them in the editor
- ✅ **Update outdated framework (Happy Path)**: Tests the complete update flow including update detection, diff preview, and version updates
- ✅ **Update customized framework (Edge Case)**: Tests handling of customized frameworks during updates, including backup creation

## Implementation Status

The step definitions are currently **stubs** that provide the structure for BDD tests. They:
- Set up the test context (workspace, paths, files)
- Simulate user interactions
- Verify basic file operations
- Use assertions to validate behavior

### Next Steps for Full Implementation

To make these tests fully functional, the following enhancements are needed:

1. **VS Code UI Interaction**: Implement actual interaction with VS Code quick picks, dialogs, and notifications
2. **Command Execution**: Ensure commands are properly registered and executed in the test environment
3. **Tree View Testing**: Add verification of tree view provider state and rendering
4. **Webview Testing**: Use Playwright to test any webview-based UI components
5. **Notification Verification**: Implement checking of VS Code notification API calls
6. **File System Verification**: Enhance file system checks to verify actual content and metadata

### Running the Implemented Tests

```bash
# Run all framework tests
npm run test:bdd -- tests/bdd/features/framework-*.feature

# Run only installation tests
npm run test:bdd -- tests/bdd/features/framework-installation.feature

# Run only management tests
npm run test:bdd -- tests/bdd/features/framework-management.feature
```

## Test Coverage

These BDD scenarios cover the following requirements from the testing plan:

- **Requirements 1.1-1.6**: Framework browsing and discovery
- **Requirements 2.1-2.7**: Framework installation and conflict handling
- **Requirements 3.1-3.7**: Tree view display and interaction
- **Requirements 4.1-4.8**: Framework updates and versioning

See [testing-plan.md](../../.kiro/specs/framework-steering-management/testing-plan.md) for complete test coverage details.
