# Testing Guide

## Overview

This document describes the testing strategy and provides manual testing checklists for the Pragmatic Rhino SUIT extension.

## Test Pyramid

```
        /\
       /  \      E2E Tests (Manual)
      /____\     
     /      \    Integration Tests (VS Code Extension Test Runner)
    /________\   
   /          \  Unit Tests (Jest)
  /____________\ 
```

**Distribution:**
- Unit Tests: 70% (Fast, isolated, many)
- Integration Tests: 20% (Medium speed, component interaction)
- E2E Tests: 10% (Slow, full workflow, manual)

## Running Tests

### Unit Tests (Jest)

```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- framework-manager.test.ts
```

### Integration Tests (VS Code Extension Test Runner)

```bash
# Run all integration tests
npm run test:integration

# Run specific test suite
npm run test:integration -- --grep "Framework Installation"
```

### Manual E2E Tests

See [Manual Testing Checklist](#manual-testing-checklist) below.

## Test Coverage

**Current Coverage:**
- Overall: 85%
- Services: 90%
- Commands: 80%
- Providers: 85%
- Utils: 95%

**Coverage Requirements:**
- Minimum: 80% overall
- Critical paths: 100%
- Public APIs: 100%

## Unit Tests

### Structure

```typescript
describe('FrameworkManager', () => {
  describe('installFramework', () => {
    it('should install framework to .kiro/steering/', async () => {
      // Arrange
      const manager = new FrameworkManager(mockContext, mockFileSystem);
      
      // Act
      await manager.installFramework('tdd-bdd-strategy');
      
      // Assert
      expect(mockFileSystem.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('strategy-tdd-bdd.md'),
        expect.any(String)
      );
    });
  });
});
```

### Best Practices

- **AAA Pattern**: Arrange, Act, Assert
- **One assertion per test**: Focus on single behavior
- **Descriptive names**: `MethodName_Scenario_ExpectedBehavior`
- **Mock external dependencies**: File system, VS Code API
- **Test edge cases**: Empty inputs, null values, errors

## Integration Tests

### Structure

```typescript
suite('Framework Installation Integration Tests', () => {
  test('should install framework via command', async () => {
    // Arrange: Create test workspace
    const workspaceUri = vscode.Uri.file(testWorkspacePath);
    
    // Act: Execute command
    await vscode.commands.executeCommand(
      'agentic-reviewer.installFramework',
      'tdd-bdd-strategy'
    );
    
    // Assert: Verify file exists
    const fileUri = vscode.Uri.file(
      path.join(testWorkspacePath, '.kiro/steering/strategy-tdd-bdd.md')
    );
    const stat = await vscode.workspace.fs.stat(fileUri);
    assert.ok(stat.size > 0);
  });
});
```

### Best Practices

- **Real VS Code environment**: Use Extension Development Host
- **Clean workspace**: Create fresh test workspace for each test
- **Test user workflows**: Simulate actual user interactions
- **Verify side effects**: Check file system, UI state

## Manual Testing Checklist

### Pre-Release Testing

Complete this checklist before each release:

#### 1. Installation & Activation

- [ ] Install extension from VSIX
- [ ] Open workspace without `.kiro/` directory
- [ ] Extension does not activate automatically
- [ ] Run "Initialize Workspace" command
- [ ] Extension activates successfully
- [ ] Activation time < 500ms (check console)
- [ ] Welcome message appears on first activation
- [ ] Welcome message does not appear on subsequent activations

#### 2. Framework Browsing

- [ ] Open Command Palette (`Ctrl+Shift+P`)
- [ ] Run "Pragmatic Rhino SUIT: Browse Frameworks"
- [ ] All 8 frameworks appear in quick pick
- [ ] Frameworks are grouped by category
- [ ] Framework descriptions are clear
- [ ] Select a framework
- [ ] Preview shows framework details
- [ ] "Install" button works
- [ ] "View Full Documentation" button works (if reference exists)
- [ ] "Cancel" button works

#### 3. Framework Installation

- [ ] Install "TDD/BDD Testing Strategy"
- [ ] File created at `.kiro/steering/strategy-tdd-bdd.md`
- [ ] File content matches template
- [ ] Success notification appears
- [ ] Tree view updates automatically
- [ ] Install same framework again
- [ ] Conflict resolution prompt appears
- [ ] "Overwrite" option works
- [ ] Backup file created with timestamp
- [ ] "Keep Existing" option works (no changes)
- [ ] "Cancel" option works (no changes)
- [ ] Install all 8 frameworks
- [ ] All files created successfully
- [ ] Metadata file created at `.kiro/.metadata/installed-frameworks.json`
- [ ] Metadata contains all 8 frameworks

#### 4. Tree View

- [ ] "Framework Steering" tree view appears in Explorer
- [ ] Three categories shown: Strategies, Project, Custom
- [ ] Strategies category shows installed frameworks
- [ ] Click on framework file
- [ ] File opens in editor
- [ ] Right-click on framework file
- [ ] Context menu shows: Open, Update, Remove, Reveal
- [ ] "Open" command works
- [ ] "Reveal in File Explorer" command works
- [ ] Hover over framework file
- [ ] Tooltip shows framework name and last modified date
- [ ] Icons are appropriate for each item type
- [ ] Refresh button in tree view title works

#### 5. Framework Updates

- [ ] Modify installed framework file (add a comment)
- [ ] Run "Update Framework" from context menu
- [ ] Warning about customization appears
- [ ] Backup option offered
- [ ] Diff preview shows changes
- [ ] Confirm update
- [ ] File updated to latest version
- [ ] Backup created
- [ ] Run "Update All Frameworks"
- [ ] All frameworks checked for updates
- [ ] Summary shown after update
- [ ] No updates available message if all current

#### 6. Custom Steering Documents

- [ ] Run "Create Custom Steering" command
- [ ] Prompt for document name appears
- [ ] Enter "team-standards"
- [ ] File created at `.kiro/steering/custom-team-standards.md`
- [ ] Template includes all required sections
- [ ] File opens in editor
- [ ] Custom document appears in tree view under "Custom" category
- [ ] Right-click on custom document
- [ ] Context menu shows: Open, Rename, Delete, Export
- [ ] "Rename" command works
- [ ] "Delete" command works (with confirmation)
- [ ] "Export to Library" shows placeholder message

#### 7. Validation

- [ ] Open a steering document
- [ ] Run "Validate Steering Document" command
- [ ] Validation runs successfully
- [ ] No issues found for valid document
- [ ] Remove "Purpose" section from document
- [ ] Run validation again
- [ ] Diagnostic appears in editor
- [ ] Problem panel shows validation issue
- [ ] Quick fix offered (if applicable)
- [ ] Fix issue
- [ ] Run validation again
- [ ] Success message appears

#### 8. Workspace Initialization

- [ ] Open folder without `.kiro/` directory
- [ ] Run "Initialize Workspace" command
- [ ] Prompt for recommended frameworks appears
- [ ] Select "Yes" option
- [ ] Directory structure created (`.kiro/steering/`, `specs/`, `settings/`, `.metadata/`)
- [ ] Recommended frameworks installed (4 frameworks)
- [ ] Welcome message appears
- [ ] Extension fully activated
- [ ] Tree view populated
- [ ] Run initialization again in same workspace
- [ ] Warning that workspace already initialized
- [ ] Option to reinitialize or cancel

#### 9. Framework References

- [ ] Open a steering document
- [ ] Code lens "View Framework Reference" appears at top
- [ ] Click code lens
- [ ] Prompt to initialize frameworks directory (if not exists)
- [ ] Confirm initialization
- [ ] `frameworks/` directory created
- [ ] Reference docs copied
- [ ] Reference document opens
- [ ] Hover over framework-specific term
- [ ] Tooltip with definition appears
- [ ] Run "Search Frameworks" command
- [ ] Enter search query
- [ ] Results appear
- [ ] Click result
- [ ] Opens at relevant section

#### 10. Error Scenarios

- [ ] Try to install framework without `.kiro/` directory
- [ ] Appropriate error message appears
- [ ] Try to validate non-steering document
- [ ] Appropriate error message appears
- [ ] Try to update non-existent framework
- [ ] Appropriate error message appears
- [ ] Simulate file system error (read-only directory)
- [ ] Graceful error handling
- [ ] Error message is user-friendly
- [ ] Extension remains functional after error

#### 11. Performance

- [ ] Measure activation time (check console)
- [ ] Activation < 500ms
- [ ] Install framework
- [ ] Installation < 1s
- [ ] Refresh tree view
- [ ] Refresh < 200ms
- [ ] Validate large document (> 1000 lines)
- [ ] Validation < 500ms
- [ ] Make rapid file changes
- [ ] Tree view updates are debounced (not excessive)

#### 12. Cross-Platform

**Windows:**
- [ ] All features work on Windows
- [ ] File paths use correct separators
- [ ] No permission issues

**macOS:**
- [ ] All features work on macOS
- [ ] File paths use correct separators
- [ ] No permission issues

**Linux:**
- [ ] All features work on Linux
- [ ] File paths use correct separators
- [ ] No permission issues

## Test Scenarios

### Complete Workflow: Browse → Install → Validate → Update

**Scenario:** New user installs and uses frameworks

1. **Setup**
   - Open VS Code
   - Create new folder
   - Open folder in VS Code

2. **Initialize**
   - Run "Initialize Workspace"
   - Select "Custom" option
   - Browse frameworks
   - Install "TDD/BDD Testing Strategy"
   - Install "Azure Hosting Strategy"

3. **Use**
   - Create new spec with Kiro
   - Kiro uses installed framework guidance
   - Verify testing-plan.md is created (TDD/BDD)
   - Verify Azure services are recommended (Azure)

4. **Validate**
   - Open `strategy-tdd-bdd.md`
   - Run "Validate Steering Document"
   - Verify no issues

5. **Update**
   - Modify framework file (add comment)
   - Run "Update Framework"
   - Verify backup created
   - Verify file updated

6. **Cleanup**
   - Delete test workspace

**Expected Result:** All steps complete successfully without errors

### Error Recovery

**Scenario:** User encounters errors and recovers

1. **File System Error**
   - Make `.kiro/steering/` read-only
   - Try to install framework
   - Verify error message
   - Make directory writable
   - Retry installation
   - Verify success

2. **Invalid Framework**
   - Try to install non-existent framework ID
   - Verify error message
   - Extension remains functional

3. **Corrupted Metadata**
   - Manually corrupt `installed-frameworks.json`
   - Restart extension
   - Verify graceful handling
   - Metadata regenerated

**Expected Result:** Extension handles errors gracefully and recovers

## Regression Testing

Before each release, run full regression test suite:

1. **All unit tests pass**
2. **All integration tests pass**
3. **Manual testing checklist complete**
4. **No new console errors or warnings**
5. **Performance targets met**
6. **Cross-platform testing complete**

## Bug Reporting

When reporting bugs, include:

- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots or GIFs**
- **VS Code version**
- **Extension version**
- **Operating system**
- **Console errors** (Help > Toggle Developer Tools)

## Test Data

### Test Workspaces

Create test workspaces in `test-workspaces/`:

```
test-workspaces/
├── empty/                    # No .kiro directory
├── initialized/              # Has .kiro structure
├── with-frameworks/          # Has installed frameworks
└── corrupted/                # Has corrupted metadata
```

### Test Frameworks

Use actual framework files from `resources/frameworks/` for testing.

## Continuous Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
        node: [18, 20]
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      - run: npm install
      - run: npm test
      - run: npm run test:integration
```

## Test Maintenance

- **Update tests** when adding new features
- **Remove obsolete tests** when removing features
- **Refactor tests** to reduce duplication
- **Keep tests fast** (unit tests < 100ms each)
- **Document complex test scenarios**

## Detailed Documentation

For more detailed information, see:

- **[Test Structure and Organization](testing/TEST_STRUCTURE.md)** - How tests are organized in the project
- **[Running Tests Guide](testing/RUNNING_TESTS.md)** - Comprehensive guide on running different test suites
- **[Testing Guidelines for Contributors](testing/CONTRIBUTING_TESTS.md)** - Best practices for writing tests
- **[Test Troubleshooting Guide](testing/TROUBLESHOOTING.md)** - Solutions for common test failures

## Resources

- [VS Code Extension Testing](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
