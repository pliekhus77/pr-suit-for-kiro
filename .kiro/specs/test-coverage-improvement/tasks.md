# Implementation Plan

## Test Infrastructure Setup

- [ ] 1. Create comprehensive VS Code API mocks
  - Create `tests/mocks/vscode-mocks.ts` with complete VS Code API mocking
  - Include MockWindow, MockWorkspace, MockCommands, MockLanguages interfaces
  - Add mock implementations for showInformationMessage, showInputBox, showQuickPick, createTreeView
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1_

- [ ] 2. Set up test fixtures and helpers
  - Create `tests/fixtures/workspace/` with mock workspace structure including .kiro/steering/ and frameworks/
  - Create `tests/fixtures/steering-documents/` with sample steering documents for testing
  - Create `tests/helpers/extension-helpers.ts` with createMockContext, setupExtensionMocks functions
  - Create `tests/helpers/command-helpers.ts` with simulateCommand, verifyCommandRegistration functions
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

## Extension Lifecycle Tests (0% → 90% Coverage)

- [ ] 3. Create extension activation unit tests
  - Create `src/__tests__/extension.test.ts` for extension lifecycle testing
  - Test service initialization (FrameworkManager, SteeringValidator, FrameworkReferenceManager)
  - Test command registration for all 15+ commands
  - Test tree view provider registration (SteeringTreeProvider)
  - Test language feature provider registration (CodeLens, Hover)
  - Test file system watcher setup
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4. Test extension activation performance and error handling
  - Test activation timing with warning for >500ms activation
  - Test welcome message display on first activation and global state management
  - Test activation error scenarios (service initialization failures)
  - Test deactivation cleanup without errors
  - _Requirements: 1.6, 1.7, 1.8_

- [ ] 5. Create extension integration tests
  - Create `src/test/suite/extension-lifecycle.integration.test.ts`
  - Test full activation/deactivation cycle in VS Code environment
  - Test command registration verification in VS Code
  - Test tree view provider functionality in VS Code
  - _Requirements: 5.1, 5.2, 5.3_

## Steering Commands Tests (0% → 85% Coverage)

- [ ] 6. Create steering commands unit tests
  - Create comprehensive tests in `src/commands/__tests__/steering-commands.test.ts` (currently exists but may need expansion)
  - Test createCustomSteeringCommand: document name validation (kebab-case), template generation, file creation, editor opening
  - Test validateDocumentName function with valid/invalid inputs, length checks, hyphen validation
  - Test generateCustomSteeringTemplate function for proper template structure
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 7. Test steering rename and delete operations
  - Test renameCustomSteeringCommand: custom document validation, name validation, file operations, editor updates
  - Test deleteCustomSteeringCommand: custom document validation, confirmation dialog, file deletion
  - Test error handling for non-custom documents, file already exists scenarios
  - _Requirements: 2.5, 2.6, 2.7, 2.8, 2.9_

- [ ] 8. Test steering validation functionality
  - Test validateSteeringCommand: document validation, diagnostics creation, user feedback
  - Test validation with active editor checks, markdown file validation, .kiro/steering/ path validation
  - Test diagnostic collection management and error/warning display
  - _Requirements: 2.10, 2.11_

## Workspace Commands Tests (0% → 85% Coverage)

- [ ] 9. Create workspace commands unit tests
  - Create comprehensive tests in `src/commands/__tests__/workspace-commands.test.ts` (currently missing)
  - Test searchFrameworksCommand: frameworks directory existence check, initialization prompt
  - Test search query validation for minimum length and empty input
  - Test search results display in quick pick and file opening at correct line
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 10. Test framework reference operations
  - Test viewFrameworkReferenceCommand: reference manager integration, error handling
  - Test framework operations failure scenarios with appropriate error messages
  - _Requirements: 3.6, 3.7_

## Framework Commands Coverage Improvement (71% → 85%)

- [ ] 11. Improve framework commands test coverage
  - Expand existing `src/commands/__tests__/framework-commands.test.ts`
  - Add missing branch coverage for error handling paths
  - Test edge cases in framework installation, updates, and browsing
  - Test user cancellation scenarios and timeout handling
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

## Integration Tests Enhancement

- [ ] 12. Create comprehensive integration tests
  - Expand `src/test/suite/` integration tests for file system operations
  - Test real VS Code workspace interactions for steering and framework operations
  - Test user interaction simulation for command execution
  - _Requirements: 5.4, 5.5_

## Coverage Validation and Quality Assurance

- [ ] 13. Implement coverage validation
  - Update Jest configuration to enforce 80% minimum coverage
  - Add coverage reporting for critical paths (100% target)
  - Configure coverage thresholds for lines, statements, functions, and branches
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 14. Final testing and validation
  - Run full test suite and verify all coverage targets are met
  - Validate that all requirements are covered by implemented tests
  - Update test documentation and ensure all tests are properly documented
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_