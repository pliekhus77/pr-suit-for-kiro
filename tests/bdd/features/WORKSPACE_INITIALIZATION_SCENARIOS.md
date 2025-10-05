# Workspace Initialization BDD Scenarios

## Overview
This document describes the BDD scenarios for workspace initialization functionality, covering the creation of the `.kiro/` directory structure and installation of recommended frameworks.

## Feature File
`workspace-initialization.feature`

## Requirements Coverage
These scenarios cover Requirements 8.1-8.7 from the Framework Steering Management specification:

- **8.1**: Initialize `.kiro/` directory structure
- **8.2**: Create required subdirectories (steering, specs, settings, .metadata)
- **8.3**: Prompt for framework installation
- **8.4**: Install recommended frameworks
- **8.5**: Custom framework selection
- **8.6**: Welcome message with next steps
- **8.7**: Extension activation after initialization

## Scenarios

### 1. Initialize new Kiro workspace (Happy Path)
**Purpose**: Verify that a new workspace can be initialized with all required directories and recommended frameworks.

**Steps**:
1. Start with workspace without `.kiro/` directory
2. Execute "Initialize Workspace" command
3. Verify all directories are created (steering, specs, settings, .metadata)
4. Select "Yes" to install recommended frameworks
5. Verify recommended frameworks are installed:
   - strategy-tdd-bdd.md
   - strategy-c4-model.md
   - strategy-devops.md
   - strategy-4d-safe.md
6. Verify welcome message is shown
7. Verify extension is fully activated

**Expected Outcome**: Complete workspace initialization with recommended frameworks.

### 2. Initialize workspace with custom framework selection
**Purpose**: Verify that users can select specific frameworks during initialization.

**Steps**:
1. Start with workspace without `.kiro/` directory
2. Execute "Initialize Workspace" command
3. Select "Custom" when prompted for framework installation
4. Select specific frameworks from browser (TDD/BDD, Security)
5. Confirm selections
6. Verify only selected frameworks are installed

**Expected Outcome**: Workspace initialized with only user-selected frameworks.

### 3. Initialize workspace and skip framework installation
**Purpose**: Verify that users can initialize workspace without installing any frameworks.

**Steps**:
1. Start with workspace without `.kiro/` directory
2. Execute "Initialize Workspace" command
3. Select "Skip" when prompted for framework installation
4. Verify directory structure is created
5. Verify no framework files are installed

**Expected Outcome**: Workspace initialized with empty steering directory.

### 4. Attempt to initialize already initialized workspace (Failure Path)
**Purpose**: Verify that attempting to initialize an already initialized workspace is handled gracefully.

**Steps**:
1. Start with workspace that already has `.kiro/` directory
2. Execute "Initialize Workspace" command
3. Verify information message is shown
4. Verify no changes are made to existing structure

**Expected Outcome**: User is informed workspace is already initialized, no changes made.

### 5. Initialize workspace with frameworks/ directory option
**Purpose**: Verify that users can optionally initialize the frameworks/ directory for reference documentation.

**Steps**:
1. Start with workspace without `.kiro/` directory
2. Execute "Initialize Workspace" command
3. Complete directory structure creation
4. Select "Yes" when prompted to initialize frameworks/ directory
5. Verify frameworks/ directory is created in workspace root
6. Verify framework reference documents are copied

**Expected Outcome**: Workspace initialized with frameworks/ directory containing reference docs.

### 6. Initialize workspace in workspace with no write permissions (Edge Case)
**Purpose**: Verify that permission errors are handled gracefully with helpful guidance.

**Steps**:
1. Start with read-only workspace
2. Execute "Initialize Workspace" command
3. Verify error message about insufficient permissions
4. Verify no directories are created
5. Verify troubleshooting guidance is provided

**Expected Outcome**: Clear error message with troubleshooting guidance, no partial initialization.

## Test Data

### Recommended Frameworks
- `tdd-bdd-strategy` → strategy-tdd-bdd.md
- `c4-model-strategy` → strategy-c4-model.md
- `devops-strategy` → strategy-devops.md
- `4d-safe-strategy` → strategy-4d-safe.md

### Custom Framework Options
- TDD/BDD Testing Strategy
- Security Strategy (SABSA)
- C4 Model Architecture
- Azure Hosting Strategy
- DevOps CI/CD Strategy
- Infrastructure as Code (Pulumi)
- 4D SDLC + SAFe Work Management
- Enterprise Architecture (TOGAF/Zachman)

### Directory Structure
```
.kiro/
├── steering/       # Framework steering documents
├── specs/          # Feature specifications
├── settings/       # Extension settings (MCP, etc.)
└── .metadata/      # Extension metadata (installed frameworks, etc.)

frameworks/         # Optional: Framework reference documentation
```

## Step Definitions
`workspace-initialization.steps.ts`

### Key Step Patterns

**Given Steps** (Setup):
- `Given I have a workspace without .kiro/ directory`
- `Given I have a workspace with .kiro/ directory already present`
- `Given the workspace directory is read-only`

**When Steps** (Actions):
- `When I execute the "Initialize Workspace" command`
- `When I select "Yes|Custom|Skip"`
- `When I select "{framework}" from the browser`
- `When I confirm my selections`

**Then Steps** (Assertions):
- `Then the .kiro/ directory is created`
- `Then the .kiro/{subdirectory}/ directory is created`
- `Then strategy-{name}.md is installed in .kiro/steering/`
- `Then I see a welcome message with next steps`
- `Then the extension is fully activated`
- `Then I see an error message about insufficient permissions`

## Running the Tests

### Run all workspace initialization scenarios:
```bash
npm run test:bdd -- tests/bdd/features/workspace-initialization.feature
```

### Run specific scenario:
```bash
npm run test:bdd -- tests/bdd/features/workspace-initialization.feature:5
```

### Debug mode (with browser visible):
```bash
npm run test:bdd:debug -- tests/bdd/features/workspace-initialization.feature
```

## Dependencies

### Commands Tested
- `agentic-reviewer.initializeWorkspace`
- `agentic-reviewer.installFramework`

### VS Code APIs Used
- `vscode.workspace.workspaceFolders`
- `vscode.commands.executeCommand`
- `vscode.window.showInformationMessage`
- `vscode.window.showQuickPick`

### File System Operations
- Directory creation (recursive)
- File existence checks
- File content verification
- Permission handling

## Success Criteria

✅ All 6 scenarios pass  
✅ Happy path creates complete workspace structure  
✅ Custom selection installs only selected frameworks  
✅ Skip option creates structure without frameworks  
✅ Already initialized workspace is detected  
✅ Frameworks/ directory option works correctly  
✅ Permission errors are handled gracefully  
✅ All assertions verify expected state  
✅ No false positives or flaky tests  

## Notes

- Tests use the KiroWorld class for shared context
- File system operations are real (not mocked) for integration testing
- Tests clean up after themselves (remove .kiro/ directory)
- Permission testing is simulated (actual permission changes are platform-specific)
- Framework installation is tested through command execution
- Welcome messages and prompts are verified through assertions

## Related Documentation

- Requirements: `.kiro/specs/framework-steering-management/requirements.md` (Requirement 8)
- Design: `.kiro/specs/framework-steering-management/design.md`
- Testing Plan: `.kiro/specs/framework-steering-management/testing-plan.md`
- BDD Infrastructure: `tests/bdd/INFRASTRUCTURE.md`
- BDD Setup Guide: `tests/bdd/SETUP.md`
