Feature: Framework Installation
  As a developer using Kiro
  I want to browse and install framework steering documents
  So that Kiro follows best practices without manual setup

  Background:
    Given I have a Kiro workspace open

  Scenario: Browse and install a framework (Happy Path)
    When I execute the "Browse Frameworks" command
    Then I see a list of available frameworks grouped by category
    When I select "TDD/BDD Testing Strategy"
    Then I see a preview with description and key concepts
    When I click "Install"
    Then the strategy-tdd-bdd.md file is created in .kiro/steering/
    And I see a success notification
    And the framework shows a checkmark in the browser

  Scenario: Install framework with conflict (Failure Path)
    Given strategy-tdd-bdd.md already exists in .kiro/steering/
    When I try to install "TDD/BDD Testing Strategy"
    Then I am prompted with options: "Overwrite", "Merge", "Keep Existing", "Cancel"
    When I select "Overwrite"
    Then the existing file is backed up
    And the new framework content is written
    And I see a success notification
