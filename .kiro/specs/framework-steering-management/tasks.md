# Implementation Plan: Framework Steering Management

## Overview

This implementation plan breaks down the Framework Steering Management feature into discrete, testable tasks. Each task builds incrementally on previous work, following test-driven development practices. The plan prioritizes core functionality first, with testing integrated throughout.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize TypeScript VS Code extension project with proper configuration
  - Set up build tooling (TypeScript compiler, esbuild for bundling)
  - Configure Jest for unit testing
  - Configure VS Code Extension Test Runner for integration tests
  - Create basic extension entry point (activate/deactivate functions)
  - Add extension manifest (package.json) with activation events
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [x] 2. File system operations foundation
  - [x] 2.1 Implement FileSystemOperations utility class
    - Create methods for directory operations (ensure, exists, list)
    - Create methods for file operations (read, write, copy, delete, exists)
    - Create workspace path helpers (getWorkspacePath, getKiroPath, getSteeringPath)
    - Handle errors gracefully with proper error types
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 2.2 Write unit tests for FileSystemOperations
    - Test directory operations with mocked file system
    - Test file operations with mocked file system
    - Test error handling (ENOENT, EACCES, etc.)
    - Test workspace path resolution
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 3. Framework library and manifest
  - [x] 3.1 Create framework manifest structure
    - Create resources/frameworks/ directory in extension
    - Define manifest.json schema with framework metadata
    - Create initial manifest.json with all 8 strategy frameworks
    - Copy existing strategy-*.md files to resources/frameworks/
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 3.2 Implement FrameworkManager service
    - Create FrameworkManager class with manifest loading
    - Implement listAvailableFrameworks() method
    - Implement getFrameworkById() method
    - Implement searchFrameworks() method
    - Cache manifest in memory after first load
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 3.3 Write unit tests for FrameworkManager
    - Test manifest loading and parsing
    - Test framework listing by category
    - Test framework search functionality
    - Test caching behavior
    - Test error handling for invalid manifest
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 4. Framework installation
  - [x] 4.1 Implement framework installation logic
    - Add installFramework() method to FrameworkManager
    - Check if framework already installed
    - Copy framework content to .kiro/steering/
    - Create .kiro/.metadata/ directory and installed-frameworks.json
    - Update metadata after successful installation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 4.2 Handle installation conflicts
    - Detect existing files before installation
    - Prompt user for action (Overwrite, Merge, Keep Existing, Cancel)
    - Implement overwrite logic
    - Implement backup creation before overwrite
    - Show success notification with file path
    - _Requirements: 2.4, 2.5, 2.6, 2.7_
  
  - [x] 4.3 Write unit tests for installation
    - Test successful installation flow
    - Test conflict detection
    - Test metadata updates
    - Test error handling (permission denied, disk full)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

- [x] 5. Browse frameworks command
  - [x] 5.1 Implement framework browser command
    - Register "agentic-reviewer.browseFrameworks" command
    - Create FrameworkQuickPickItem interface
    - Show quick pick with all available frameworks
    - Group frameworks by category
    - Indicate installed frameworks with checkmark icon
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 5.2 Implement framework preview
    - Show framework description and key concepts in preview
    - Add "Install", "View Full Documentation", "Cancel" buttons
    - Handle "Install" action (call FrameworkManager.installFramework)
    - Handle "View Full Documentation" (open framework reference if exists)
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [x] 5.3 Write integration tests for browse command
    - Test command registration
    - Test quick pick display
    - Test framework installation from quick pick
    - Test preview display
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [x] 6. Steering document tree view


  - [x] 6.1 Implement SteeringTreeProvider
    - Create SteeringTreeProvider class implementing TreeDataProvider
    - Define SteeringItem interface with category support
    - Implement getTreeItem() method
    - Implement getChildren() method with category grouping
    - Scan .kiro/steering/ directory for files
    - Categorize files: Strategies (Installed), Project, Custom
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [x] 6.2 Register tree view in extension
    - Register tree view in package.json contributes.views
    - Register tree view provider in extension activation
    - Add refresh command for tree view
    - Handle file system watcher for .kiro/steering/ changes
    - Show "Browse Frameworks" button when no strategies installed
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [x] 6.3 Implement tree view interactions
    - Handle click to open file in editor
    - Add context menu for steering documents
    - Implement "Open" action
    - Implement "Reveal in File Explorer" action
    - Show tooltips with framework name and last modified date
    - _Requirements: 3.3, 3.4, 3.5, 3.6, 3.7_
  
  - [x] 6.4 Write integration tests for tree view
    - Test tree view registration
    - Test category grouping
    - Test file click opens editor
    - Test refresh updates tree
    - Test context menu actions
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 7. Framework updates and versioning
  - [x] 7.1 Implement update detection
    - Add checkForUpdates() method to FrameworkManager
    - Compare installed versions with manifest versions
    - Return list of outdated frameworks with version info
    - Show notification when updates available
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 7.2 Implement framework update logic
    - Add updateFramework() method to FrameworkManager
    - Check if framework is customized (compare content hash)
    - Warn user if customized and offer backup
    - Create backup before updating customized files
    - Update framework content and metadata
    - Show diff preview of changes before updating
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 7.3 Implement update commands
    - Register "agentic-reviewer.updateFramework" command
    - Register "agentic-reviewer.updateAllFrameworks" command
    - Add "Update from Library" context menu action
    - Show update summary after completion
    - _Requirements: 4.2, 4.3, 4.5, 4.6, 4.8_
  
  - [x] 7.4 Write unit tests for updates

    - Test update detection logic
    - Test customization detection
    - Test backup creation
    - Test update flow
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 8. Custom steering document creation
  - [x] 8.1 Implement custom steering creation
    - Register "agentic-reviewer.createCustomSteering" command
    - Prompt for document name
    - Validate name is kebab-case format
    - Create template with standard sections (Purpose, Key Concepts, Best Practices, Anti-Patterns, Summary)
    - Save to .kiro/steering/ with custom- prefix
    - Open in editor after creation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [x] 8.2 Add custom document management
    - Show custom documents in tree view under "Custom" category
    - Add "Rename" context menu action for custom documents
    - Add "Delete" context menu action for custom documents
    - Add "Export to Library" action (future enhancement placeholder)
    - _Requirements: 5.6, 5.7_
  
  - [x] 8.3 Write integration tests for custom documents
    - Test custom document creation
    - Test name validation
    - Test template generation
    - Test tree view display
    - Test context menu actions
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 9. Steering document validation
  - [x] 9.1 Implement SteeringValidator service
    - Create SteeringValidator class
    - Implement validateStructure() method (check required sections)
    - Implement validateContent() method (check for actionable guidance, examples)
    - Implement validateFormatting() method (check markdown syntax, headings)
    - Return ValidationResult with issues and warnings
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [x] 9.2 Implement validation command and diagnostics
    - Register "agentic-reviewer.validateSteering" command
    - Create diagnostic collection for validation issues
    - Show diagnostics in editor with severity levels
    - Provide quick fixes for common issues
    - Show success message when validation passes
    - _Requirements: 6.1, 6.6, 6.7, 6.8_
  
  - [x] 9.3 Write unit tests for validation
    - Test structure validation rules
    - Test content validation rules
    - Test formatting validation rules
    - Test diagnostic generation
    - Test quick fix suggestions
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

- [x] 10. Workspace initialization
  - [x] 10.1 Implement workspace initialization
    - Register "agentic-reviewer.initializeWorkspace" command
    - Check if .kiro/ directory already exists
    - Create directory structure (.kiro/steering/, .kiro/specs/, .kiro/settings/, .kiro/.metadata/)
    - Optionally create frameworks/ directory
    - Prompt for recommended frameworks installation
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_
  
  - [x] 10.2 Implement recommended frameworks installation
    - Show options: "Yes", "Custom", "Skip"
    - Install recommended frameworks if "Yes" selected (strategy-tdd-bdd, strategy-c4-model, strategy-devops, strategy-4d-safe)
    - Show framework browser if "Custom" selected
    - Show welcome message with next steps after initialization
    - Trigger extension activation after initialization
    - _Requirements: 8.4, 8.5, 8.6, 8.7_
  
  - [x] 10.3 Write integration tests for initialization
    - Test directory creation
    - Test recommended frameworks installation
    - Test custom frameworks selection
    - Test welcome message display
    - Test extension activation after init
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 11. Framework reference integration
  - [x] 11.1 Implement framework reference features
    - Add code lens "View Framework Reference" to steering documents
    - Implement hover provider for framework-specific terms
    - Register "agentic-reviewer.searchFrameworks" command
    - Implement full-text search across framework references
    - Open framework reference at relevant section from search results
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 11.2 Initialize frameworks directory
    - Offer to initialize frameworks/ directory if missing
    - Copy framework reference docs from extension resources
    - Link steering documents to reference docs
    - _Requirements: 7.3_
  
  - [x] 11.3 Write integration tests for references
    - Test code lens display
    - Test hover provider
    - Test search functionality
    - Test framework directory initialization
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 12. Polish and documentation
  - [x] 12.1 Add extension icons and branding
    - Create extension icon
    - Add icons for tree view items (framework, custom, project)
    - Add icons for commands in command palette
    - Style quick pick items with appropriate icons
    - _Requirements: All_
  
  - [x] 12.2 Create extension documentation
    - Write comprehensive README.md with feature overview
    - Add screenshots and GIFs demonstrating key features
    - Document all commands and their usage
    - Create CHANGELOG.md for version tracking
    - Add LICENSE file
    - _Requirements: All_
 
  - [x] 12.3 Optimize performance
    - Implement lazy loading for framework manifest
    - Add caching for frequently accessed data
    - Debounce file system watchers
    - Profile extension activation time (target < 500ms)
    - _Requirements: All_
  
  - [x] 12.4 End-to-end testing
    - Test complete workflow: browse → install → validate → update
    - Test workspace initialization flow
    - Test custom document creation and management
    - Test tree view interactions
    - Test error scenarios and recovery
    - _Requirements: All_

- [x] 13. Complete unit test coverage (Priority 1 - Critical)
  - [x] 13.1 Unit tests for FileSystemOperations
    - Test ensureDirectory() with various permission scenarios (EACCES, EPERM)
    - Test readFile() error handling (ENOENT, EACCES, invalid encoding)
    - Test writeFile() with special characters in filenames
    - Test getKiroPath() edge cases (no workspace, multiple workspaces, .kiro as file)
    - Test nested directory creation with ensureDirectory()
    - Test atomic file operations and race conditions
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [x] 13.2 Unit tests for FrameworkManager (comprehensive)
    - Test listAvailableFrameworks() with corrupted manifest (invalid JSON, missing fields)
    - Test searchFrameworks() with empty query (should return all)
    - Test searchFrameworks() with special characters and regex patterns
    - Test isFrameworkInstalled() logic with various metadata states
    - Test framework dependency checking and resolution
    - Test range/boundary conditions: 0 frameworks, 100 frameworks, very long IDs (>255 chars)
    - Test manifest caching and cache invalidation
    - Test concurrent framework operations
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3_
  
  - [x] 13.3 Unit tests for SteeringValidator (comprehensive)
    - Test validateStructure() for each required section individually
    - Test validateContent() for code examples detection (various languages)
    - Test validateContent() for actionable guidance patterns
    - Test validateFormatting() for markdown syntax errors
    - Test validateFormatting() for heading level consistency
    - Test edge cases: empty document, document with only whitespace
    - Test edge cases: document with 50+ sections
    - Test edge cases: very large document (>1MB) performance
    - Test broken internal links detection
    - Test mixed heading levels warnings
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_
  
  - [x] 13.4 Unit tests for TemplateEngine
    - Test variable substitution with {{feature-name}}, {{date}}, {{author}}
    - Test multiple variables in single template
    - Test undefined variable handling (leave as-is vs empty string)
    - Test malformed variable syntax handling
    - Test escaped variables (\{{var}}) should not be substituted
    - Test nested variables {{{{var}}}} handling
    - Test template with no variables returns unchanged
    - Test special characters in variable values
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 14. Complete integration test coverage (Priority 1 - Critical)
  - [x] 14.1 Browse frameworks command - missing scenarios
    - Test "No frameworks available" message when manifest is empty
    - Test installation failure handling with error notification
    - Test framework already installed with overwrite prompt flow
    - Test preview "Cancel" action closes quick pick without changes
    - Test framework grouping by category in quick pick
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  
  - [x] 14.2 Install framework command - missing scenarios
    - Test invalid framework ID shows error notification
    - Test framework with dependencies installs dependencies first
    - Test disk full error handling with user notification
    - Test installation to non-existent .kiro/ directory creates it first
    - Test metadata update after installation
    - Test concurrent installation attempts
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 14.3 Update framework command - complete implementation
    - Test checkForUpdates() detects outdated frameworks
    - Test updateFramework() updates file content and metadata
    - Test customized framework warning before update
    - Test backup creation for customized frameworks
    - Test "Already up-to-date" message for current frameworks
    - Test diff preview display before applying update
    - Test update summary after completion
    - Test rollback on update failure
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_
  
  - [x] 14.4 Search framework references - complete implementation
    - Test "agentic-reviewer.searchFrameworks" command registration
    - Test search prompt for query input
    - Test search results display from framework reference docs
    - Test clicking result opens document at relevant section
    - Test search with no results shows appropriate message
    - Test search with special characters and regex patterns
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 15. Performance testing and benchmarks (Priority 2 - Important)
  - [x] 15.1 Extension activation performance
    - Benchmark extension activation time (target < 500ms)
    - Test activation with large workspaces (50+ installed frameworks)
    - Test activation with corrupted metadata (graceful degradation)
    - Profile memory usage during activation
    - Test lazy loading effectiveness
    - _Requirements: All_
  
  - [x] 15.2 Framework operations performance
    - Benchmark framework installation (target < 1s)
    - Benchmark tree view refresh (target < 200ms)
    - Benchmark validation execution (target < 500ms)
    - Test with large documents (>1MB) for validation
    - Test with 100 frameworks in manifest
    - Test with 50 installed frameworks in workspace
    - _Requirements: All_
  
  - [x] 15.3 File system operations performance
    - Benchmark directory scanning with 1000+ files
    - Test file watcher performance with rapid changes
    - Test concurrent file operations
    - Profile memory usage with large file operations
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [x] 16. BDD acceptance tests (Priority 2 - Important)
  - [x] 16.1 Set up BDD testing infrastructure
    - Install and configure Reqnroll (or Cucumber) for TypeScript
    - Set up Playwright for browser automation (if needed for webviews)
    - Create feature file directory structure (tests/bdd/features/)
    - Create step definitions directory (tests/bdd/step-definitions/)
    - Configure BDD test runner in package.json
    - _Requirements: All_
  
  - [x] 16.2 Implement BDD scenarios from testing-plan.md
    - Create feature file: framework-installation.feature
    - Implement steps for "Browse and install a framework" scenario
    - Implement steps for "Install framework with conflict" scenario
    - Create feature file: framework-management.feature
    - Implement steps for "View installed frameworks in tree view" scenario
    - Implement steps for "Update outdated framework" scenario
    - Implement steps for "Update customized framework" scenario
    - _Requirements: 1.1-1.6, 2.1-2.7, 3.1-3.7, 4.1-4.8_
  
  - [x] 16.3 Implement custom steering BDD scenarios
    - Create feature file: custom-steering.feature
    - Implement steps for "Create custom steering document" scenario
    - Implement steps for "Validate steering document" scenario
    - _Requirements: 5.1-5.7, 6.1-6.8_
  
  - [x] 16.4 Implement workspace initialization BDD scenarios
    - Create feature file: workspace-initialization.feature
    - Implement steps for "Initialize new Kiro workspace" scenario
    - Implement steps for recommended frameworks installation
    - _Requirements: 8.1-8.7_
  
  - [x] 16.5 Implement search BDD scenarios
    - Create feature file: framework-search.feature
    - Implement steps for "Search framework references" scenario
    - _Requirements: 7.1-7.6_

- [ ] 17. Test data management and fixtures (Priority 2 - Important)
  - [ ] 17.1 Create test data builders
    - Create FrameworkBuilder for test framework objects
    - Create SteeringDocumentBuilder for test documents
    - Create ManifestBuilder for test manifest data
    - Create MetadataBuilder for test metadata
    - Implement fluent API for all builders
    - _Requirements: All_
  
  - [ ] 17.2 Create test fixtures
    - Create fixture for valid steering document with all sections
    - Create fixture for invalid steering document (missing sections)
    - Create fixture for large steering document (>1MB)
    - Create fixture for manifest with 100 frameworks
    - Create fixture for workspace with 50 installed frameworks
    - Create fixture for corrupted manifest
    - Create fixture for customized framework
    - _Requirements: All_
  
  - [ ] 17.3 Implement test data cleanup
    - Create cleanup utilities for temporary test files
    - Implement automatic cleanup in test teardown
    - Create backup/restore utilities for test isolation
    - Implement test workspace reset functionality
    - _Requirements: All_

- [ ] 18. Error handling and edge case tests (Priority 3 - Nice to Have)
  - [ ] 18.1 Permission and access error tests
    - Test file operations with read-only files
    - Test directory creation with insufficient permissions
    - Test file deletion with locked files
    - Test operations on network drives with connectivity issues
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ] 18.2 Boundary condition tests
    - Test with empty workspace (no files)
    - Test with workspace containing only .kiro/ file (not directory)
    - Test with very long file paths (>260 chars on Windows)
    - Test with special characters in filenames (Unicode, emojis)
    - Test with circular symlinks in .kiro/steering/
    - _Requirements: All_
  
  - [ ] 18.3 Concurrent operation tests
    - Test simultaneous framework installations
    - Test concurrent file modifications
    - Test race conditions in metadata updates
    - Test file watcher with rapid file changes
    - _Requirements: All_
  
  - [ ] 18.4 Cross-platform compatibility tests
    - Test on Windows (path separators, line endings)
    - Test on macOS (case-sensitive vs case-insensitive filesystems)
    - Test on Linux (permissions, symlinks)
    - Test with different VS Code versions
    - _Requirements: All_

- [ ] 19. Security and validation tests (Priority 3 - Nice to Have)
  - [ ] 19.1 Input validation tests
    - Test malicious filenames (path traversal attempts)
    - Test injection attacks in search queries
    - Test XSS attempts in custom document names
    - Test buffer overflow with very large inputs
    - _Requirements: All_
  
  - [ ] 19.2 File integrity tests
    - Test framework content integrity after installation
    - Test metadata corruption detection and recovery
    - Test partial file write recovery
    - Test atomic operation guarantees
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.2, 4.3_

- [ ] 20. Test coverage reporting and quality gates (Priority 1 - Critical)
  - [ ] 20.1 Configure code coverage tools
    - Set up Istanbul/nyc for coverage reporting
    - Configure coverage thresholds in package.json (80% minimum)
    - Set up coverage reports in CI/CD pipeline
    - Configure coverage badges for README
    - _Requirements: All_
  
  - [ ] 20.2 Implement quality gates
    - Configure pre-commit hooks to run unit tests
    - Configure PR checks to require 80% coverage
    - Set up automated test execution in CI/CD
    - Configure test failure notifications
    - _Requirements: All_
  
  - [ ] 20.3 Create test documentation
    - Document test structure and organization
    - Create testing guidelines for contributors
    - Document how to run different test suites
    - Create troubleshooting guide for test failures
    - _Requirements: All_

## Testing Notes

- Tasks 13-20 focus on achieving comprehensive test coverage per testing-plan.md
- **Priority 1 (Critical):** Tasks 13, 14, 20 - Must complete for 80% coverage target
- **Priority 2 (Important):** Tasks 15, 16, 17 - Should complete for production readiness
- **Priority 3 (Nice to Have):** Tasks 18, 19 - Can defer but document as technical debt
- Unit tests should use Jest with mocked dependencies (target: 60% of test suite)
- Integration tests should be run in VS Code Extension Development Host (target: 30% of test suite)
- BDD tests should use Reqnroll/Cucumber with Playwright if needed (target: 10% of test suite)
- All tests must pass before merging to main branch
- Coverage reports must show 80% minimum before release
- Manual testing checklist should be completed before release

## Dependencies

- Task 2 must complete before Task 3 (file system needed for framework operations)
- Task 3 must complete before Task 4 (manifest needed for installation)
- Task 4 must complete before Task 5 (installation needed for browse command)
- Task 6 can be developed in parallel with Tasks 4-5
- Tasks 7-11 can be developed in any order after Task 6 completes
- Task 12 should be completed last

## Success Criteria

### Functionality
- Extension activates in < 500ms in Kiro workspaces
- All 8 strategy frameworks can be installed successfully
- Tree view displays all installed frameworks correctly
- Framework updates are detected and applied without data loss
- Custom steering documents can be created and managed
- Validation catches common issues with actionable feedback
- Workspace initialization completes in < 30 seconds
- Extension passes VS Code marketplace validation

### Test Coverage (Per testing-plan.md)
- **Overall code coverage:** 80% minimum (measured by Istanbul/nyc)
- **Unit tests:** 60% of test suite, covering:
  - FileSystemOperations: 90% coverage
  - FrameworkManager: 90% coverage
  - SteeringValidator: 85% coverage
  - TemplateEngine: 80% coverage
- **Integration tests:** 30% of test suite, covering:
  - All commands and user workflows
  - Tree view interactions
  - Extension activation scenarios
- **BDD tests:** 10% of test suite, covering:
  - All scenarios from testing-plan.md
  - End-to-end user workflows
- **Critical paths:** 100% coverage required:
  - Framework installation flow
  - Update detection and application
  - Workspace initialization
  - Validation logic

### Performance
- Extension activation: < 500ms
- Framework installation: < 1s
- Tree view refresh: < 200ms
- Validation execution: < 500ms
- Large document handling (>1MB): < 1s

### Quality Gates
- All unit tests pass
- All integration tests pass
- All BDD scenarios pass
- No critical or high-severity bugs
- Code coverage ≥ 80%
- No security vulnerabilities (critical/high)
- Cross-platform compatibility verified (Windows, macOS, Linux)
