Feature: Custom Steering Document Management
  As a developer using Kiro
  I want to create and validate custom steering documents
  So that I can extend framework guidance with team-specific practices

  Background:
    Given I have a Kiro workspace open

  Scenario: Create custom steering document (Happy Path)
    When I execute the "Create Custom Steering" command
    And I enter the name "team-standards"
    Then a file "custom-team-standards.md" is created in .kiro/steering/
    And the file contains the standard template sections
    And the file opens in the editor
    And I see the file in the tree view under "Custom" category

  Scenario: Create custom steering with invalid name (Failure Path)
    When I execute the "Create Custom Steering" command
    And I enter the name "Team Standards"
    Then I see an error "Name must be in kebab-case format"
    And no file is created

  Scenario: Create custom steering with special characters (Edge Case)
    When I execute the "Create Custom Steering" command
    And I enter the name "team@standards!"
    Then I see an error "Name must be in kebab-case format"
    And no file is created

  Scenario: Validate steering document with all required sections (Happy Path)
    Given I have a custom steering document with all required sections
    When I execute the "Validate Steering Document" command
    Then I see a success message "Validation passed"
    And no diagnostic issues are shown

  Scenario: Validate steering document missing required sections (Failure Path)
    Given I have a custom steering document missing "Purpose" section
    When I execute the "Validate Steering Document" command
    Then I see diagnostic errors for missing sections
    And the error highlights the missing "Purpose" section
    And I see a quick fix suggestion to add the missing section

  Scenario: Validate steering document with poor content quality (Edge Case)
    Given I have a custom steering document with only theoretical content
    When I execute the "Validate Steering Document" command
    Then I see warnings about lack of actionable guidance
    And I see warnings about missing examples
    And I see suggestions to improve content quality

  Scenario: Validate steering document with formatting issues (Edge Case)
    Given I have a custom steering document with inconsistent heading levels
    When I execute the "Validate Steering Document" command
    Then I see warnings about formatting issues
    And I see suggestions to fix heading hierarchy

  Scenario: Rename custom steering document (Happy Path)
    Given I have a custom steering document "custom-old-name.md"
    When I right-click the document in the tree view
    And I select "Rename" from the context menu
    And I enter the new name "new-name"
    Then the file is renamed to "custom-new-name.md"
    And the tree view is refreshed
    And I see the renamed file in the tree view

  Scenario: Delete custom steering document (Happy Path)
    Given I have a custom steering document "custom-to-delete.md"
    When I right-click the document in the tree view
    And I select "Delete" from the context menu
    And I confirm the deletion
    Then the file is deleted from .kiro/steering/
    And the tree view is refreshed
    And the file is no longer visible in the tree view

  Scenario: Validate empty steering document (Edge Case)
    Given I have an empty custom steering document
    When I execute the "Validate Steering Document" command
    Then I see errors for all missing required sections
    And I see a suggestion to use the template

  Scenario: Validate very large steering document (Performance)
    Given I have a custom steering document larger than 1MB
    When I execute the "Validate Steering Document" command
    Then validation completes in less than 1 second
    And I see validation results

  Scenario: Create custom steering with existing name (Edge Case)
    Given I have a custom steering document "custom-existing.md"
    When I execute the "Create Custom Steering" command
    And I enter the name "existing"
    Then I see a warning "File already exists"
    And I am offered options: "Overwrite", "Choose different name", "Cancel"
    When I select "Choose different name"
    Then I am prompted to enter a new name
