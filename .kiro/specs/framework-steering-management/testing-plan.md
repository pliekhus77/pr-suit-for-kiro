# Testing Plan: Framework Steering Management

**Created:** 2025-01-05 | **Updated:** 2025-01-05 | **Status:** Draft

## Test Strategy

**Scope:** All framework steering management functionality including browsing, installation, updates, validation, and workspace initialization

**Approach:** 
- Unit tests (Jest) for business logic and utilities
- Integration tests (VS Code Extension Test Runner) for commands and UI
- Manual testing for user workflows and edge cases

**Pyramid:** Unit 60%, Integration 30%, Manual 10%

## Unit Test Scenarios

### FileSystemOperations

**Happy Path:**
- Given a valid directory path, when ensureDirectory is called, then directory is created
- Given an existing file path, when readFile is called, then file content is returned
- Given valid content and path, when writeFile is called, then file is written successfully
- Given a workspace with .kiro/ folder, when getKiroPath is called, then correct path is returned

**Failure Path:**
- Given insufficient permissions, when writeFile is called, then EACCES error is thrown
- Given non-existent file, when readFile is called, then ENOENT error is thrown
- Given invalid path, when ensureDirectory is called, then error is handled gracefully

**Edge Cases:**
- Given empty workspace, when getKiroPath is called, then undefined is returned
- Given nested directory path that doesn't exist, when ensureDirectory is called, then all parent directories are created
- Given file path with special characters, when writeFile is called, then file is created with escaped name

### FrameworkManager

**Happy Path:**
- Given valid manifest, when listAvailableFrameworks is called, then all 8 frameworks are returned
- Given framework ID "tdd-bdd-strategy", when getFrameworkById is called, then correct framework is returned
- Given search query "testing", when searchFrameworks is called, then TDD/BDD framework is in results
- Given framework ID and workspace, when installFramework is called, then file is created in .kiro/steering/
- Given installed framework, when isFrameworkInstalled is called, then true is returned

**Failure Path:**
- Given invalid framework ID, when getFrameworkById is called, then undefined is returned
- Given corrupted manifest, when listAvailableFrameworks is called, then error is thrown
- Given framework already installed, when installFramework is called with overwrite=false, then error is thrown
- Given missing .kiro/ directory, when installFramework is called, then directory is created first

**Edge Cases:**
- Given empty search query, when searchFrameworks is called, then all frameworks are returned
- Given framework with dependencies, when installFramework is called, then dependencies are checked
- Given manifest with duplicate IDs, when listAvailableFrameworks is called, then error is thrown

**Range/Boundary:**
- Given 0 frameworks in manifest, when listAvailableFrameworks is called, then empty array is returned
- Given 100 frameworks in manifest, when listAvailableFrameworks is called, then all are returned
- Given very long framework ID (>255 chars), when getFrameworkById is called, then handled gracefully

### SteeringValidator

**Happy Path:**
- Given steering document with all required sections, when validate is called, then isValid is true
- Given document with Purpose, Key Concepts, Best Practices, Summary, when validateStructure is called, then no issues returned
- Given document with code examples, when validateContent is called, then no issues returned
- Given properly formatted markdown, when validateFormatting is called, then no issues returned

**Failure Path:**
- Given document missing Purpose section, when validateStructure is called, then issue with severity Error is returned
- Given document with only theory (no examples), when validateContent is called, then warning is returned
- Given document with broken markdown syntax, when validateFormatting is called, then issue is returned
- Given document with broken internal links, when validate is called, then issue is returned

**Edge Cases:**
- Given empty document, when validate is called, then multiple structure issues are returned
- Given document with extra sections, when validateStructure is called, then no issues (extra sections allowed)
- Given document with mixed heading levels, when validateFormatting is called, then warning is returned

**Range/Boundary:**
- Given document with 0 sections, when validateStructure is called, then all required sections flagged as missing
- Given document with 50 sections, when validateStructure is called, then only required sections checked
- Given very large document (>1MB), when validate is called, then completes in <1s

### TemplateEngine

**Happy Path:**
- Given template with {{feature-name}}, when render is called with feature-name="test", then "test" is substituted
- Given template with {{date}}, when render is called, then current date is substituted
- Given template with multiple variables, when render is called, then all variables are substituted

**Failure Path:**
- Given template with undefined variable, when render is called, then variable is left as-is or replaced with empty string
- Given template with malformed variable syntax, when render is called, then syntax is left as-is

**Edge Cases:**
- Given template with no variables, when render is called, then template is returned unchanged
- Given template with escaped variable \{{var}}, when render is called, then variable is not substituted
- Given template with nested variables {{{{var}}}}, when render is called, then handled gracefully

## Integration Test Scenarios

### Extension Activation

**Happy Path:**
- Given workspace with .kiro/ directory, when VS Code opens workspace, then extension activates
- Given extension activated, when checking activation status, then isActive is true
- Given extension activated, when checking commands, then all commands are registered

**Failure Path:**
- Given workspace without .kiro/ directory, when VS Code opens workspace, then extension does not fully activate
- Given corrupted extension files, when activation is attempted, then error is logged and extension fails gracefully

**Edge Cases:**
- Given workspace with .kiro/ file (not directory), when activation is attempted, then handled gracefully
- Given multiple workspace folders, when activation is attempted, then activates for folder with .kiro/

### Browse Frameworks Command

**Happy Path:**
- Given extension activated, when "agentic-reviewer.browseFrameworks" is executed, then quick pick is shown
- Given quick pick shown, when framework is selected, then preview is displayed
- Given preview displayed, when "Install" is clicked, then framework is installed
- Given framework installed, when browsing again, then framework shows checkmark icon

**Failure Path:**
- Given no frameworks in manifest, when browse command is executed, then "No frameworks available" message is shown
- Given installation fails, when "Install" is clicked, then error message is shown

**Edge Cases:**
- Given framework already installed, when "Install" is clicked, then prompt for overwrite is shown
- Given preview displayed, when "Cancel" is clicked, then quick pick closes without action

### Install Framework Command

**Happy Path:**
- Given framework ID "tdd-bdd-strategy", when installFramework is called, then strategy-tdd-bdd.md is created in .kiro/steering/
- Given framework installed, when checking file system, then file exists with correct content
- Given framework installed, when checking metadata, then installed-frameworks.json is updated

**Failure Path:**
- Given invalid framework ID, when installFramework is called, then error notification is shown
- Given .kiro/ directory doesn't exist, when installFramework is called, then directory is created first

**Edge Cases:**
- Given framework with dependencies, when installFramework is called, then dependencies are installed first
- Given disk full, when installFramework is called, then error is handled and user is notified

### Tree View Display

**Happy Path:**
- Given frameworks installed, when tree view loads, then "Strategies (Installed)" category is shown
- Given strategies installed, when category is expanded, then all installed strategy files are shown
- Given steering file in tree, when clicked, then file opens in editor
- Given no strategies installed, when tree view loads, then "Browse Frameworks" button is shown

**Failure Path:**
- Given .kiro/steering/ directory doesn't exist, when tree view loads, then empty tree with "Initialize Workspace" button is shown
- Given corrupted metadata file, when tree view loads, then files are scanned directly from file system

**Edge Cases:**
- Given custom steering files exist, when tree view loads, then "Custom" category is shown
- Given project files (product.md, tech.md) exist, when tree view loads, then "Project" category is shown
- Given file is deleted externally, when tree view refreshes, then file is removed from tree

### Update Framework Command

**Happy Path:**
- Given outdated framework installed, when checkForUpdates is called, then update is detected
- Given update available, when updateFramework is called, then file is updated with new content
- Given framework updated, when checking metadata, then version is updated

**Failure Path:**
- Given framework is customized, when updateFramework is called, then warning is shown before updating
- Given update fails, when updateFramework is called, then original file is preserved

**Edge Cases:**
- Given framework is up-to-date, when updateFramework is called, then "Already up-to-date" message is shown
- Given framework is customized, when updateFramework is called with backup=true, then backup is created before updating

### Workspace Initialization

**Happy Path:**
- Given non-Kiro workspace, when "agentic-reviewer.initializeWorkspace" is executed, then .kiro/ structure is created
- Given initialization complete, when checking file system, then .kiro/steering/, .kiro/specs/, .kiro/settings/ exist
- Given "Install recommended frameworks" selected, when initialization completes, then 4 strategy files are installed

**Failure Path:**
- Given .kiro/ already exists, when initializeWorkspace is called, then "Already initialized" message is shown
- Given insufficient permissions, when initializeWorkspace is called, then error is shown with guidance

**Edge Cases:**
- Given "Custom" selected during initialization, when prompt is shown, then framework browser opens
- Given "Skip" selected during initialization, when initialization completes, then no frameworks are installed

### Validation Command

**Happy Path:**
- Given valid steering document open, when "agentic-reviewer.validateSteering" is executed, then success message is shown
- Given invalid steering document open, when validation is executed, then diagnostics are shown in editor
- Given validation issues, when hovering over diagnostic, then detailed message is shown

**Failure Path:**
- Given non-steering document open, when validation is executed, then "Not a steering document" message is shown
- Given no document open, when validation is executed, then "No document to validate" message is shown

**Edge Cases:**
- Given document with warnings only, when validation is executed, then warnings are shown but success message is displayed
- Given document with quick fix available, when clicking diagnostic, then quick fix is offered

## BDD Scenarios

```gherkin
Feature: Framework Steering Management
  As a developer using Kiro
  I want to easily install and manage framework steering documents
  So that Kiro follows best practices without manual setup

  Scenario: Browse and install a framework (Happy Path)
    Given I have a Kiro workspace open
    When I execute the "Browse Frameworks" command
    Then I see a list of available frameworks grouped by category
    When I select "TDD/BDD Testing Strategy"
    Then I see a preview with description and key concepts
    When I click "Install"
    Then the strategy-tdd-bdd.md file is created in .kiro/steering/
    And I see a success notification
    And the framework shows a checkmark in the browser

  Scenario: Install framework with conflict (Failure Path)
    Given I have a Kiro workspace open
    And strategy-tdd-bdd.md already exists in .kiro/steering/
    When I try to install "TDD/BDD Testing Strategy"
    Then I am prompted with options: "Overwrite", "Merge", "Keep Existing", "Cancel"
    When I select "Overwrite"
    Then the existing file is backed up
    And the new framework content is written
    And I see a success notification

  Scenario: View installed frameworks in tree view (Happy Path)
    Given I have a Kiro workspace open
    And I have installed strategy-tdd-bdd.md and strategy-security.md
    When I open the "Framework Steering" tree view
    Then I see "Strategies (Installed)" category
    And I see "strategy-tdd-bdd.md" under Strategies
    And I see "strategy-security.md" under Strategies
    When I click on "strategy-tdd-bdd.md"
    Then the file opens in the editor

  Scenario: Update outdated framework (Happy Path)
    Given I have a Kiro workspace open
    And I have strategy-tdd-bdd.md version 1.0.0 installed
    And version 1.1.0 is available in the library
    When the extension checks for updates
    Then I see a notification "Framework updates available"
    When I click the notification
    Then I see a list of outdated frameworks with version numbers
    When I select "Update" for TDD/BDD Testing Strategy
    Then I see a diff preview of changes
    When I confirm the update
    Then the file is updated to version 1.1.0
    And the metadata is updated
    And I see a summary of changes

  Scenario: Update customized framework (Edge Case)
    Given I have a Kiro workspace open
    And I have strategy-tdd-bdd.md installed and customized
    When I try to update the framework
    Then I see a warning "This framework has been customized"
    And I am offered options: "Update (lose changes)", "Create backup and update", "Cancel"
    When I select "Create backup and update"
    Then a backup file is created (strategy-tdd-bdd.md.backup)
    And the framework is updated
    And I see a notification with backup location

  Scenario: Create custom steering document (Happy Path)
    Given I have a Kiro workspace open
    When I execute "Create Custom Steering" command
    Then I am prompted for a document name
    When I enter "team-standards"
    Then a file "custom-team-standards.md" is created in .kiro/steering/
    And the file contains template sections: Purpose, Key Concepts, Best Practices, Anti-Patterns, Summary
    And the file opens in the editor

  Scenario: Validate steering document (Failure Path)
    Given I have a Kiro workspace open
    And I have a steering document open that is missing the Purpose section
    When I execute "Validate Steering Document" command
    Then I see a diagnostic error "Missing required section: Purpose"
    And the diagnostic is shown at the top of the document
    When I hover over the diagnostic
    Then I see a detailed message with guidance

  Scenario: Initialize new Kiro workspace (Happy Path)
    Given I have a non-Kiro workspace open
    When I execute "Initialize Workspace" command
    Then the .kiro/ directory structure is created
    And I am prompted "Install recommended frameworks?"
    When I select "Yes"
    Then strategy-tdd-bdd.md, strategy-c4-model.md, strategy-devops.md, and strategy-4d-safe.md are installed
    And I see a welcome message with next steps
    And the extension fully activates

  Scenario: Search framework references (Happy Path)
    Given I have a Kiro workspace open
    And I have framework reference docs in frameworks/ directory
    When I execute "Search Frameworks" command
    Then I am prompted for a search query
    When I enter "test-driven development"
    Then I see search results from framework reference docs
    When I click a result
    Then the framework reference document opens at the relevant section
```

## Test Data

**Test Data Sets:**

1. **Happy Path Data:**
   - Valid framework IDs: "tdd-bdd-strategy", "security-strategy", "c4-model-strategy"
   - Valid steering document with all required sections
   - Valid workspace with .kiro/ directory structure

2. **Invalid Data:**
   - Invalid framework IDs: "invalid-id", "", null, undefined
   - Steering document missing required sections
   - Workspace without .kiro/ directory

3. **Edge Case Data:**
   - Framework with dependencies
   - Customized steering document (modified content)
   - Very large steering document (>1MB)
   - Steering document with special characters in filename

4. **Performance Data:**
   - Manifest with 100 frameworks
   - Workspace with 50 installed frameworks
   - Steering document with 1000 lines

**Test Data Management:**
- Unit tests: Use mocked data and fixtures
- Integration tests: Create temporary test workspaces
- Cleanup: Delete test workspaces after tests complete

## Coverage Goals

**Overall:** 80% code coverage minimum

**By Component:**
- FileSystemOperations: 90% (critical utility)
- FrameworkManager: 90% (core business logic)
- SteeringValidator: 85% (validation rules)
- TemplateEngine: 80% (template processing)
- Commands: 75% (integration tested)
- Tree View Providers: 70% (UI components)

**Critical Paths:** 100% coverage required
- Framework installation flow
- Update detection and application
- Workspace initialization
- Validation logic

## Risk Assessment

**High-Risk Areas:**

1. **File System Operations**
   - Risk: Data loss, permission errors, race conditions
   - Mitigation: Comprehensive error handling, backups before overwrites, atomic operations
   - Extra Testing: Test on Windows, macOS, Linux; test with various permission scenarios

2. **Framework Updates**
   - Risk: Losing user customizations, version conflicts
   - Mitigation: Detect customizations, create backups, show diff preview
   - Extra Testing: Test with customized files, test rollback scenarios

3. **Workspace Initialization**
   - Risk: Partial initialization, corrupted state
   - Mitigation: Transactional approach, rollback on failure
   - Extra Testing: Test with various failure scenarios, test cleanup

4. **Extension Activation**
   - Risk: Slow activation, activation failures
   - Mitigation: Lazy loading, caching, graceful degradation
   - Extra Testing: Profile activation time, test with large workspaces

**Priorities:**
- **P1 (Must Test):** Framework installation, updates, tree view, workspace initialization
- **P2 (Should Test):** Validation, custom documents, search
- **P3 (Nice to Have):** Performance optimization, edge cases, error recovery

## Test Execution Plan

**Local Development:**
- Run unit tests on every file save: `npm run test:watch`
- Run integration tests before commit: `npm run test:integration`
- Run full test suite before PR: `npm test`

**CI/CD:**
- On commit: Run unit tests, lint, type check
- On PR: Run full test suite (unit + integration), code coverage report
- On merge: Run full test suite, build extension, create .vsix artifact
- Nightly: Run full test suite + performance tests + security scans

**Manual Testing:**
- Before release: Complete manual testing checklist
- After release: Smoke test in fresh VS Code installation

## Success Criteria

- [ ] All unit tests pass (80%+ coverage)
- [ ] All integration tests pass
- [ ] All BDD scenarios pass
- [ ] Manual testing checklist complete
- [ ] No critical or high-severity bugs
- [ ] Extension activates in < 500ms
- [ ] Framework installation completes in < 1s
- [ ] Tree view refresh completes in < 200ms
- [ ] Validation completes in < 500ms
- [ ] All commands work as expected
- [ ] Extension passes VS Code marketplace validation
