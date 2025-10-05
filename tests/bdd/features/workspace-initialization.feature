Feature: Workspace Initialization
  As a developer starting a new project
  I want to initialize a Kiro workspace with recommended frameworks
  So that I can start with best practices from day one

  Scenario: Initialize new Kiro workspace (Happy Path)
    Given I have a workspace without .kiro/ directory
    When I execute the "Initialize Workspace" command
    Then the .kiro/ directory is created
    And the .kiro/steering/ directory is created
    And the .kiro/specs/ directory is created
    And the .kiro/settings/ directory is created
    And the .kiro/.metadata/ directory is created
    And I am prompted "Install recommended frameworks?"
    When I select "Yes"
    Then strategy-tdd-bdd.md is installed in .kiro/steering/
    And strategy-c4-model.md is installed in .kiro/steering/
    And strategy-devops.md is installed in .kiro/steering/
    And strategy-4d-safe.md is installed in .kiro/steering/
    And I see a welcome message with next steps
    And the extension is fully activated

  Scenario: Initialize workspace with custom framework selection
    Given I have a workspace without .kiro/ directory
    When I execute the "Initialize Workspace" command
    And I am prompted "Install recommended frameworks?"
    When I select "Custom"
    Then I see the framework browser
    When I select "TDD/BDD Testing Strategy" from the browser
    And I select "Security Strategy" from the browser
    And I confirm my selections
    Then strategy-tdd-bdd.md is installed in .kiro/steering/
    And strategy-security.md is installed in .kiro/steering/
    And I see a welcome message with next steps

  Scenario: Initialize workspace and skip framework installation
    Given I have a workspace without .kiro/ directory
    When I execute the "Initialize Workspace" command
    And I am prompted "Install recommended frameworks?"
    When I select "Skip"
    Then the .kiro/ directory structure is created
    But no framework files are installed
    And I see a welcome message with next steps

  Scenario: Attempt to initialize already initialized workspace (Failure Path)
    Given I have a workspace with .kiro/ directory already present
    When I execute the "Initialize Workspace" command
    Then I see an information message "Workspace is already initialized"
    And no changes are made to the existing structure

  Scenario: Initialize workspace with frameworks/ directory option
    Given I have a workspace without .kiro/ directory
    When I execute the "Initialize Workspace" command
    And I complete the directory structure creation
    Then I am prompted "Initialize frameworks/ directory for reference docs?"
    When I select "Yes"
    Then the frameworks/ directory is created in the workspace root
    And framework reference documents are copied to frameworks/

  Scenario: Initialize workspace in workspace with no write permissions (Edge Case)
    Given I have a workspace without .kiro/ directory
    And the workspace directory is read-only
    When I execute the "Initialize Workspace" command
    Then I see an error message about insufficient permissions
    And no directories are created
    And I am provided with troubleshooting guidance
