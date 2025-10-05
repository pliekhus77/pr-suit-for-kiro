Feature: Framework Management
  As a developer using Kiro
  I want to view and manage installed framework steering documents
  So that I can keep my guidance up-to-date and organized

  Background:
    Given I have a Kiro workspace open

  Scenario: View installed frameworks in tree view (Happy Path)
    Given I have installed strategy-tdd-bdd.md and strategy-security.md
    When I open the "Framework Steering" tree view
    Then I see "Strategies (Installed)" category
    And I see "strategy-tdd-bdd.md" under Strategies
    And I see "strategy-security.md" under Strategies
    When I click on "strategy-tdd-bdd.md"
    Then the file opens in the editor

  Scenario: Update outdated framework (Happy Path)
    Given I have strategy-tdd-bdd.md version 1.0.0 installed
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
    Given I have strategy-tdd-bdd.md installed and customized
    When I try to update the framework
    Then I see a warning "This framework has been customized"
    And I am offered options: "Update (lose changes)", "Create backup and update", "Cancel"
    When I select "Create backup and update"
    Then a backup file is created (strategy-tdd-bdd.md.backup)
    And the framework is updated
    And I see a notification with backup location
