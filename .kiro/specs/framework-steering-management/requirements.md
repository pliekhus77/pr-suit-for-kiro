# Requirements Document: Framework Steering Management

## Introduction

The Framework Steering Management feature enables developers to easily install, manage, and customize framework-based steering documents that guide Kiro's behavior. This feature is foundational to the Pragmatic Rhino SUIT extension, as it provides the mechanism for teams to adopt proven frameworks (DDD, TDD/BDD, C4 Model, SABSA, etc.) in their Kiro workflows.

Kiro already handles spec creation, task management, and workflow execution. However, developers currently must manually create and maintain steering documents in `.kiro/steering/` to influence Kiro's behavior. This feature provides a curated library of framework-based steering documents that can be installed with a single command, customized for team needs, and kept up-to-date as frameworks evolve.

## Requirements

### Requirement 1: Browse Framework Library

**User Story:** As a developer, I want to browse available framework steering documents, so that I can discover which frameworks are available to guide Kiro's behavior.

#### Acceptance Criteria

1. WHEN the user executes "Pragmatic Rhino SUIT: Browse Frameworks" command THEN the system SHALL display a quick pick list of available frameworks
2. WHEN the framework list is shown THEN it SHALL include categories: Architecture (C4 Model, DDD), Testing (TDD/BDD), Security (SABSA), DevOps, Cloud (Azure, AWS), Work Management (4D SDLC + SAFe)
3. WHEN a framework is selected THEN the system SHALL show a preview of the steering document with description and key concepts
4. WHEN viewing a framework preview THEN the system SHALL show options: "Install", "View Full Documentation", "Cancel"
5. WHEN "View Full Documentation" is selected THEN the system SHALL open the framework reference document from the `frameworks/` directory
6. WHEN frameworks are displayed THEN installed frameworks SHALL be indicated with a checkmark icon

### Requirement 2: Install Framework Steering Documents

**User Story:** As a developer, I want to install framework steering documents with a single command, so that Kiro automatically follows framework best practices without manual setup.

#### Acceptance Criteria

1. WHEN the user selects "Install" for a framework THEN the system SHALL copy the corresponding steering document to `.kiro/steering/`
2. WHEN a steering document is installed THEN it SHALL be named according to its category (e.g., `tech.md`, `strategy-tdd-bdd.md`, `strategy-security.md`)
3. IF the `.kiro/steering/` directory does not exist THEN the system SHALL create it before installing
4. IF a steering document with the same name already exists THEN the system SHALL prompt: "Overwrite", "Merge", "Keep Existing", "Cancel"
5. WHEN "Merge" is selected THEN the system SHALL combine existing content with new framework content and mark conflicts
6. WHEN installation completes THEN the system SHALL show a success notification with the file path
7. WHEN installation completes THEN the system SHALL offer to open the installed steering document

### Requirement 3: Steering Document Management Tree View

**User Story:** As a developer, I want to see all installed steering documents in a tree view, so that I can easily manage and navigate framework guidance.

#### Acceptance Criteria

1. WHEN the extension activates in a workspace with `.kiro/steering/` THEN the system SHALL display a "Framework Steering" tree view
2. WHEN the tree view loads THEN it SHALL categorize steering documents: Strategies (Installed), Project (Team-Created), Custom (Team-Created)
3. WHEN a steering document is clicked THEN the system SHALL open it in the editor
4. WHEN right-clicking a steering document THEN the system SHALL show options: "Open", "Update from Library", "Remove", "Reveal in File Explorer"
5. WHEN "Update from Library" is selected THEN the system SHALL check for newer versions and offer to update
6. WHEN no steering documents exist THEN the tree view SHALL show a "Browse Frameworks" button
7. WHEN hovering over a steering document THEN it SHALL show a tooltip with the framework name and last modified date

### Requirement 4: Framework Updates and Versioning

**User Story:** As a developer, I want to be notified when framework steering documents have updates, so that I can keep my guidance current with evolving best practices.

#### Acceptance Criteria

1. WHEN the extension activates THEN it SHALL check installed steering documents against the library versions
2. WHEN a newer version is available THEN the system SHALL show a notification: "Framework updates available"
3. WHEN the user clicks the notification THEN the system SHALL show a list of outdated steering documents with version numbers
4. WHEN viewing outdated documents THEN the system SHALL show a diff preview of changes
5. WHEN the user selects "Update" THEN the system SHALL replace the steering document with the new version
6. WHEN the user selects "Update All" THEN the system SHALL update all outdated steering documents
7. IF the user has customized a steering document THEN the system SHALL warn before overwriting and offer to create a backup
8. WHEN updates complete THEN the system SHALL show a summary of what changed

### Requirement 5: Custom Steering Document Creation

**User Story:** As a developer, I want to create custom steering documents for team-specific practices, so that I can extend framework guidance with our own standards.

#### Acceptance Criteria

1. WHEN the user executes "Pragmatic Rhino SUIT: Create Custom Steering" command THEN the system SHALL prompt for a document name
2. WHEN a name is provided THEN the system SHALL validate it follows kebab-case format
3. WHEN a valid name is provided THEN the system SHALL create a new markdown file in `.kiro/steering/` with a basic template
4. WHEN the template is created THEN it SHALL include sections: Purpose, Key Concepts, Best Practices, Anti-Patterns, Summary
5. WHEN the file is created THEN the system SHALL open it in the editor
6. WHEN the user saves a custom steering document THEN it SHALL appear in the tree view under "Custom" category
7. WHEN right-clicking a custom steering document THEN the system SHALL show options: "Open", "Rename", "Delete", "Export to Library"

### Requirement 6: Steering Document Validation

**User Story:** As a developer, I want to validate steering documents against quality standards, so that I ensure they provide clear, actionable guidance to Kiro.

#### Acceptance Criteria

1. WHEN the user executes "Pragmatic Rhino SUIT: Validate Steering Document" command THEN the system SHALL check the current document for required sections
2. WHEN validation runs THEN it SHALL verify the document has a clear Purpose section
3. WHEN validation runs THEN it SHALL check for actionable guidance (not just theory)
4. WHEN validation runs THEN it SHALL verify examples are provided for key concepts
5. WHEN validation runs THEN it SHALL check for consistent formatting (headings, lists, code blocks)
6. WHEN validation completes THEN the system SHALL show diagnostic markers for issues
7. WHEN all validations pass THEN the system SHALL show a success message
8. WHEN validation finds issues THEN the system SHALL provide quick fixes where possible

### Requirement 7: Framework Reference Integration

**User Story:** As a developer, I want quick access to framework reference documentation, so that I can understand the theory behind steering documents.

#### Acceptance Criteria

1. WHEN viewing a steering document THEN the system SHALL show a code lens "View Framework Reference" at the top
2. WHEN "View Framework Reference" is clicked THEN the system SHALL open the corresponding document from `frameworks/` directory
3. WHEN the `frameworks/` directory does not exist THEN the system SHALL offer to initialize it with default framework docs
4. WHEN hovering over framework-specific terms in steering documents THEN the system SHALL show tooltips with definitions
5. WHEN the user executes "Pragmatic Rhino SUIT: Search Frameworks" command THEN the system SHALL provide full-text search across all framework references
6. WHEN search results are shown THEN clicking a result SHALL open the framework document at the relevant section

### Requirement 8: Workspace Initialization

**User Story:** As a developer, I want to initialize a new Kiro workspace with recommended frameworks, so that I can start with best practices from day one.

#### Acceptance Criteria

1. WHEN the user executes "Pragmatic Rhino SUIT: Initialize Workspace" command in a non-Kiro workspace THEN the system SHALL create `.kiro/` directory structure
2. WHEN initializing THEN the system SHALL create directories: `.kiro/steering/`, `.kiro/specs/`, `.kiro/settings/`, `frameworks/`
3. WHEN directories are created THEN the system SHALL prompt: "Install recommended frameworks?"
4. WHEN "Yes" is selected THEN the system SHALL install recommended strategy files: strategy-tdd-bdd.md, strategy-c4-model.md, strategy-devops.md, strategy-4d-safe.md
5. WHEN "Custom" is selected THEN the system SHALL show the framework browser for manual selection
6. WHEN initialization completes THEN the system SHALL show a welcome message with next steps
7. WHEN initialization completes THEN the extension SHALL fully activate and show all features

## Success Criteria

- Developers can install a framework steering document in under 15 seconds
- 100% of installed steering documents are properly formatted and validated
- Tree view provides clear visibility into all installed frameworks and their status
- Framework updates are detected and applied without losing customizations
- Workspace initialization sets up recommended frameworks in under 30 seconds
- Custom steering documents follow the same quality standards as library documents
- Extension only activates in Kiro workspaces or offers initialization for new workspaces
